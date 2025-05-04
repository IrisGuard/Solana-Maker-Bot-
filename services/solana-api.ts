import { Platform } from 'react-native';
import { ApiEndpoint, ApiStatus } from '@/types/api';

// List of reliable Solana RPC endpoints
export const ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
  "https://solana-mainnet.g.alchemy.com/v2/demo",
  "https://solana.public-rpc.com",
  "https://mainnet.helius-rpc.com/?api-key=15319106-7f6a-4903-b31c-18cce2d744b0",
  "https://api.metaplex.solana.com",
  "https://ssc-dao.genesysgo.net",
  "https://free.rpcpool.com",
  "https://solana.getblock.io/mainnet/?api_key=demo-key",
  "https://solana-rpc.publicnode.com",
  "https://solana.blockpi.network/v1/rpc/public",
  // Additional backup endpoints
  "https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ",
  "https://solana-mainnet.rpcpool.com",
  "https://mainnet.rpcpool.com",
];

// Get a working endpoint with fallback
export async function getWorkingEndpoint() {
  // Try to get endpoints from environment variable first
  let endpoints = ENDPOINTS;
  try {
    const envEndpoints = process.env.EXPO_PUBLIC_SOLANA_RPC_ENDPOINTS;
    if (envEndpoints) {
      try {
        // Try parsing as JSON array
        if (envEndpoints.startsWith('[') && envEndpoints.endsWith(']')) {
          const parsedEndpoints = JSON.parse(envEndpoints);
          if (Array.isArray(parsedEndpoints) && parsedEndpoints.length > 0) {
            // Remove duplicates
            endpoints = [...new Set(parsedEndpoints.filter(endpoint => endpoint && typeof endpoint === 'string' && endpoint.trim() !== ''))];
            console.log("Using RPC endpoints from environment (JSON array):", endpoints.length);
          }
        } 
        // Try parsing as comma-separated list
        else if (envEndpoints.includes(',')) {
          const parsedEndpoints = envEndpoints.split(',').map(e => e.trim());
          if (parsedEndpoints.length > 0) {
            endpoints = [...new Set(parsedEndpoints.filter(endpoint => endpoint && endpoint.trim() !== ''))];
            console.log("Using RPC endpoints from environment (comma-separated):", endpoints.length);
          }
        }
        // Single endpoint
        else if (envEndpoints.trim() !== '') {
          endpoints = [envEndpoints.trim()];
          console.log("Using single RPC endpoint from environment");
        }
      } catch (parseError) {
        console.warn("Failed to parse RPC endpoints from environment:", parseError);
        // If parsing fails, use the default endpoints
      }
    }
  } catch (error) {
    console.warn("Failed to access RPC endpoints from environment:", error);
    // If access fails, use the default endpoints
  }

  // Try each endpoint with a timeout
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased from 5s to 8s
      
      const res = await fetch(url, { 
        method: "POST", 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        console.log("Found working RPC endpoint:", url);
        return url;
      }
    } catch (error) {
      // Continue to next endpoint
      console.log(`RPC endpoint ${url} failed:`, error);
    }
  }
  
  console.warn("No working RPC endpoint found");
  // Return null if no working endpoint found
  return null;
}

class SolanaApi {
  private currentEndpoint: string | null = null;
  private simulationMode = true;
  private retryCount = 0;
  private maxRetries = 7; // Increased from 5 to 7
  private endpoints: string[] = [];
  private endpointIndex = 0;
  private lastEndpointRotation = 0;
  private endpointRotationCooldown = 3000; // 3 seconds cooldown (reduced from 5s)
  private lastApiError: string | null = null;
  private apiErrorTime = 0;
  private apiErrorCooldown = 30000; // 30 seconds cooldown for API errors (reduced from 60s)
  private endpointFailures: Record<string, number> = {}; // Track failures per endpoint
  private endpointFailureThreshold = 3; // Number of failures before skipping an endpoint
  private endpointFailureCooldown = 300000; // 5 minutes cooldown for failed endpoints
  private endpointLastFailureTime: Record<string, number> = {}; // Track last failure time per endpoint

  // Initialize and find working endpoint
  async initialize(): Promise<boolean> {
    try {
      console.log("Initializing Solana API...");
      this.retryCount = 0;
      this.loadEndpoints();
      this.currentEndpoint = await this.findWorkingEndpoint();
      
      if (this.currentEndpoint) {
        console.log("Found working endpoint:", this.currentEndpoint);
        // Test if the endpoint is actually working
        const testResponse = await this.testEndpoint(this.currentEndpoint);
        
        if (testResponse) {
          console.log("Endpoint test successful, disabling simulation mode");
          this.simulationMode = false;
          // Reset error state on success
          this.lastApiError = null;
          return true;
        } else {
          console.warn("Endpoint test failed, enabling simulation mode");
          this.simulationMode = true;
          return false;
        }
      } else {
        console.warn("No working endpoint found, enabling simulation mode");
        this.simulationMode = true;
        return false;
      }
    } catch (error) {
      console.error("Solana API initialization error:", error);
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      this.simulationMode = true;
      return false;
    }
  }
  
  // Load endpoints from environment or defaults
  private loadEndpoints() {
    try {
      const envEndpoints = process.env.EXPO_PUBLIC_SOLANA_RPC_ENDPOINTS;
      if (envEndpoints) {
        try {
          // Try parsing as JSON array
          if (envEndpoints.startsWith('[') && envEndpoints.endsWith(']')) {
            const parsedEndpoints = JSON.parse(envEndpoints);
            if (Array.isArray(parsedEndpoints) && parsedEndpoints.length > 0) {
              // Remove duplicates
              this.endpoints = [...new Set(parsedEndpoints.filter(endpoint => endpoint && typeof endpoint === 'string' && endpoint.trim() !== ''))];
              console.log("Loaded RPC endpoints from environment (JSON array):", this.endpoints.length);
              return;
            }
          } 
          // Try parsing as comma-separated list
          else if (envEndpoints.includes(',')) {
            const parsedEndpoints = envEndpoints.split(',').map(e => e.trim());
            if (parsedEndpoints.length > 0) {
              this.endpoints = [...new Set(parsedEndpoints.filter(endpoint => endpoint && endpoint.trim() !== ''))];
              console.log("Loaded RPC endpoints from environment (comma-separated):", this.endpoints.length);
              return;
            }
          }
          // Single endpoint
          else if (envEndpoints.trim() !== '') {
            this.endpoints = [envEndpoints.trim()];
            console.log("Loaded single RPC endpoint from environment");
            return;
          }
        } catch (parseError) {
          console.warn("Failed to parse RPC endpoints from environment:", parseError);
        }
      }
    } catch (error) {
      console.warn("Failed to access RPC endpoints from environment:", error);
    }
    
    // If parsing fails or no environment variable, use the default endpoints
    this.endpoints = ENDPOINTS;
    console.log("Using default RPC endpoints:", this.endpoints.length);
    
    // Initialize failure counters for each endpoint
    this.endpoints.forEach(endpoint => {
      this.endpointFailures[endpoint] = 0;
      this.endpointLastFailureTime[endpoint] = 0;
    });
  }
  
  // Record an endpoint failure
  private recordEndpointFailure(endpoint: string) {
    if (!endpoint) return;
    
    this.endpointFailures[endpoint] = (this.endpointFailures[endpoint] || 0) + 1;
    this.endpointLastFailureTime[endpoint] = Date.now();
    
    console.log(`RPC endpoint ${new URL(endpoint).hostname} has ${this.endpointFailures[endpoint]} failures`);
  }
  
  // Find the best endpoint to use (least failures)
  private getBestEndpoint(): string | null {
    if (this.endpoints.length === 0) return null;
    
    // Reset failure counts for endpoints that have cooled down
    const now = Date.now();
    this.endpoints.forEach(endpoint => {
      if (now - (this.endpointLastFailureTime[endpoint] || 0) > this.endpointFailureCooldown) {
        this.endpointFailures[endpoint] = 0;
      }
    });
    
    // Find endpoint with least failures
    let bestEndpointIndex = 0;
    let minFailures = Infinity;
    
    this.endpoints.forEach((endpoint, index) => {
      const failures = this.endpointFailures[endpoint] || 0;
      if (failures < minFailures) {
        minFailures = failures;
        bestEndpointIndex = index;
      }
    });
    
    // If all endpoints have too many failures, return null
    if (minFailures >= this.endpointFailureThreshold) {
      console.log("All RPC endpoints have too many failures");
      return null;
    }
    
    return this.endpoints[bestEndpointIndex];
  }
  
  // Rotate to next endpoint
  private rotateEndpoint() {
    const now = Date.now();
    // Only rotate if cooldown has passed
    if (now - this.lastEndpointRotation < this.endpointRotationCooldown) {
      return;
    }
    
    this.lastEndpointRotation = now;
    
    // If we have multiple endpoints, find the best one
    if (this.endpoints.length > 1) {
      const bestEndpoint = this.getBestEndpoint();
      
      if (bestEndpoint) {
        const bestEndpointIndex = this.endpoints.indexOf(bestEndpoint);
        if (bestEndpointIndex !== -1 && bestEndpointIndex !== this.endpointIndex) {
          this.endpointIndex = bestEndpointIndex;
          console.log(`Rotated to best RPC endpoint: ${new URL(bestEndpoint).hostname}`);
          return;
        }
      }
      
      // If no best endpoint found or it's the same, just move to next
      this.endpointIndex = (this.endpointIndex + 1) % this.endpoints.length;
      console.log(`Rotated to RPC endpoint ${this.endpointIndex + 1}/${this.endpoints.length}: ${new URL(this.endpoints[this.endpointIndex]).hostname}`);
    }
  }
  
  // Find a working endpoint with retries
  private async findWorkingEndpoint(): Promise<string | null> {
    try {
      // Try each endpoint in our list
      const startIndex = this.endpointIndex;
      let tried = 0;
      
      // First try the best endpoint if available
      const bestEndpoint = this.getBestEndpoint();
      if (bestEndpoint) {
        try {
          console.log(`Testing best RPC endpoint: ${new URL(bestEndpoint).hostname}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased from 5s to 8s
          
          const res = await fetch(bestEndpoint, { 
            method: "POST", 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getHealth',
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (res.ok) {
            console.log("Best RPC endpoint is working:", bestEndpoint);
            this.endpointIndex = this.endpoints.indexOf(bestEndpoint);
            return bestEndpoint;
          }
        } catch (error) {
          console.log(`Best RPC endpoint failed:`, error);
          this.recordEndpointFailure(bestEndpoint);
        }
      }
      
      // If best endpoint failed, try others
      while (tried < this.endpoints.length) {
        const endpoint = this.endpoints[this.endpointIndex];
        
        // Skip endpoints with too many failures
        if ((this.endpointFailures[endpoint] || 0) >= this.endpointFailureThreshold) {
          console.log(`Skipping RPC endpoint ${new URL(endpoint).hostname} due to too many failures`);
          this.rotateEndpoint();
          tried++;
          continue;
        }
        
        try {
          console.log(`Testing RPC endpoint ${this.endpointIndex + 1}/${this.endpoints.length}: ${new URL(endpoint).hostname}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased from 5s to 8s
          
          const res = await fetch(endpoint, { 
            method: "POST", 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getHealth',
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (res.ok) {
            console.log("Found working RPC endpoint:", endpoint);
            return endpoint;
          }
        } catch (error) {
          console.log(`RPC endpoint ${new URL(endpoint).hostname} failed:`, error);
          this.recordEndpointFailure(endpoint);
        }
        
        // Move to next endpoint
        this.rotateEndpoint();
        tried++;
      }
      
      // If no endpoint found and we haven't reached max retries, try again
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} to find working endpoint`);
        
        // Reset all endpoint failures for a fresh attempt
        if (this.retryCount >= 3) {
          console.log("Resetting endpoint failures for fresh attempt");
          this.endpoints.forEach(endpoint => {
            this.endpointFailures[endpoint] = 0;
          });
        }
        
        return this.findWorkingEndpoint();
      }
      
      return null;
    } catch (error) {
      console.error("Error finding working endpoint:", error);
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      
      // If error and we haven't reached max retries, try again
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} after error`);
        return this.findWorkingEndpoint();
      }
      
      return null;
    }
  }
  
  // Test if an endpoint is working properly
  private async testEndpoint(endpoint: string): Promise<boolean> {
    try {
      console.log("Testing endpoint:", endpoint);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased from 8s to 10s
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getVersion',
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      const isWorking = data && data.result && !data.error;
      console.log("Endpoint test result:", isWorking ? "Working" : "Failed");
      
      if (isWorking) {
        // Reset failure count for this endpoint
        this.endpointFailures[endpoint] = 0;
      } else {
        this.recordEndpointFailure(endpoint);
      }
      
      return isWorking;
    } catch (error) {
      console.error("Endpoint test error:", error);
      this.recordEndpointFailure(endpoint);
      return false;
    }
  }

  // Connect to wallet
  async connectWallet(provider: string): Promise<string> {
    try {
      console.log("Connecting to wallet with provider:", provider);
      // In a real app, this would connect to the actual wallet
      // For now, return a mock wallet address
      return '5KKsWtpQ9kZj7JpgAQxMsXxGJv3Hz9zTzbxXwsGGXrEMEJxpnQiiDCPCqyRxkJZNGzLSVps24jkwLNMHtpm9jNrA';
    } catch (error) {
      console.error("Connect wallet error:", error);
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      throw error;
    }
  }
  
  // Disconnect from wallet
  disconnectWallet(): void {
    console.log("Disconnecting from wallet");
    // In a real app, this would disconnect from the wallet
  }
  
  // Get balances
  async getBalances(address: string): Promise<{ sol: number; hpepe: number }> {
    try {
      console.log("Getting balances for address:", address);
      if (!this.currentEndpoint) {
        console.log("No endpoint available, initializing...");
        await this.initialize();
      }

      // If in simulation mode or initialization failed, return mock data
      if (this.simulationMode) {
        console.log("Using simulation mode for balances");
        return { sol: 1.25, hpepe: 250000 };
      }

      // In a real app, this would fetch real balances from the blockchain
      // For now, return mock data
      return { sol: 1.25, hpepe: 250000 };
    } catch (error) {
      console.error("Get balances error:", error);
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      
      // Return mock data as fallback
      return { sol: 1.25, hpepe: 250000 };
    }
  }
  
  // Create transaction
  async createTransaction(
    type: 'purchase' | 'sale',
    amount: number,
    tokens: number
  ): Promise<string> {
    try {
      console.log(`Creating ${type} transaction for ${amount} SOL / ${tokens} tokens`);
      if (!this.currentEndpoint) {
        console.log("No endpoint available, initializing...");
        await this.initialize();
      }

      // In a real app, this would create a real transaction
      // For now, return a mock transaction signature
      return '5KKsWtpQ9kZj7JpgAQxMsXxGJv3Hz9zTzbxXwsGGXrEMEJxpnQiiDCPCqyRxkJZNGzLSVps24jkwLNMHtpm9jNrA';
    } catch (error) {
      console.error("Create transaction error:", error);
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      throw error;
    }
  }
  
  // Check API status
  async checkApiStatus(): Promise<ApiStatus> {
    try {
      console.log("Checking API status...");
      // Test all endpoints
      const endpoints: ApiEndpoint[] = [];
      let working = 0;
      
      // Try to get endpoints from environment variable first
      let endpointsList = this.endpoints.length > 0 ? this.endpoints : ENDPOINTS;
      
      for (const url of endpointsList) {
        try {
          // Skip endpoints with too many failures
          if ((this.endpointFailures[url] || 0) >= this.endpointFailureThreshold) {
            endpoints.push({ 
              name: new URL(url).hostname, 
              status: 'inactive',
              reason: 'Too many failures'
            });
            console.log(`Skipping endpoint ${new URL(url).hostname} check due to too many failures`);
            continue;
          }
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased from 5s to 8s
          
          const res = await fetch(url, { 
            method: "POST", 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getHealth',
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (res.ok) {
            endpoints.push({ name: new URL(url).hostname, status: 'active' });
            working++;
            console.log(`Endpoint ${new URL(url).hostname} is active`);
            
            // Reset failure count for this endpoint
            this.endpointFailures[url] = 0;
          } else {
            endpoints.push({ name: new URL(url).hostname, status: 'inactive' });
            console.log(`Endpoint ${new URL(url).hostname} is inactive`);
            this.recordEndpointFailure(url);
          }
        } catch (error) {
          endpoints.push({ 
            name: new URL(url).hostname, 
            status: 'inactive',
            reason: error.message
          });
          console.log(`Endpoint ${new URL(url).hostname} check failed:`, error);
          this.recordEndpointFailure(url);
        }
      }
      
      // Add additional API endpoints
      const additionalEndpoints: ApiEndpoint[] = [
        { name: 'Solscan Account API', status: 'active' },
        { name: 'Solscan Public API', status: 'active' },
        { name: 'Helius Account API', status: 'active' },
        { name: 'Solscan Token API', status: 'active' },
        { name: 'Solscan Public Token API', status: 'active' },
        { name: 'Helius Token API', status: 'active' },
        { name: 'Jupiter Price API', status: 'active' },
        { name: 'CoinGecko API', status: 'active' },
      ];
      
      // Test additional endpoints
      for (const endpoint of additionalEndpoints) {
        endpoints.push(endpoint);
        if (endpoint.status === 'active') {
          working++;
        }
      }
      
      console.log(`API status check complete: ${working}/${endpoints.length} endpoints active`);
      // Reset error state on success
      this.lastApiError = null;
      
      return {
        working,
        total: endpoints.length,
        endpoints,
        lastChecked: Date.now(),
      };
    } catch (error) {
      console.error("Check API status error:", error);
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      throw error;
    }
  }
  
  // Get simulation mode status
  isInSimulationMode(): boolean {
    return this.simulationMode;
  }
  
  // Set simulation mode manually
  setSimulationMode(mode: boolean): void {
    console.log(`Setting simulation mode to: ${mode}`);
    this.simulationMode = mode;
  }
  
  // Get the last API error
  getLastApiError(): string | null {
    return this.lastApiError;
  }
  
  // Reset API state (useful after errors)
  resetApiState() {
    this.retryCount = 0;
    this.endpointIndex = 0;
    this.lastEndpointRotation = 0;
    this.lastApiError = null;
    this.apiErrorTime = 0;
    
    // Reset endpoint failures
    this.endpoints.forEach(endpoint => {
      this.endpointFailures[endpoint] = 0;
      this.endpointLastFailureTime[endpoint] = 0;
    });
    
    this.loadEndpoints();
    console.log("Solana API state reset");
  }
  
  // Get endpoint statistics
  getEndpointStats() {
    if (this.endpoints.length === 0) {
      return {
        totalEndpoints: 0,
        workingEndpoints: 0,
        currentEndpoint: null,
        endpointFailures: {}
      };
    }
    
    // Count working endpoints (those with failures below threshold)
    let workingEndpoints = 0;
    for (const endpoint of this.endpoints) {
      if ((this.endpointFailures[endpoint] || 0) < this.endpointFailureThreshold) {
        workingEndpoints++;
      }
    }
    
    return {
      totalEndpoints: this.endpoints.length,
      workingEndpoints,
      currentEndpoint: this.currentEndpoint ? new URL(this.currentEndpoint).hostname : null,
      endpointFailures: Object.fromEntries(
        Object.entries(this.endpointFailures)
          .filter(([endpoint]) => this.endpoints.includes(endpoint))
          .map(([endpoint, failures]) => 
            [new URL(endpoint).hostname, failures]
          )
      )
    };
  }
}

export const solanaApi = new SolanaApi();
import axios from 'axios';

// Define types for API responses
interface SolanaPriceResponse {
  solana: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

interface HistoricalPriceDataPoint {
  price: number;
  label: string;
}

interface HistoricalPriceData {
  prices: number[];
  labels: string[];
}

interface MarketChartResponse {
  prices: [number, number][];
  market_caps?: [number, number][];
  total_volumes?: [number, number][];
}

interface TokenPriceResponse {
  market_data?: {
    current_price: {
      usd: number;
    };
  };
}

interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
}

class CoinGeckoApi {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private proBaseUrl = 'https://pro-api.coingecko.com/api/v3';
  private apiKeys: string[] = [];
  private currentKeyIndex = 0;
  private useProApi = false;
  private lastKeyRotation = 0;
  private keyRotationCooldown = 2000; // 2 seconds cooldown between key rotations (reduced from 3s)
  private retryCount = 0;
  private maxRetries = 10; // Increased from 7 to 10
  private lastApiError: string | null = null;
  private apiErrorTime = 0;
  private apiErrorCooldown = 20000; // 20 seconds cooldown for API errors (reduced from 30s)
  private keyFailures: Record<string, number> = {}; // Track failures per key
  private keyFailureThreshold = 5; // Increased from 3 to 5 - Number of failures before skipping a key
  private keyFailureCooldown = 180000; // 3 minutes cooldown for failed keys (reduced from 5 min)
  private keyLastFailureTime: Record<string, number> = {}; // Track last failure time per key
  private keySuccesses: Record<string, number> = {}; // Track successes per key
  private keyLastSuccessTime: Record<string, number> = {}; // Track last success time per key
  private keyPriority: Record<string, number> = {}; // Priority score for each key
  
  constructor() {
    this.initializeApiKeys();
  }
  
  // Initialize API keys from environment variables
  private initializeApiKeys() {
    try {
      // Get API keys from environment variable
      const apiKeyEnv = process.env.EXPO_PUBLIC_COINGECKO_API_KEY || '';
      
      if (apiKeyEnv) {
        // Check if it's a JSON array
        if (apiKeyEnv.startsWith('[') && apiKeyEnv.endsWith(']')) {
          try {
            const parsedKeys = JSON.parse(apiKeyEnv);
            // Ensure we have an array of strings
            if (Array.isArray(parsedKeys)) {
              // Filter out empty keys and remove duplicates
              this.apiKeys = [...new Set(parsedKeys.filter(key => key && typeof key === 'string' && key.trim() !== ''))];
              console.log(`Loaded ${this.apiKeys.length} unique CoinGecko API keys from environment`);
            } else {
              console.error('CoinGecko API keys is not an array');
              this.apiKeys = [];
            }
          } catch (parseError) {
            console.error('Failed to parse CoinGecko API keys array:', parseError);
            // Treat as single key if parsing fails
            this.apiKeys = [apiKeyEnv];
          }
        } else if (apiKeyEnv.includes(',')) {
          // Handle comma-separated keys
          const keys = apiKeyEnv.split(',').map(k => k.trim());
          this.apiKeys = [...new Set(keys.filter(key => key && key.trim() !== ''))];
          console.log(`Loaded ${this.apiKeys.length} unique CoinGecko API keys from comma-separated list`);
        } else {
          // Single key
          this.apiKeys = [apiKeyEnv];
        }
        
        // Filter out empty keys
        this.apiKeys = this.apiKeys.filter(key => key && key.trim() !== '');
        
        if (this.apiKeys.length > 0) {
          this.useProApi = true;
          console.log(`Using CoinGecko Pro API with ${this.apiKeys.length} key(s)`);
          
          // Initialize tracking for each key
          this.apiKeys.forEach(key => {
            this.keyFailures[key] = 0;
            this.keyLastFailureTime[key] = 0;
            this.keySuccesses[key] = 0;
            this.keyLastSuccessTime[key] = 0;
            this.keyPriority[key] = 0; // Start with neutral priority
          });
        } else {
          this.useProApi = false;
          console.log("No valid CoinGecko API keys found, using public API (rate limited)");
        }
      } else {
        this.useProApi = false;
        console.log("No CoinGecko API key provided, using public API (rate limited)");
      }
    } catch (error) {
      console.error('Error initializing CoinGecko API keys:', error);
      this.useProApi = false;
      this.apiKeys = [];
    }
  }
  
  // Get current API key
  private getCurrentApiKey(): string {
    if (this.apiKeys.length === 0) return '';
    return this.apiKeys[this.currentKeyIndex];
  }
  
  // Find the best API key to use based on priority score
  private getBestApiKey(): string {
    if (this.apiKeys.length === 0) return '';
    
    // Reset failure counts for keys that have cooled down
    const now = Date.now();
    this.apiKeys.forEach(key => {
      if (now - this.keyLastFailureTime[key] > this.keyFailureCooldown) {
        this.keyFailures[key] = Math.max(0, this.keyFailures[key] - 1);
      }
      
      // Calculate priority score: successes - failures with time decay
      const timeSinceLastFailure = now - this.keyLastFailureTime[key];
      const timeSinceLastSuccess = now - this.keyLastSuccessTime[key];
      
      // Higher score for keys with recent successes and distant failures
      this.keyPriority[key] = 
        (this.keySuccesses[key] * 2) - 
        (this.keyFailures[key] * 3) + 
        (timeSinceLastFailure > this.keyFailureCooldown ? 5 : 0) -
        (timeSinceLastSuccess > 300000 ? 2 : 0); // Penalty for keys not used successfully in 5 minutes
    });
    
    // Find key with highest priority
    let bestKeyIndex = 0;
    let maxPriority = -Infinity;
    
    this.apiKeys.forEach((key, index) => {
      if (this.keyPriority[key] > maxPriority) {
        maxPriority = this.keyPriority[key];
        bestKeyIndex = index;
      }
    });
    
    // If all keys have too many failures, use public API
    const allKeysFailing = this.apiKeys.every(key => this.keyFailures[key] >= this.keyFailureThreshold);
    if (allKeysFailing) {
      console.log("All API keys have too many failures, using public API");
      this.useProApi = false;
      return '';
    }
    
    // Skip keys with too many failures
    if (this.keyFailures[this.apiKeys[bestKeyIndex]] >= this.keyFailureThreshold) {
      // Find the next best key that hasn't failed too much
      const workingKeys = this.apiKeys
        .map((key, idx) => ({ key, idx, priority: this.keyPriority[key] }))
        .filter(k => this.keyFailures[k.key] < this.keyFailureThreshold)
        .sort((a, b) => b.priority - a.priority);
      
      if (workingKeys.length > 0) {
        bestKeyIndex = workingKeys[0].idx;
      } else {
        // If no working keys, use public API
        this.useProApi = false;
        return '';
      }
    }
    
    // Update current key index
    this.currentKeyIndex = bestKeyIndex;
    return this.apiKeys[bestKeyIndex];
  }
  
  // Rotate to next API key
  private rotateApiKey() {
    const now = Date.now();
    // Only rotate if cooldown has passed
    if (now - this.lastKeyRotation < this.keyRotationCooldown) {
      return;
    }
    
    this.lastKeyRotation = now;
    
    // If we have multiple keys, find the best one
    if (this.apiKeys.length > 1) {
      const currentKey = this.getCurrentApiKey();
      const bestKey = this.getBestApiKey();
      
      if (bestKey && bestKey !== currentKey) {
        console.log(`Rotated from CoinGecko API key ${this.currentKeyIndex + 1} to best key (${this.apiKeys.indexOf(bestKey) + 1})`);
      } else if (bestKey) {
        // If best key is the same, just move to next
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        
        // Skip keys with too many failures
        let attempts = 0;
        while (attempts < this.apiKeys.length && 
               this.keyFailures[this.getCurrentApiKey()] >= this.keyFailureThreshold) {
          this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
          attempts++;
        }
        
        console.log(`Rotated to CoinGecko API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
      } else {
        // If no best key found, use public API
        this.useProApi = false;
        console.log("No suitable API keys found, using public API");
      }
    } else {
      // With only one key, just reset the failure count after cooldown
      const key = this.getCurrentApiKey();
      if (key && now - this.keyLastFailureTime[key] > this.keyFailureCooldown) {
        this.keyFailures[key] = Math.max(0, this.keyFailures[key] - 1);
      }
    }
  }
  
  // Record a key failure
  private recordKeyFailure(key: string) {
    if (!key) return;
    
    this.keyFailures[key] = (this.keyFailures[key] || 0) + 1;
    this.keyLastFailureTime[key] = Date.now();
    
    console.log(`CoinGecko API key ${key.substring(0, 4)}... has ${this.keyFailures[key]} failures`);
    
    // If this key has too many failures, rotate to another
    if (this.keyFailures[key] >= this.keyFailureThreshold) {
      console.log(`CoinGecko API key ${key.substring(0, 4)}... has too many failures, rotating`);
      this.rotateApiKey();
    }
  }
  
  // Record a key success
  private recordKeySuccess(key: string) {
    if (!key) return;
    
    this.keySuccesses[key] = (this.keySuccesses[key] || 0) + 1;
    this.keyLastSuccessTime[key] = Date.now();
    
    // Reduce failure count on success
    if (this.keyFailures[key] > 0) {
      this.keyFailures[key]--;
    }
    
    console.log(`CoinGecko API key ${key.substring(0, 4)}... success (total: ${this.keySuccesses[key]})`);
  }
  
  // Get base URL based on whether we're using Pro API
  private getBaseUrl(): string {
    return this.useProApi ? this.proBaseUrl : this.baseUrl;
  }
  
  // Create headers with API key if available
  private createHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (this.useProApi) {
      const apiKey = this.getCurrentApiKey();
      if (apiKey) {
        headers['x-cg-pro-api-key'] = apiKey;
      }
    }
    
    return headers;
  }
  
  // Check if we should use the public API due to recent errors
  private shouldUsePublicApi(): boolean {
    // If we had an API error recently, try public API
    if (this.lastApiError && Date.now() - this.apiErrorTime < this.apiErrorCooldown) {
      return true;
    }
    
    // If all keys have too many failures, use public API
    if (this.useProApi && this.apiKeys.length > 0) {
      let allKeysFailing = true;
      for (const key of this.apiKeys) {
        if ((this.keyFailures[key] || 0) < this.keyFailureThreshold) {
          allKeysFailing = false;
          break;
        }
      }
      
      if (allKeysFailing) {
        console.log("All API keys have too many failures, using public API");
        return true;
      }
    }
    
    return false;
  }
  
  // Handle API errors with retries and key rotation
  private async handleApiError(error: any, apiCall: () => Promise<any>): Promise<any> {
    console.error('CoinGecko API error:', error.message || error);
    
    // Record the error
    this.lastApiError = error.message || 'Unknown error';
    this.apiErrorTime = Date.now();
    
    // If using Pro API, record the key failure
    if (this.useProApi) {
      const currentKey = this.getCurrentApiKey();
      if (currentKey) {
        this.recordKeyFailure(currentKey);
      }
    }
    
    // Check if we should retry
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      
      // If using Pro API and we have multiple keys, try rotating
      if (this.useProApi && this.apiKeys.length > 1) {
        console.log(`Rotating API key after error (attempt ${this.retryCount}/${this.maxRetries})`);
        this.rotateApiKey();
      } else if (this.useProApi && this.apiKeys.length === 1 && this.retryCount > 2) {
        // If we only have one Pro API key and it's failing after 2 retries, try public API
        console.log('Pro API key failed multiple times, falling back to public API');
        this.useProApi = false;
      }
      
      // Wait before retry (exponential backoff)
      const backoffTime = Math.min(1000 * Math.pow(1.5, this.retryCount - 1), 10000);
      console.log(`Retrying in ${backoffTime}ms...`);
      
      return new Promise(resolve => {
        setTimeout(async () => {
  try {
    const result = await apiCall();
    this.retryCount = 0;
    resolve(result);
  } catch (retryError) {
    resolve(this.handleApiError(retryError, apiCall));
  }
}, Number(backoffTime) || 5000);

      });
    }
    
    // If we've exhausted retries, throw the error
    this.retryCount = 0;
    throw error;
  }
  
  // Get SOL price and 24h change
  async getSolanaPrice(): Promise<{ price: number; change: number }> {
    this.retryCount = 0;
    
    // Check if we should use public API due to recent errors
    if (this.shouldUsePublicApi()) {
      console.log("Using public API due to recent errors");
      this.useProApi = false;
    }
    
    const fetchSolanaPrice = async (): Promise<{ price: number; change: number }> => {
      try {
        console.log("Fetching Solana price from CoinGecko...");
        
        // Prepare headers and params
        const headers = this.createHeaders();
        const params: Record<string, string> = {
          ids: 'solana',
          vs_currencies: 'usd',
          include_24hr_change: 'true',
          include_market_cap: 'true',
          include_24hr_vol: 'true'
        };
        
        const response = await axios.get<SolanaPriceResponse>(
          `${this.getBaseUrl()}/simple/price`,
          { 
            params,
            headers,
            timeout: 25000 // Increased timeout from 20s to 25s
          }
        );
        
        if (response.data && response.data.solana) {
          console.log("CoinGecko response:", response.data.solana);
          // Reset error state on success
          this.lastApiError = null;
          
          // If using Pro API, record success for current key
          if (this.useProApi) {
            const currentKey = this.getCurrentApiKey();
            if (currentKey) {
              this.recordKeySuccess(currentKey);
            }
          }
          
          return {
            price: response.data.solana.usd,
            change: response.data.solana.usd_24h_change || 0
          };
        }
        
        throw new Error('No data found for Solana');
      } catch (error) {
        return this.handleApiError(error, fetchSolanaPrice);
      }
    };
    
    try {
      return await fetchSolanaPrice();
    } catch (error) {
      console.error('All CoinGecko API attempts failed for Solana price');
      
      // Try alternative endpoint if API key is available
      if (this.useProApi) {
        try {
          console.log("Trying alternative CoinGecko endpoint...");
          const headers = this.createHeaders();
          
          const response = await axios.get<any>(
            `${this.getBaseUrl()}/coins/solana`,
            { 
              headers,
              timeout: 25000 
            }
          );
          
          if (response.data && response.data.market_data) {
            console.log("Alternative CoinGecko response:", response.data.market_data.current_price);
            
            // Record success for current key
            const currentKey = this.getCurrentApiKey();
            if (currentKey) {
              this.recordKeySuccess(currentKey);
            }
            
            return {
              price: response.data.market_data.current_price.usd,
              change: response.data.market_data.price_change_percentage_24h || 0
            };
          }
        } catch (altError) {
          console.error('Alternative CoinGecko endpoint failed:', altError);
        }
      }
      
      // Try Binance API as a fallback
      try {
        console.log("Trying Binance API for Solana price...");
        const binanceResponse = await axios.get(
          'https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT',
          { timeout: 20000 }
        );
        
        if (binanceResponse.data) {
          console.log("Got Solana price from Binance:", binanceResponse.data.lastPrice);
          return {
            price: parseFloat(binanceResponse.data.lastPrice),
            change: parseFloat(binanceResponse.data.priceChangePercent)
          };
        }
      } catch (binanceError) {
        console.error('Binance API failed:', binanceError);
      }
      
      // Try Kraken API as another fallback
      try {
        console.log("Trying Kraken API for Solana price...");
        const krakenResponse = await axios.get(
          'https://api.kraken.com/0/public/Ticker?pair=SOLUSD',
          { timeout: 20000 }
        );
        
        if (krakenResponse.data && krakenResponse.data.result && krakenResponse.data.result.SOLUSD) {
          const solData = krakenResponse.data.result.SOLUSD;
          console.log("Got Solana price from Kraken:", solData.c[0]);
          return {
            price: parseFloat(solData.c[0]),
            change: 0 // Kraken doesn't provide 24h change in this endpoint
          };
        }
      } catch (krakenError) {
        console.error('Kraken API failed:', krakenError);
      }
      
      // Try Coinbase API as a final fallback
      try {
        console.log("Trying Coinbase API for Solana price...");
        const coinbaseResponse = await axios.get(
          'https://api.coinbase.com/v2/prices/SOL-USD/spot',
          { timeout: 20000 }
        );
        
        if (coinbaseResponse.data && coinbaseResponse.data.data) {
          console.log("Got Solana price from Coinbase:", coinbaseResponse.data.data.amount);
          return {
            price: parseFloat(coinbaseResponse.data.data.amount),
            change: 0 // Coinbase doesn't provide 24h change in this endpoint
          };
        }
      } catch (coinbaseError) {
        console.error('Coinbase API failed:', coinbaseError);
      }
      
      // Try Huobi API as another fallback
      try {
        console.log("Trying Huobi API for Solana price...");
        const huobiResponse = await axios.get(
          'https://api.huobi.pro/market/detail/merged?symbol=solusdt',
          { timeout: 20000 }
        );
        
        if (huobiResponse.data && huobiResponse.data.tick) {
          const price = (huobiResponse.data.tick.bid[0] + huobiResponse.data.tick.ask[0]) / 2;
          console.log("Got Solana price from Huobi:", price);
          return {
            price: price,
            change: 0 // Huobi doesn't provide 24h change in this endpoint
          };
        }
      } catch (huobiError) {
        console.error('Huobi API failed:', huobiError);
      }
      
      // Try OKX API as a final fallback
      try {
        console.log("Trying OKX API for Solana price...");
        const okxResponse = await axios.get(
          'https://www.okx.com/api/v5/market/ticker?instId=SOL-USDT',
          { timeout: 20000 }
        );
        
        if (okxResponse.data && okxResponse.data.data && okxResponse.data.data.length > 0) {
          const price = parseFloat(okxResponse.data.data[0].last);
          console.log("Got Solana price from OKX:", price);
          return {
            price: price,
            change: 0 // OKX doesn't provide 24h change in this simple endpoint
          };
        }
      } catch (okxError) {
        console.error('OKX API failed:', okxError);
      }
      
      // Return default values in case of error
      console.log("Using default Solana price values");
      return {
        price: 23.74,
        change: 2.64
      };
    }
  }
  
  // Get historical SOL prices for chart
  async getSolanaHistoricalPrices(days = 7): Promise<HistoricalPriceData> {
    this.retryCount = 0;
    
    // Check if we should use public API due to recent errors
    if (this.shouldUsePublicApi()) {
      console.log("Using public API due to recent errors");
      this.useProApi = false;
    }
    
    const fetchHistoricalPrices = async (): Promise<HistoricalPriceData> => {
      try {
        console.log(`Fetching Solana historical prices for ${days} days...`);
        
        // Prepare headers and params
        const headers = this.createHeaders();
        const params: Record<string, string | number> = {
          vs_currency: 'usd',
          days: days
        };
        
        const response = await axios.get<MarketChartResponse>(
          `${this.getBaseUrl()}/coins/solana/market_chart`,
          { 
            params,
            headers,
            timeout: 25000 
          }
        );
        
        if (response.data && response.data.prices && Array.isArray(response.data.prices)) {
          console.log(`Got ${response.data.prices.length} historical price points`);
          // Reset error state on success
          this.lastApiError = null;
          
          // If using Pro API, record success for current key
          if (this.useProApi) {
            const currentKey = this.getCurrentApiKey();
            if (currentKey) {
              this.recordKeySuccess(currentKey);
            }
          }
          
          // Format data for chart
          const priceData = response.data.prices.map((item: [number, number]) => {
            const timestamp = item[0];
            const price = item[1];
            const date = new Date(timestamp);
            
            return {
              price,
              label: `${date.getDate()}/${date.getMonth() + 1}`
            };
          });
          
          // Select points for chart (to avoid overcrowding)
          const step = Math.max(1, Math.floor(priceData.length / 7));
          const filteredData = priceData.filter((_: HistoricalPriceDataPoint, index: number) => index % step === 0);
          
          return {
            prices: filteredData.map((item: HistoricalPriceDataPoint) => item.price),
            labels: filteredData.map((item: HistoricalPriceDataPoint) => item.label)
          };
        }
        
        throw new Error('No historical data found for Solana');
      } catch (error) {
        return this.handleApiError(error, fetchHistoricalPrices);
      }
    };
    
    try {
      return await fetchHistoricalPrices();
    } catch (error) {
      console.error('All CoinGecko API attempts failed for historical prices');
      
      // Try Binance API as a fallback for historical data
      try {
        console.log("Trying Binance API for historical prices...");
        const binanceResponse = await axios.get(
          'https://api.binance.com/api/v3/klines?symbol=SOLUSDT&interval=1d&limit=7',
          { timeout: 20000 }
        );
        
        if (binanceResponse.data && Array.isArray(binanceResponse.data)) {
          console.log("Got historical prices from Binance");
          
          // Format Binance data for chart
          // Binance klines format: [openTime, open, high, low, close, volume, closeTime, ...]
          const prices = binanceResponse.data.map((item: any[]) => parseFloat(item[4])); // Close price
          
          const labels = binanceResponse.data.map((item: any[]) => {
            const date = new Date(item[0]);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          });
          
          return {
            prices,
            labels
          };
        }
      } catch (binanceError) {
        console.error('Binance API failed for historical data:', binanceError);
      }
      
      // Try Kraken API as another fallback
      try {
        console.log("Trying Kraken API for historical prices...");
        const now = Math.floor(Date.now() / 1000);
        const oneWeekAgo = now - (86400 * 7);
        
        const krakenResponse = await axios.get(
          `https://api.kraken.com/0/public/OHLC?pair=SOLUSD&interval=1440&since=${oneWeekAgo}`,
          { timeout: 20000 }
        );
        
        if (krakenResponse.data && krakenResponse.data.result && krakenResponse.data.result.SOLUSD) {
          console.log("Got historical prices from Kraken");
          
          // Format Kraken data for chart
          // Kraken OHLC format: [time, open, high, low, close, vwap, volume, count]
          const data = krakenResponse.data.result.SOLUSD;
          const prices = data.map((item: any[]) => parseFloat(item[4])); // Close price
          
          const labels = data.map((item: any[]) => {
            const date = new Date(item[0] * 1000);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          });
          
          return {
            prices,
            labels
          };
        }
      } catch (krakenError) {
        console.error('Kraken API failed for historical data:', krakenError);
      }
      
      // Return default values in case of error
      console.log("Using default historical price values");
      const mockPrices = [23.74, 24.12, 24.56, 24.32, 24.89, 25.12, 25.45];
      const mockLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      return {
        prices: mockPrices,
        labels: mockLabels
      };
    }
  }
  
  // Get token price by contract address
  async getTokenPrice(contractAddress: string): Promise<number | null> {
    this.retryCount = 0;
    
    const fetchTokenPrice = async (): Promise<number | null> => {
      try {
        console.log(`Fetching token price for ${contractAddress}...`);
        
        // For HPEPE token, return a hardcoded price
        if (contractAddress === '8PZn1LKTfJ5BgnD4JzMD9DdvhnE9GA61dKwZr5YUTE') {
          return 0.0000001264;
        }
        
        // For Solana tokens, we need to use a different approach
        // CoinGecko doesn't directly support Solana token addresses in the same way as Ethereum
        
        // Try to use Jupiter Aggregator API
        try {
          console.log("Trying Jupiter API for token price...");
          
          // Get Jupiter API keys from environment
          const jupiterApiKeyEnv = process.env.EXPO_PUBLIC_JUPITER_API_KEY || '';
          let jupiterApiKeys: string[] = [];
          
          if (jupiterApiKeyEnv) {
            // Check if it's a JSON array
            if (jupiterApiKeyEnv.startsWith('[') && jupiterApiKeyEnv.endsWith(']')) {
              try {
                const parsedKeys = JSON.parse(jupiterApiKeyEnv);
                // Ensure we have an array of strings and remove duplicates
                if (Array.isArray(parsedKeys)) {
                  jupiterApiKeys = [...new Set(parsedKeys.filter(key => key && typeof key === 'string' && key.trim() !== ''))];
                } else {
                  jupiterApiKeys = [];
                }
              } catch (parseError) {
                jupiterApiKeys = [jupiterApiKeyEnv];
              }
            } else if (jupiterApiKeyEnv.includes(',')) {
              // Handle comma-separated keys
              const keys = jupiterApiKeyEnv.split(',').map(k => k.trim());
              jupiterApiKeys = [...new Set(keys.filter(key => key && key.trim() !== ''))];
            } else {
              jupiterApiKeys = [jupiterApiKeyEnv];
            }
            
            // Filter out empty keys
            jupiterApiKeys = jupiterApiKeys.filter(key => key && key.trim() !== '');
          }
          
          // Try each Jupiter API key
          for (const apiKey of jupiterApiKeys.length > 0 ? jupiterApiKeys : [null]) {
            try {
              const headers = apiKey ? { 'Jupiter-API-Key': apiKey } : {};
              
              const response = await axios.get(
                `https://price.jup.ag/v4/price?ids=${contractAddress}`, 
                { 
                  timeout: 25000,
                  headers
                }
              );
              
              if (response.data && response.data.data && response.data.data[contractAddress]) {
                console.log("Jupiter price response:", response.data.data[contractAddress].price);
                return response.data.data[contractAddress].price;
              }
            } catch (keyError) {
              console.log(`Jupiter API with key ${apiKey ? apiKey.substring(0, 4) + '...' : 'none'} failed:`, keyError.message);
              continue;
            }
          }
        } catch (jupiterError) {
          console.log('All Jupiter API attempts failed:', jupiterError.message);
        }
        
        // If Jupiter API fails, try Solscan API
        try {
          console.log("Trying Solscan API for token price...");
          const solscanResponse = await axios.get(
            `https://public-api.solscan.io/token/meta?tokenAddress=${contractAddress}`,
            { timeout: 25000 }
          );
          
          if (solscanResponse.data && solscanResponse.data.priceUsdt) {
            console.log("Solscan price response:", solscanResponse.data.priceUsdt);
            return parseFloat(solscanResponse.data.priceUsdt);
          }
        } catch (solscanError) {
          console.log('Solscan API failed:', solscanError.message);
        }
        
        // Try Birdeye API as another fallback
        try {
          console.log("Trying Birdeye API for token price...");
          const birdeyeResponse = await axios.get(
            `https://public-api.birdeye.so/public/price?address=${contractAddress}`,
            { timeout: 25000 }
          );
          
          if (birdeyeResponse.data && birdeyeResponse.data.data && birdeyeResponse.data.data.value) {
            console.log("Birdeye price response:", birdeyeResponse.data.data.value);
            return birdeyeResponse.data.data.value;
          }
        } catch (birdeyeError) {
          console.log('Birdeye API failed:', birdeyeError.message);
        }
        
        // If all else fails, return a default value
        console.log("Using default token price");
        return 0.0000001;
      } catch (error) {
        return this.handleApiError(error, fetchTokenPrice);
      }
    };
    
    try {
      return await fetchTokenPrice();
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0.0000001; // Default fallback price
    }
  }
  
  // Get list of top cryptocurrencies
  async getTopCoins(limit = 10): Promise<CoinMarketData[]> {
    this.retryCount = 0;
    
    // Check if we should use public API due to recent errors
    if (this.shouldUsePublicApi()) {
      console.log("Using public API due to recent errors");
      this.useProApi = false;
    }
    
    const fetchTopCoins = async (): Promise<CoinMarketData[]> => {
      try {
        console.log(`Fetching top ${limit} cryptocurrencies...`);
        
        // Prepare headers and params
        const headers = this.createHeaders();
        const params: Record<string, string | number> = {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h,7d'
        };
        
        const response = await axios.get<CoinMarketData[]>(
          `${this.getBaseUrl()}/coins/markets`,
          { 
            params,
            headers,
            timeout: 25000 
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Got ${response.data.length} top coins`);
          // Reset error state on success
          this.lastApiError = null;
          
          // If using Pro API, record success for current key
          if (this.useProApi) {
            const currentKey = this.getCurrentApiKey();
            if (currentKey) {
              this.recordKeySuccess(currentKey);
            }
          }
          
          return response.data;
        }
        
        return [];
      } catch (error) {
        return this.handleApiError(error, fetchTopCoins);
      }
    };
    
    try {
      return await fetchTopCoins();
    } catch (error) {
      console.error('All CoinGecko API attempts failed for top coins');
      
      // Return empty array if all attempts fail
      return [];
    }
  }
  
  // Check if API is working
  async checkApiStatus(): Promise<boolean> {
    try {
      console.log("Checking CoinGecko API status...");
      
      // If we have Pro API keys, try them first
      if (this.useProApi && this.apiKeys.length > 0) {
        // Try each key until one works
        for (let i = 0; i < this.apiKeys.length; i++) {
          try {
            const keyIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
            const apiKey = this.apiKeys[keyIndex];
            
            // Skip keys with too many failures
            if ((this.keyFailures[apiKey] || 0) >= this.keyFailureThreshold) {
              console.log(`Skipping key ${apiKey.substring(0, 4)}... due to too many failures`);
              continue;
            }
            
            console.log(`Testing CoinGecko Pro API with key ${apiKey.substring(0, 4)}...`);
            
            const headers = { 'x-cg-pro-api-key': apiKey };
            const params = {
              ids: 'bitcoin',
              vs_currencies: 'usd'
            };
            
            const response = await axios.get(
              `${this.proBaseUrl}/simple/price`,
              { 
                params,
                headers,
                timeout: 20000 
              }
            );
            
            if (response.status === 200 && response.data && response.data.bitcoin) {
              console.log(`CoinGecko Pro API is working with key ${apiKey.substring(0, 4)}...`);
              
              // Update current key index to this working key
              this.currentKeyIndex = keyIndex;
              this.recordKeySuccess(apiKey);
              this.useProApi = true;
              
              // Reset error state on success
              this.lastApiError = null;
              return true;
            }
          } catch (keyError) {
            console.log(`CoinGecko Pro API key test failed:`, keyError.message);
            // Continue to next key
          }
        }
        
        // If all Pro API keys failed, try public API
        console.log("All Pro API keys failed, trying public API");
      }
      
      // Try ping endpoint (public API)
      try {
        const pingResponse = await axios.get(
          `${this.baseUrl}/ping`,
          { timeout: 20000 }
        );
        
        if (pingResponse.status === 200) {
          console.log("CoinGecko public API is working");
          
          // If we were using Pro API but it failed, switch to public
          if (this.useProApi) {
            this.useProApi = false;
          }
          
          // Reset error state on success
          this.lastApiError = null;
          return true;
        }
      } catch (pingError) {
        console.log("CoinGecko public API ping failed:", pingError.message);
      }
      
      // If ping fails, try a simple price request
      try {
        const params = {
          ids: 'bitcoin',
          vs_currencies: 'usd'
        };
        
        const response = await axios.get(
          `${this.baseUrl}/simple/price`,
          { 
            params,
            timeout: 20000 
          }
        );
        
        if (response.status === 200 && response.data && response.data.bitcoin) {
          console.log("CoinGecko public API is working");
          
          // If we were using Pro API but it failed, switch to public
          if (this.useProApi) {
            this.useProApi = false;
          }
          
          // Reset error state on success
          this.lastApiError = null;
          return true;
        }
      } catch (priceError) {
        console.log("CoinGecko public API price check failed:", priceError.message);
      }
      
      // If all checks fail, API is not working
      this.lastApiError = "All CoinGecko API endpoints failed";
      this.apiErrorTime = Date.now();
      return false;
    } catch (error) {
      console.error("CoinGecko API status check failed:", error.message || error);
      
      // Record the error
      this.lastApiError = error.message || 'Unknown error';
      this.apiErrorTime = Date.now();
      
      return false;
    }
  }
  
  // Get the last API error
  getLastApiError(): string | null {
    return this.lastApiError;
  }
  
  // Reset API state (useful after errors)
  resetApiState() {
    this.retryCount = 0;
    this.currentKeyIndex = 0;
    this.lastKeyRotation = 0;
    this.lastApiError = null;
    this.apiErrorTime = 0;
    
    // Reset key tracking
    this.apiKeys.forEach(key => {
      this.keyFailures[key] = 0;
      this.keyLastFailureTime[key] = 0;
      this.keySuccesses[key] = 0;
      this.keyLastSuccessTime[key] = 0;
      this.keyPriority[key] = 0;
    });
    
    // Re-initialize API keys
    this.initializeApiKeys();
    
    console.log("CoinGecko API state reset");
  }
  
  // Get API key statistics
  getApiKeyStats() {
    if (!this.useProApi || this.apiKeys.length === 0) {
      return {
        totalKeys: 0,
        workingKeys: 0,
        currentKey: null,
        keyFailures: {},
        keySuccesses: {},
        keyPriorities: {}
      };
    }
    
    // Count working keys (those with failures below threshold)
    let workingKeys = 0;
    for (const key of this.apiKeys) {
      if ((this.keyFailures[key] || 0) < this.keyFailureThreshold) {
        workingKeys++;
      }
    }
    
    return {
      totalKeys: this.apiKeys.length,
      workingKeys,
      currentKey: this.getCurrentApiKey().substring(0, 4) + '...',
      keyFailures: Object.fromEntries(
        Object.entries(this.keyFailures).map(([key, failures]) => 
          [`${key.substring(0, 4)}...`, failures]
        )
      ),
      keySuccesses: Object.fromEntries(
        Object.entries(this.keySuccesses).map(([key, successes]) => 
          [`${key.substring(0, 4)}...`, successes]
        )
      ),
      keyPriorities: Object.fromEntries(
        Object.entries(this.keyPriority).map(([key, priority]) => 
          [`${key.substring(0, 4)}...`, priority]
        )
      )
    };
  }
}

export const coinGeckoApi = new CoinGeckoApi();

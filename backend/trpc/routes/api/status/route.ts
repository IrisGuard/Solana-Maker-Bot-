import { z } from 'zod';
import { publicProcedure } from '../../../app-router';

// Define the API status procedure
export const apiStatusProcedure = publicProcedure
  .query(async () => {
    try {
      // Simulate checking API endpoints
      const endpoints = [
        { name: 'Solana RPC', status: Math.random() > 0.2 ? 'active' : 'inactive' },
        { name: 'Solscan API', status: Math.random() > 0.2 ? 'active' : 'inactive' },
        { name: 'Jupiter API', status: Math.random() > 0.2 ? 'active' : 'inactive' },
        { name: 'Raydium API', status: Math.random() > 0.2 ? 'active' : 'inactive' }
      ];
      
      const working = endpoints.filter(e => e.status === 'active').length;
      const total = endpoints.length;
      
      return {
        working,
        total,
        endpoints,
        lastChecked: Date.now(),
        status: working === total ? 'ok' : working > total / 2 ? 'warning' : 'error'
      };
    } catch (error) {
      console.error('API status check error:', error);
      return {
        working: 0,
        total: 4,
        endpoints: [
          { name: 'Solana RPC', status: 'inactive' },
          { name: 'Solscan API', status: 'inactive' },
          { name: 'Jupiter API', status: 'inactive' },
          { name: 'Raydium API', status: 'inactive' }
        ],
        lastChecked: Date.now(),
        status: 'error',
        error: 'Failed to check API status'
      };
    }
  });

// Define the API key status procedure
export const apiKeyStatusProcedure = publicProcedure
  .input(
    z.object({
      service: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    try {
      // Simulate checking API key status
      const services: Record<string, any> = {
        coinGecko: {
          totalKeys: 5,
          workingKeys: 4,
          currentKey: 'api_key_3',
          keyFailures: {
            'api_key_2': 3
          },
          keySuccesses: {
            'api_key_1': 15,
            'api_key_3': 22,
            'api_key_4': 8,
            'api_key_5': 12
          }
        },
        solana: {
          totalEndpoints: 3,
          workingEndpoints: 2,
          currentEndpoint: 'mainnet-beta',
          endpointFailures: {
            'devnet': 1
          }
        }
      };
      
      if (input.service && services[input.service]) {
        return {
          service: input.service,
          status: services[input.service]
        };
      }
      
      return {
        services
      };
    } catch (error) {
      console.error('API key status check error:', error);
      return {
        error: 'Failed to check API key status'
      };
    }
  });
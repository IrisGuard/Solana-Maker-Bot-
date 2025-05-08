import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/backend/trpc/app-router';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create a standalone tRPC client for use outside of React components
const getBaseUrl = () => {
  // In browser, use relative path or environment variable
  if (typeof window !== 'undefined') {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '';
  }
  
  // In Node.js or when rendering server-side, use localhost
  return 'http://localhost:3000';
};

// Create the tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
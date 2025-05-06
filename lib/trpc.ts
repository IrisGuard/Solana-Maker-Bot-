import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/backend/trpc/app-router';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (!process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    throw new Error("Missing EXPO_PUBLIC_RORK_API_BASE_URL environment variable");
  }
  return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

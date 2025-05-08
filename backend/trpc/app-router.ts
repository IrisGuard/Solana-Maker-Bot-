import { initTRPC } from '@trpc/server';
import { ContextType } from './create-context';
import superjson from 'superjson';
import { z } from 'zod';

// Create a new instance of tRPC
const t = initTRPC.context<ContextType>().create({
  transformer: superjson,
});

// Export the router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Import procedures
import { hiProcedure } from './routes/example/hi/route';
import { apiStatusProcedure, apiKeyStatusProcedure } from './routes/api/status/route';

// Create the app router
export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  apiStatusRouter: router({
    status: apiStatusProcedure,
    keyStatus: apiKeyStatusProcedure,
  }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
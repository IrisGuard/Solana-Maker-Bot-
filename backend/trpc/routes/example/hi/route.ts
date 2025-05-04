import { publicProcedure } from '../../../app-router';
import { z } from 'zod';

// Define a simple hello world procedure
export const hiProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().optional(),
    }).optional()
  )
  .query(({ input }) => {
    const name = input?.name ?? 'world';
    return {
      greeting: `Hello ${name}!`,
      timestamp: new Date().toISOString(),
    };
  });
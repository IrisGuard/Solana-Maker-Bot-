import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { createContext } from './trpc/create-context';
import { appRouter } from './trpc/app-router';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Health check endpoint
app.get('/', (c) => c.text('Backend is running!'));

// tRPC endpoint
app.all('/api/trpc/*', async (c) => {
  const req = c.req;
  const path = req.path.replace('/api/trpc/', '');
  
  const handler = createHTTPHandler({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      console.error('tRPC error:', error);
    }
  });
  
  try {
    const response = await handler({
      path,
      req: {
        method: req.method,
        headers: Object.fromEntries(req.raw.headers.entries()),
        body: req.method !== 'GET' ? await req.json() : undefined,
        query: Object.fromEntries(new URL(req.url).searchParams),
      },
    });
    
    if (!response) {
      return c.json({ error: 'No response from tRPC handler' }, 500);
    }
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('tRPC handler error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Start the server if this file is run directly
// Using process.env.NODE_ENV check instead of import.meta.main
if (process.env.NODE_ENV !== 'production') {
  serve({
    fetch: app.fetch,
    port: 3000,
  });
  
}

export default app;

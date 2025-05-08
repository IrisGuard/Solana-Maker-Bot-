import { inferAsyncReturnType } from '@trpc/server';

// Define the context type
export interface ContextType {
  user?: {
    id: string;
    name: string;
  } | null;
}

// Create the context for tRPC
export async function createContext(): Promise<ContextType> {
  // In a real app, you would get the user from the request
  // For now, we'll just return a mock user or null
  const mockUser = Math.random() > 0.5 
    ? { id: 'user-123', name: 'Mock User' } 
    : null;
  
  return {
    user: mockUser,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
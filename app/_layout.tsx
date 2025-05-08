import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';
import superjson from 'superjson';
import * as Font from 'expo-font';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts - only if we're not on web platform to avoid errors
        if (Platform.OS !== 'web') {
          try {
            await Font.loadAsync({
              'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
              // Add any other fonts you need here
            });
          } catch (err) {
            console.warn('Font loading error:', err);
            // Continue even if font loading fails
          }
        }

        // Load any other resources or data needed for the app
        await Promise.all([
          // Add any resource loading here if needed
        ]);
      } catch (e) {
        console.warn('Resource loading error:', e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  
  // Set up React Query client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
      },
    },
    // Global error handler for all queries and mutations
    queryCache: new QueryClient().getQueryCache(),
    mutationCache: new QueryClient().getMutationCache(),
    onError: (error: Error) => {
      console.error("Query error:", error);
    }
  }));
  
  // Set up tRPC client
  const [trpcClient] = useState(() => 
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL || ''}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Solana Maker Bot' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
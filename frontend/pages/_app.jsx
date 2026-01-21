import { QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import '../styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isEmployerRoute = router.pathname.startsWith('/employer');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {isAdminRoute ? (
            <>
              <Component {...pageProps} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    border: '1px solid #374151',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#f9fafb',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#f9fafb',
                    },
                  },
                }}
              />
            </>
          ) : isEmployerRoute ? (
             <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    border: '1px solid #374151',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#f9fafb',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#f9fafb',
                    },
                  },
                }}
              />
            </Layout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default MyApp; 
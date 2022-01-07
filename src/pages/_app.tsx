import type { AppProps } from 'next/app';
import { Auth } from '@supabase/ui';
import { AuthLayout } from 'src/layout/AuthLayout';
import { client } from 'src/lib/supabase';
import '../styles/globals.css'
import 'tailwindcss/tailwind.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div>
      <Auth.UserContextProvider supabaseClient={client}>
        <AuthLayout>
          <Component {...pageProps} />
        </AuthLayout>
      </Auth.UserContextProvider>
    </div>
  );
};

export default MyApp

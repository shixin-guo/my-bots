import type { AppProps } from 'next/app';

import { SessionProvider as AuthProvider } from 'next-auth/react';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';

import { DefaultSeo } from 'next-seo';

import { FC } from 'react';
import { Inter } from 'next/font/google';
import Head from 'next/head';

import { builder } from '@builder.io/react';

import SEO from '@/config/seo';
import builderConfig from '@/config/builder';

builder.init(builderConfig.apiKey);

const inter = Inter({ subsets: ['latin'] });
const Noop: FC = ({ children }: any) => <>{children}</>;
function App({ Component, pageProps }: AppProps): JSX.Element {
  const Layout = (Component as any).Layout || Noop;
  return (
    <AuthProvider session={pageProps.session}>
      <Head>
        <title>LangBridge</title>
        <meta
          name="description"
          content="Use AI to translate I18N from one language to another."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <DefaultSeo {...SEO} />
      </Head>

      <main className={inter.className}>
        <Layout pageProps={pageProps}>
          <Component {...pageProps} />
        </Layout>
      </main>
      <Analytics />
    </AuthProvider>
  );
}

export default App;

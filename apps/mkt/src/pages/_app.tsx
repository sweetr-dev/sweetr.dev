import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import Script from "next/script";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

  return (
    <>
      <Head>
        <title>sweetr.dev</title>
        <meta name="description" content="Improve Developer Experience" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      {analyticsId && (
        <Script
          async
          src="https://analytics.umami.is/script.js"
          data-website-id={analyticsId}
        />
      )}

      <Script id="tawk.to">
        {`
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/648948eb94cf5d49dc5d8f13/1h2s4q1du';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();`}
      </Script>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
          colors: {
            brand: [
              "#DDE9DB",
              "#C1DCBF",
              "#A6D4A2",
              "#89D282",
              "#6AD560",
              "#47E039",
              "#41C835",
              "#46A73D",
              "#457841",
              "#42673F",
            ],
            dark: [
              "#C1C2C5",
              "#A6A7AB",
              "#909296",
              "#5C5F66",
              "#373A40",
              "#2C2E33",
              "#25262B",
              "#101114",
              "#141517",
              "#101113",
            ],
          },
          primaryShade: 6,
          primaryColor: "brand",
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}

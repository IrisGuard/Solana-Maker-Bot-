import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="application-name" content="Solana Maker Bot" />
          <meta name="description" content="Automated trading on Solana blockchain" />
          <meta name="theme-color" content="#121212" />
          <link rel="icon" href="/favicon.ico" />
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
            rel="stylesheet" 
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 
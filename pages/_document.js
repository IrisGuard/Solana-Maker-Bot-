import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="description" content="Solana Maker Bot - Automate trading on Solana blockchain" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body style={{ margin: 0, padding: 0, backgroundColor: '#121212' }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 
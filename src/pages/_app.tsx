import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { FC } from 'react';
import './global.scss';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <div>
            <Head>
                <title>Rpi Switch</title>
                <link
                    key='icon'
                    rel='icon'
                    href='favicon.ico'
                />
            </Head>
            <Component {...pageProps} />
        </div>
    );
}
export default App;

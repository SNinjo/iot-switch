import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ToggleSwitch from '@/components/ToggleSwitch';
import style from './index.module.scss';

let webSocket: WebSocket;
const HomePage = () => {
    const [isRegistered, setRegisteredState] = useState(false);
    const [isTurnedOn, setTurnedOnState] = useState(false);
    useEffect(() => {
        webSocket = new WebSocket('ws://192.168.0.2:3001');
        webSocket.onopen = () => webSocket.send('register');
        webSocket.onmessage = (event) => {
            setRegisteredState(true);
            setTurnedOnState(event.data === 'true');
        }
        return () => webSocket.close();
    }, []);

    return (
        <div
            className={style.div}
        >
            {isRegistered?
                <ToggleSwitch
                    isTurnedOn={isTurnedOn}
                    onSwitch={(isTurnedOn) => webSocket.send(isTurnedOn ? 'turn on' : 'turn off')}
                />:
                <Image
                    className={style.loading}
                    src='/loading.png'
                    width={50}
                    height={50}
                    alt='loading icon'
                />
            }
        </div>
    )
}
export default HomePage;

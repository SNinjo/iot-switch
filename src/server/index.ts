/* eslint-disable no-console */
import 'dotenv/config';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import rpio from 'rpio';

const PORT = +process.env.WEBSOCKET_PORT!;
const GPIO_PIN_RELAY = +process.env.GPIO_PIN_RELAY!;
const GPIO_PIN_BUTTON = +process.env.GPIO_PIN_BUTTON!;
enum Task {
    REGISTER = 'register',
    TURN_ON = 'turn on', // HIGH
    TURN_OFF = 'turn off', // LOW
}
function executeTask(data: RawData): boolean | void {
    const task = data.toString();
    switch (task) {
    case Task.REGISTER:
        return rpio.read(GPIO_PIN_RELAY) === rpio.HIGH;
    case Task.TURN_ON:
        rpio.write(GPIO_PIN_RELAY, rpio.HIGH);
        return true;
    case Task.TURN_OFF:
        rpio.write(GPIO_PIN_RELAY, rpio.LOW);
        return false;
    default:
        console.error(`invalid task: "${task}"`);
    }
}

const clients = new Set<WebSocket>();
const broadcast =
    (value: boolean) => clients.forEach(client => client.send(value.toString()));
function initialize() {
    rpio.open(GPIO_PIN_RELAY, rpio.OUTPUT, rpio.LOW);
    rpio.open(GPIO_PIN_BUTTON, rpio.INPUT, rpio.PULL_DOWN);
    rpio.poll(GPIO_PIN_BUTTON, (pin) => {
        if (rpio.read(pin) == rpio.HIGH) {
            const isOpenNow = !(rpio.read(GPIO_PIN_RELAY) === rpio.HIGH);
            rpio.write(GPIO_PIN_RELAY, isOpenNow ? rpio.HIGH : rpio.LOW);
            broadcast(isOpenNow);
        }
    });

    const server = new WebSocketServer({ port: PORT });
    server.on('connection', (webSocket) => {
        clients.add(webSocket);
        console.log(`connect successfully | client length: ${clients.size}`);

        webSocket.on('error', console.error);
        webSocket.on('close', () => clients.delete(webSocket));
        webSocket.on('message', (data) => {
            const result = executeTask(data);
            if (result !== undefined) {
                broadcast(result);
            }
        });
    });
    console.log(`WebSocket server listening on port ${PORT}`);
}
initialize();

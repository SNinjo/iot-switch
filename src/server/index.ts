/* eslint-disable no-console */
import 'dotenv/config';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import rpio from 'rpio';

const PORT = +process.env.WEBSOCKET_PORT!;
const GPIO_PIN = +process.env.GPIO_PIN!;
enum Task {
    REGISTER = 'register',
    TURN_ON = 'turn on', // HIGH
    TURN_OFF = 'turn off', // LOW
}
function executeTask(data: RawData): boolean | void {
    const task = data.toString();
    switch (task) {
    case Task.REGISTER:
        return rpio.read(GPIO_PIN) === rpio.HIGH;
    case Task.TURN_ON:
        rpio.write(GPIO_PIN, rpio.HIGH);
        return true;
    case Task.TURN_OFF:
        rpio.write(GPIO_PIN, rpio.LOW);
        return false;
    default:
        console.error(`invalid task: "${task}"`);
    }
}

function initialize() {
    rpio.open(GPIO_PIN, rpio.OUTPUT, rpio.LOW);

    const clients = new Set<WebSocket>();
    const broadcast =
        (value: boolean) => clients.forEach(client => client.send(value.toString()));

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

import {Connector} from "netbus";
import {HttpService} from "./http";
import {Registry} from "./registry";
import {WebSocketService} from "./ws";

const busHost: string = process.env.BUS ?? '';
const busId: string = process.env.BUS_ID ?? '';
const httpPort: number = parseInt(process.env.HTTP_PORT ?? '8080');
const wsPort: number = parseInt(process.env.WS_PORT ?? '8888');

if (busId === '' || busHost === '') {
    console.error('Not enough arguments! Usage: BUS_ID=shelter BUS=127.0.0.1 HTTP_PORT=8080 WS_PORT=8888 node bin/server.js');
    process.exit(-1);
}

(async () => {
    const bus = await Connector.connect(busId, busHost);

    const registry = new Registry(bus);
    await registry.start();

    const server = new HttpService(bus, registry, httpPort);
    await server.start();

    const ws = new WebSocketService(bus, registry, wsPort)
    ws.start();
})();
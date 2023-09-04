import {Connector} from "netbus";
import {Shelter} from "./shelter";

const busHost: string = process.env.BUS ?? '';
const busId: string = process.env.BUS_ID ?? '';
const port: number = parseInt(process.env.HTTP_PORT ?? '8080');

if (busId === '' || busHost === '') {
    console.error('Not enough arguments! Usage: BUS_ID=shelter BUS=127.0.0.1 PORT=8080 node bin/server.js');
    process.exit(-1);
}

(async () => {
    const bus = await Connector.connect(busId, busHost);
    const server = new Shelter(bus, port);
    await server.start();
})();
import WebSocket, {RawData} from 'ws';
import {DeviceCall} from "./bus/queries";
import {Bus} from "netbus";
import {Registry} from "./registry";

type RequestResult = {code: number, data: object};

export class WebSocketService
{
    constructor(
        private readonly bus: Bus,
        private readonly registry: Registry,
        private readonly listenPort: number = 8888
    ) {
    }

    public start()
    {
        const server = new WebSocket.WebSocketServer({port: this.listenPort});
        server.on('connection', this.handleConnection.bind(this));
    }

    private handleConnection(ws: WebSocket)
    {
        ws.on('message', event => this.handleMessage(ws, event));
    }

    private async handleMessage(ws: WebSocket, data: RawData)
    {
        const message = JSON.parse(data.toString());

        if (message?.x !== 'q') {
            console.error('Command "%s" is unsupported', message?.x);
            return;
        }

        const id: number = message.id;
        const request = message.data ?? {};
        const result = await this.handleRequest(request);

        ws.send(JSON.stringify({x: 'r', id: id, result: result}));
    }

    private async handleRequest(request: any): Promise<RequestResult>
    {
        const deviceId: string|null = request?.device;
        const method: string|null = request?.method;
        const params: object = request.params ?? {};

        if (!deviceId || !method) {
            return Promise.resolve({code: -1, data: {error: 'Bad request'}});
        }

        console.log('ws: device call', deviceId, method, params);

        let device = null;
        for (const it of this.registry.findAll()) {
            if (it.id === deviceId) {
                device = it;
            }
        }

        if (!device) {
            return Promise.resolve({code: -1, data: {error: 'Device not found'}});
        }

        const result= await this.bus.execute(device.busId, new DeviceCall(deviceId, method, params));

        return Promise.resolve({code: result.code, data: result.data});
    }
}
import {RemoteDevice, Registry} from "./registry";
import {ServerResponse} from "http";

export class DeviceController
{
    constructor(
        private readonly registry: Registry
    ) {
    }

    public list(): Array<object>
    {
        const devices = [];

        for (let device of this.registry.findAll()) {
            devices.push({id: device.id, name: null, model: device.model, properties: Object.fromEntries(device.properties.entries()), metadata: null});
        }

        return devices;
    }
}

export class DeviceEventsController {
    private readonly clients: Map<number, ServerResponse>;

    constructor(
        private readonly registry: Registry
    ) {
        this.clients = new Map();
        this.registry.onUpdate(this.handleDeviceUpdates.bind(this));
    }

    private handleDeviceUpdates(device: RemoteDevice): void
    {
        for (let [key, client] of this.clients) {
            client.write(`id: ${Date.now()}\nevent: update\ndata: ${JSON.stringify({device: device.id, data: {id: device.id, properties: Object.fromEntries(device.properties.entries()), metadata: null}})}\n\n`);
        }
    }

    public subscribe(client: ServerResponse): void
    {
        const clientId = Date.now();
        this.clients.set(clientId, client);

        client.on('close', () => this.clients.delete(clientId));

        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        };

        client.writeHead(200, headers);
    }
}
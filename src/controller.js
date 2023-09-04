"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceEventsController = exports.DeviceController = void 0;
class DeviceController {
    constructor(registry) {
        this.registry = registry;
    }
    list() {
        const devices = [];
        for (let device of this.registry.findAll()) {
            devices.push({ id: device.id, name: null, properties: Object.fromEntries(device.properties.entries()), metadata: null });
        }
        return devices;
    }
}
exports.DeviceController = DeviceController;
class DeviceEventsController {
    constructor(registry) {
        this.registry = registry;
        this.clients = new Map();
        this.registry.onUpdate(this.handleDeviceUpdates.bind(this));
    }
    handleDeviceUpdates(device) {
        for (let [key, client] of this.clients) {
            client.write(`id: ${Date.now()}\nevent: update\ndata: ${JSON.stringify({ device: device.id, data: { id: device.id, properties: Object.fromEntries(device.properties.entries()), metadata: null } })}\n\n`);
        }
    }
    subscribe(client) {
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
exports.DeviceEventsController = DeviceEventsController;
//# sourceMappingURL=controller.js.map
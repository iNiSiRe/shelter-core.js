"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteDevice = exports.Registry = void 0;
const events_1 = require("events");
const netbus_1 = require("netbus");
class Registry {
    constructor(bus) {
        this.bus = bus;
        this.devices = new Map();
        this.events = new events_1.EventEmitter();
        bus.subscribe('Discover.Response', this.handleDiscoverResponse.bind(this));
        bus.subscribe('Device.Update', this.handleDeviceUpdate.bind(this));
        bus.dispatch(new netbus_1.Event('Discover.Request'));
    }
    handleDeviceUpdate(event) {
        const update = event.data;
        const id = update.device;
        const device = this.find(id);
        console.log(`Device #${id} update with properties: ${JSON.stringify(update.properties)}`);
        if (device) {
            const properties = new Map();
            for (const [name, value] of Object.entries(update.properties)) {
                properties.set(name, value);
            }
            device.update(properties);
            this.events.emit('update', device);
        }
    }
    handleDiscoverResponse(event) {
        const discover = event.data;
        const id = discover.device;
        console.log(`Device ${event.source}#${id} (${discover.model}) discovered with properties: ${JSON.stringify(discover.properties)}`);
        const device = this.find(id);
        const properties = new Map();
        for (const [name, value] of Object.entries(discover.properties)) {
            properties.set(name, value);
        }
        if (device === null) {
            this.devices.set(id, new RemoteDevice(event.source, id, discover.model, properties));
        }
        else {
            device.update(properties);
            this.events.emit('update', device);
        }
    }
    find(id) {
        var _a;
        return (_a = this.devices.get(id)) !== null && _a !== void 0 ? _a : null;
    }
    *findAll() {
        for (let [key, value] of this.devices) {
            yield value;
        }
    }
    onUpdate(handler) {
        this.events.on('update', handler);
    }
}
exports.Registry = Registry;
class RemoteDevice {
    constructor(busId, id, model, properties = new Map()) {
        this.busId = busId;
        this.id = id;
        this.model = model;
        this.properties = properties;
        this.events = new events_1.EventEmitter();
    }
    update(properties) {
        let update = new Map;
        properties.forEach((value, name) => {
            if (this.properties.get(name) !== value) {
                this.properties.set(name, value);
                update.set(name, value);
            }
        });
        this.events.emit('update', update);
    }
    onUpdate(handler) {
        this.events.on('update', handler);
    }
}
exports.RemoteDevice = RemoteDevice;
//# sourceMappingURL=registry.js.map
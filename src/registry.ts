import {EventEmitter} from "events";
import {Bus, Event, RemoteEvent} from "netbus";

export class Registry
{
    private readonly devices: Map<string, RemoteDevice>;

    private readonly events: EventEmitter;

    constructor(
        private readonly bus: Bus,
    ) {
        this.devices = new Map();
        this.events = new EventEmitter();

        bus.subscribe('Discover.Response', this.handleDiscoverResponse.bind(this));
        bus.subscribe('Device.Update', this.handleDeviceUpdate.bind(this));
        bus.dispatch(new Event('Discover.Request'));
    }

    public handleDeviceUpdate(event: Event)
    {
        const update: {device: string, properties: {[key: string]: any}} = event.data;
        const id = update.device;
        const device = this.find(id);

        console.log(`Device #${id} update with properties: ${JSON.stringify(update.properties)}`);

        if (device) {
            const properties = new Map<string, any>();

            for (const [name, value] of Object.entries(update.properties)) {
                properties.set(name, value);
            }

            device.update(properties);
            this.events.emit('update', device);
        }
    }

    public handleDiscoverResponse(event: RemoteEvent)
    {
        const discover: {device: string, model: string, properties: object} = event.data;
        const id = discover.device;

        console.log(`Device ${event.source}#${id} (${discover.model}) discovered with properties: ${JSON.stringify(discover.properties)}`);

        const device = this.find(id);

        const properties = new Map<string, any>();
        for (const [name, value] of Object.entries(discover.properties)) {
            properties.set(name, value);
        }

        if (device === null) {
            this.devices.set(id, new RemoteDevice(event.source, id, discover.model, properties));
        } else {
            device.update(properties);
            this.events.emit('update', device);
        }
    }

    public find(id: string): null|RemoteDevice
    {
        return this.devices.get(id) ?? null;
    }

    public *findAll(): Generator<RemoteDevice>
    {
        for (let [key, value] of this.devices) {
            yield value;
        }
    }

    public onUpdate(handler: (arg1: RemoteDevice) => void): void
    {
        this.events.on('update', handler);
    }
}

export class RemoteDevice implements Device
{
    private events: EventEmitter;

    constructor(
        public readonly busId: string,
        public readonly id: string,
        public readonly model: string,
        public readonly properties: Map<string, any> = new Map<string, any>()
    ) {
        this.events = new EventEmitter();
    }

    public update(properties: Map<string, any>)
    {
        let update = new Map<string, any>;
        properties.forEach((value: any, name: string) => {
            if (this.properties.get(name) !== value) {
                this.properties.set(name, value);
                update.set(name, value);
            }
        })

        this.events.emit('update', update);
    }

    public onUpdate(handler: (arg1: Map<string, any>) => void)
    {
        this.events.on('update', handler);
    }
}

export interface Device
{
    readonly id: string;
    readonly model: string;
    readonly properties: Map<string, any>;
}
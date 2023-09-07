import {EventEmitter} from "events";
import {Bus, Query, Result} from "netbus";
import {DeviceUpdate, DiscoverResponse, ShelterEvent} from "./bus/events";
import {DeviceCallData, ShelterQuery} from "./bus/queries";

export type CallResult = {code: number, data: any};

export interface ShelterDevice
{
    get id(): string;

    get model(): string;

    get state(): object;

    call(method: string, params: object): Promise<CallResult>;
}

export class ShelterModule
{
    private startedAt: number = 0;

    private readonly _devices: ShelterDevice[] = [];

    constructor(
        private readonly bus: Bus
    ) {
        this.bus.subscribe(ShelterEvent.DiscoverRequest, this.handleDiscoverRequest.bind(this));

        this.bus.on('Module.Status', async (): Promise<Result> => {
            const FormatMemoryUsage = (data: number) => Math.round((data / 1024 / 1024) * 100) / 100;

            return new Result(0, {
                uptime: Math.floor((Date.now() - this.startedAt) / 1000),
                memory: FormatMemoryUsage(process.memoryUsage().rss)
            });
        });

        this.bus.on(ShelterQuery.DeviceCall, async (query: Query<DeviceCallData>): Promise<Result> => {
            for (const device of this._devices) {
                if (device.id === query.data.device) {
                    const result = await device.call(query.data.method, query.data.parameters);
                    return new Result(result.code, result.data);
                }
            }

            return new Result(-1, {error: 'Device not found'});
        });
    }

    public registerDevice(device: ShelterDevice)
    {
        device.properties.onUpdate((changes: ChangeSet) => {
            this.bus.dispatch(new DeviceUpdate(device.id, Object.fromEntries(changes.entries()), device.properties));
        });

        this._devices.push(device);

        this.bus.dispatch(new DiscoverResponse(device.id, device.model, device.properties));
    }

    get devices(): ShelterDevice[]
    {
        return this._devices;
    }

    private handleDiscoverRequest(): void {
        for (const device of this._devices) {
            this.bus.dispatch(new DiscoverResponse(device.id, device.model, device.properties));
        }
    }

    public async start(): Promise<void>
    {
        this.startedAt = Date.now();
    }
}

export class ChangeSet extends Map<string,any>
{
}

export class Properties<Scheme extends Object> extends Object
{
    private readonly events = new EventEmitter();

    private readonly state: Map<string, any> = new Map();

    public update(changes: Scheme): void
    {
        const changed = new ChangeSet();

        for (const [name, value] of Object.entries(changes)) {
            if (this.state.has(name) && this.state.get(name) === value) {
                continue;
            }

            this.state.set(name, value);
            changed.set(name, value);
        }

        if (changed.size > 0) {
            this.events.emit('update', changed);
        }
    }

    public all(): Scheme {
        const object: { [key: string]: any } = {};

        for (const [name, value] of this.state) {
            object[name] = value;
        }

        return object as Scheme;
    }

    public onUpdate(handler: (arg: ChangeSet) => void)
    {
        this.events.on('update', handler);
    }
}

export class DeviceState<Scheme extends object>
{
    private readonly events = new EventEmitter();

    private readonly comittedState: Map<string, any> = new Map();

    constructor(
        public properties: Scheme
    ) {
    }

    public commit()
    {
        const changed = new ChangeSet();

        for (const [name, value] of Object.entries(this.properties)) {
            if (this.comittedState.has(name) && this.comittedState.get(name) === value) {
                continue;
            }

            this.comittedState.set(name, value);
            changed.set(name, value);
        }

        if (changed.size > 0) {
            this.events.emit('update', changed);
        }
    }

    public onUpdate(handler: (arg: ChangeSet) => void)
    {
        this.events.on('update', handler);
    }
}
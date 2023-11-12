import {EventEmitter} from "events";
import {Bus, Query, Result} from "netbus";
import {DeviceUpdate, DiscoverResponse, ShelterEvent} from "./bus/events";
import {DeviceCallData, ShelterQuery} from "./bus/queries";

export type CallResult = {code: number, data: any};

export class ChangeSet extends Map<string,any>
{
}

export abstract class ShelterDevice
{
    private readonly events: EventEmitter = new EventEmitter();

    private readonly committedState: Map<string, any> = new Map();

    constructor(
        public readonly id: string,
        public readonly model: string,
    ) {
    }

    public onUpdate(handler: (arg1: ChangeSet, arg2: ShelterDevice) => void)
    {
        this.events.on('update', handler);
    }

    public commit()
    {
        const changes = new ChangeSet();

        for (const [name, value] of Object.entries(this.properties)) {
            if (this.committedState.has(name) && this.committedState.get(name) === value) {
                continue;
            }

            this.committedState.set(name, value);
            changes.set(name, value);
        }

        if (changes.size > 0) {
            this.events.emit('update', changes, this);
        }
    }

    abstract get properties(): object;

    abstract call(method: string, params: object): Promise<CallResult>;
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
        device.onUpdate((changes: ChangeSet, device: ShelterDevice) => {
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
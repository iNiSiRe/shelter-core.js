/// <reference types="node" />
import { Registry } from "./registry";
import { ServerResponse } from "http";
export declare class DeviceController {
    private readonly registry;
    constructor(registry: Registry);
    list(): Array<object>;
}
export declare class DeviceEventsController {
    private readonly registry;
    private readonly clients;
    constructor(registry: Registry);
    private handleDeviceUpdates;
    subscribe(client: ServerResponse): void;
}

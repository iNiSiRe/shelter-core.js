import { Bus } from "netbus";
export declare class Shelter {
    private readonly bus;
    private readonly httpServerPort;
    constructor(bus: Bus, httpServerPort?: number);
    start(): Promise<void>;
}

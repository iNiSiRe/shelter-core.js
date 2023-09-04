import {Bus, Connector, Query, Result} from "netbus";
import {Registry} from "./registry";
import {DeviceController, DeviceEventsController} from "./controller";
import http, {IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import {DeviceCall} from "./bus/queries";

export class Shelter
{
    constructor(
        private readonly bus: Bus,
        private readonly httpServerPort: number = 8080
    ) {
    }

    public async start(): Promise<void>
    {
        const bus = this.bus;
        const registry = new Registry(bus);
        const devices = new DeviceController(registry);
        const events = new DeviceEventsController(registry);

        type RequestHandler = (arg0: RegExpMatchArray, arg1: IncomingMessage, arg2: URLSearchParams, arg3: ServerResponse) => void;

        const routes: Map<RegExp, RequestHandler> = new Map();

        routes.set(
            new RegExp('^GET /api/v1/devices$'),
            (matches, req, query, res) => {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({data: devices.list()}))
            }
        );

        routes.set(
            new RegExp('^GET /sse/v1/devices$'),
            (matches, req, query,res) => {
                events.subscribe(res);
            }
        );

        routes.set(
            /^OPTIONS .+$/,
            (matches, req, query, res) => {
                res.writeHead(201);
                res.end();
            }
        );

        routes.set(
            /^(POST|GET) \/api\/v1\/devices\/(.+)\/(.+)$/,
            async (matches, req, query, res) => {
                const deviceId: string = matches[2];
                const method: string = matches[3];
                const params = query.get('params') ?? {};

                let result = new Result(-1, {error: 'Device not found'});

                for (const device of registry.findAll()) {
                    if (device.id === deviceId) {
                        result = await bus.execute(device.busId, new DeviceCall(deviceId, method, params));
                    }
                }

                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({success: true, result: {code: result.code, data: result.data}}));
            }
        );

        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            // CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            const url = new URL(req.url ?? '', `http://${req.headers.host}`);

            const route = `${req.method} ${url.pathname}`;
            let handled: boolean = false;

            for (const [pattern, handler] of routes) {
                const matches = pattern.exec(route);
                if (matches && matches.length > 0) {
                    handler(matches, req, url.searchParams, res);
                    handled = true;
                }
            }

            if (!handled) {
                res.writeHead(404, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({error: 'Bad route'}));
            }
        });

        server.listen(this.httpServerPort, '0.0.0.0', () => {
            console.log(`Http server is running`);
        });
    }
}
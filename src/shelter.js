"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shelter = void 0;
const netbus_1 = require("netbus");
const registry_1 = require("./registry");
const controller_1 = require("./controller");
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const queries_1 = require("./bus/queries");
class Shelter {
    constructor(bus, httpServerPort = 8080) {
        this.bus = bus;
        this.httpServerPort = httpServerPort;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const bus = this.bus;
            const registry = new registry_1.Registry(bus);
            const devices = new controller_1.DeviceController(registry);
            const events = new controller_1.DeviceEventsController(registry);
            const routes = new Map();
            routes.set(new RegExp('^GET /api/v1/devices$'), (matches, req, query, res) => {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ data: devices.list() }));
            });
            routes.set(new RegExp('^GET /sse/v1/devices$'), (matches, req, query, res) => {
                events.subscribe(res);
            });
            routes.set(/^OPTIONS .+$/, (matches, req, query, res) => {
                res.writeHead(201);
                res.end();
            });
            routes.set(/^(POST|GET) \/api\/v1\/devices\/(.+)\/(.+)$/, (matches, req, query, res) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const deviceId = matches[2];
                const method = matches[3];
                const params = (_a = query.get('params')) !== null && _a !== void 0 ? _a : {};
                let result = new netbus_1.Result(-1, { error: 'Device not found' });
                for (const device of registry.findAll()) {
                    if (device.id === deviceId) {
                        result = yield bus.execute(device.busId, new queries_1.DeviceCall(deviceId, method, params));
                    }
                }
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({ success: true, result: { code: result.code, data: result.data } }));
            }));
            const server = http_1.default.createServer((req, res) => {
                var _a;
                // CORS
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                const url = new url_1.URL((_a = req.url) !== null && _a !== void 0 ? _a : '', `http://${req.headers.host}`);
                const route = `${req.method} ${url.pathname}`;
                let handled = false;
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
                    res.end(JSON.stringify({ error: 'Bad route' }));
                }
            });
            server.listen(this.httpServerPort, '0.0.0.0', () => {
                console.log(`Http server is running`);
            });
        });
    }
}
exports.Shelter = Shelter;
//# sourceMappingURL=shelter.js.map
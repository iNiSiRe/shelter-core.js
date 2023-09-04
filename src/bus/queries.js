"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceCall = void 0;
const netbus_1 = require("netbus");
class DeviceCall extends netbus_1.Query {
    constructor(deviceId, method, params) {
        super('Device.Call', { device: deviceId, method: method, parameters: params });
        this.deviceId = deviceId;
        this.method = method;
        this.params = params;
    }
}
exports.DeviceCall = DeviceCall;
//# sourceMappingURL=queries.js.map
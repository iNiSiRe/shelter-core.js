"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceUpdate = void 0;
const netbus_1 = require("netbus");
class DeviceUpdate extends netbus_1.Event {
    constructor(deviceId, update, properties) {
        super('Device.Update', { device: deviceId, update: update, properties: properties });
    }
}
exports.DeviceUpdate = DeviceUpdate;
//# sourceMappingURL=events.js.map
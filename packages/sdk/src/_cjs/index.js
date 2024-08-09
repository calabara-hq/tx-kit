"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownlinkClient = exports.UplinkClient = exports.TransmissionsClient = void 0;
const index_js_1 = require("./client/index.js");
Object.defineProperty(exports, "TransmissionsClient", { enumerable: true, get: function () { return index_js_1.TransmissionsClient; } });
const uplink_js_1 = require("./client/uplink.js");
Object.defineProperty(exports, "UplinkClient", { enumerable: true, get: function () { return uplink_js_1.UplinkClient; } });
const downlink_js_1 = require("./client/downlink.js");
Object.defineProperty(exports, "DownlinkClient", { enumerable: true, get: function () { return downlink_js_1.DownlinkClient; } });
__exportStar(require("./types.js"), exports);
__exportStar(require("./errors.js"), exports);
__exportStar(require("./constants.js"), exports);
//# sourceMappingURL=index.js.map
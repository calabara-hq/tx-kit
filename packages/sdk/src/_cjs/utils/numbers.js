"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromBigIntToPercent = exports.getNumberFromPercent = exports.getBigIntFromPercent = exports.roundToDecimals = exports.normalizeTimestamp = void 0;
const constants_js_1 = require("../constants.js");
const viem_1 = require("viem");
const normalizeTimestamp = (timestamp) => {
    const max = Number(viem_1.maxUint40);
    return timestamp > max ? max : timestamp;
};
exports.normalizeTimestamp = normalizeTimestamp;
const roundToDecimals = (num, decimals) => {
    const multiplier = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
};
exports.roundToDecimals = roundToDecimals;
const getBigIntFromPercent = (value) => {
    return BigInt((0, exports.getNumberFromPercent)(value));
};
exports.getBigIntFromPercent = getBigIntFromPercent;
const getNumberFromPercent = (value, scale) => {
    if (!scale)
        scale = constants_js_1.PERCENTAGE_SCALE;
    return Math.round(Number(scale) * value) / 100;
};
exports.getNumberFromPercent = getNumberFromPercent;
const fromBigIntToPercent = (value, scale) => {
    const numberVal = BigInt(value);
    if (!scale) {
        return parseFloat((0, viem_1.formatUnits)(numberVal, 4)) * 100;
    }
    return Number((numberVal * BigInt(100)) / scale);
};
exports.fromBigIntToPercent = fromBigIntToPercent;
//# sourceMappingURL=numbers.js.map
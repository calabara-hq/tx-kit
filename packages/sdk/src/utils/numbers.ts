import { PERCENTAGE_SCALE } from '../constants.js'
import { formatUnits, maxUint40 } from 'viem'

export const normalizeTimestamp = (timestamp: number): number => {
    const max = Number(maxUint40);
    return timestamp > max ? max : timestamp;
}

export const roundToDecimals: (arg0: number, arg1: number) => number = (
    num,
    decimals,
) => {
    const multiplier = Math.pow(10, decimals)
    // Include Number.EPSILON to help with floating point precision (i.e. expected 1.325 but got 1.324999999999)
    return Math.round((num + Number.EPSILON) * multiplier) / multiplier
}

export const getBigIntFromPercent = (value: number): bigint => {
    return BigInt(getNumberFromPercent(value))
}

export const getNumberFromPercent = (value: number, scale?: bigint): number => {
    if (!scale) scale = PERCENTAGE_SCALE
    return Math.round(Number(scale) * value) / 100
}

export const fromBigIntToPercent = (
    value: bigint | number,
    scale?: bigint,
): number => {
    const numberVal = BigInt(value)
    if (!scale) {
        return parseFloat(formatUnits(numberVal, 4)) * 100
    }
    return Number((numberVal * BigInt(100)) / scale)
}
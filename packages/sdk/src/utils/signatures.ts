import { Hex } from "viem"

export const extractVRSfromSignature = (signature: Hex): { v: number, r: Hex, s: Hex } => {

    const r = signature.slice(0, 66) as Hex
    const s = '0x' + signature.slice(66, 130) as Hex
    const v = parseInt(signature.slice(130, 132), 16);

    return { v, r, s }
}


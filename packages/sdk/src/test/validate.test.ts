import { createTestClient, Hex, http, publicActions, walletActions, zeroAddress } from "viem";
import { NATIVE_TOKEN } from "../constants";
import { InvalidArgumentError } from "../errors";
import { UniformInteractionPower, WeightedInteractionPower } from "../utils/logic";
import { validateAddress, validateCreateTokenInputs, validateFeePercentage, validateFiniteChannelInputs, validateFiniteTransportLayer, validateInfiniteChannelInputs, validateInfiniteTransportLayer, validateMintTokenBatchInputs, validateSetFeeInputs, validateSetLogicInputs, validateSetupActions, validateSponsorTokenInputs, validateWithdrawRewardsInputs } from "../utils/validate";
import { baseSepolia, foundry } from "viem/chains";
import { DeferredTokenIntent, SponsorTokenConfig } from "../types";
import { privateKeyToAccount } from "viem/accounts";
import { randomBytes } from "crypto";


const testClient = createTestClient({
    account: privateKeyToAccount('0x' + randomBytes(32).toString("hex") as Hex),
    chain: baseSepolia,
    mode: 'anvil',
    transport: http(),
})
    .extend(publicActions)
    .extend(walletActions)


describe("address validation", () => {
    test("invalid address fails", () => {
        expect(() => validateAddress("invalid")).toThrow(InvalidArgumentError)
    })

    test("valid address passes", () => {
        expect(() => validateAddress(NATIVE_TOKEN)).not.toThrow()
    })
});


describe("fee validation", () => {
    // fail validate percentage

    test("out of bounds fee percentage fails", () => {
        expect(() => validateFeePercentage(-1)).toThrow(InvalidArgumentError)
        expect(() => validateFeePercentage(101)).toThrow(InvalidArgumentError)
    })

    test("invalid precision fails", () => {
        expect(() => validateFeePercentage(0.123)).toThrow(InvalidArgumentError)
    });

    test("valid fee percentage passes", () => {
        expect(() => validateFeePercentage(50.55)).not.toThrow()
    })

    test("invalid total allocation fails", () => {
        expect(() => validateSetFeeInputs({
            feeContract: NATIVE_TOKEN,
            feeArgs: {
                channelTreasury: NATIVE_TOKEN,
                uplinkPercentage: 30,
                channelPercentage: 20,
                creatorPercentage: 20,
                mintReferralPercentage: 20,
                sponsorPercentage: 20,
                ethMintPrice: BigInt(100),
                erc20MintPrice: BigInt(0),
                erc20Contract: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    })

    test("invalid eth price fails", () => {
        expect(() => validateSetFeeInputs({
            feeContract: NATIVE_TOKEN,
            feeArgs: {
                channelTreasury: NATIVE_TOKEN,
                uplinkPercentage: 30,
                channelPercentage: 20,
                creatorPercentage: 20,
                mintReferralPercentage: 20,
                sponsorPercentage: 20,
                ethMintPrice: BigInt(0),
                erc20MintPrice: BigInt(0),
                erc20Contract: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    })


    test("valid total allocation passes", () => {
        expect(() => validateSetFeeInputs({
            feeContract: NATIVE_TOKEN,
            feeArgs: {
                channelTreasury: NATIVE_TOKEN,
                uplinkPercentage: 20,
                channelPercentage: 20,
                creatorPercentage: 20,
                mintReferralPercentage: 20,
                sponsorPercentage: 20,
                ethMintPrice: BigInt(100),
                erc20MintPrice: BigInt(0),
                erc20Contract: NATIVE_TOKEN
            }
        })).not.toThrow()
    })

})

describe("logic validation", () => {
    test("invalid target address fails", () => {
        expect(() => validateSetLogicInputs([
            new UniformInteractionPower(BigInt(10)).ifResultOf("0xinvalid", "0x70a08231", "0x00").gt(BigInt(0))
        ])).toThrow(InvalidArgumentError)
    })

    test("invalid signature fails", () => {
        expect(() => validateSetLogicInputs([
            new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "invalid", "0x00").gt(BigInt(0))
        ])).toThrow(InvalidArgumentError)
    })

    test("invalid data fails", () => {
        expect(() => validateSetLogicInputs([
            new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "0x70a08231", "invalid").gt(BigInt(0))
        ])).toThrow(InvalidArgumentError)
    })

    test("uneven logic array length fails", () => {
        expect(() => validateSetLogicInputs([
            {
                target: NATIVE_TOKEN,
                signature: "0x70a08231",
                data: "0x00",
                operator: 0,
                literalOperand: "0x00",
                interactionPowerType: 0,
                interactionPower: BigInt(0)
            },
            // @ts-ignore
            {
                target: NATIVE_TOKEN,
                signature: "0x70a08231",
                data: "0x00",
                literalOperand: "0x00",
                interactionPowerType: 0,
                interactionPower: BigInt(0)
            }

        ])).toThrow(InvalidArgumentError)
    });

    test("valid logic passes", () => {
        expect(() => validateSetLogicInputs([
            new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "0x70a08231", "0x00").gt(BigInt(0)),
            new WeightedInteractionPower().ifResultOf(NATIVE_TOKEN, "0x70a08231", "0x00").lt(BigInt(10)),
        ])).not.toThrow()
    })
});


describe("setup action validation", () => {
    test("invalid fee contract fails", () => {
        expect(() => validateSetupActions([{
            feeContract: "invalid",
            feeArgs: {
                channelTreasury: NATIVE_TOKEN,
                uplinkPercentage: 20,
                channelPercentage: 20,
                creatorPercentage: 20,
                mintReferralPercentage: 20,
                sponsorPercentage: 20,
                ethMintPrice: BigInt(100),
                erc20MintPrice: BigInt(0),
                erc20Contract: NATIVE_TOKEN
            }
        }])).toThrow(InvalidArgumentError)
    })

    test("invalid fee config fails", () => {
        expect(() => validateSetupActions([{
            feeContract: NATIVE_TOKEN,
            feeArgs: {
                channelTreasury: NATIVE_TOKEN,
                uplinkPercentage: 30,
                channelPercentage: 20,
                creatorPercentage: 20,
                mintReferralPercentage: 20,
                sponsorPercentage: 20,
                ethMintPrice: BigInt(100),
                erc20MintPrice: BigInt(0),
                erc20Contract: NATIVE_TOKEN
            }
        }])).toThrow(InvalidArgumentError)
    })

    test("invalid logic contract fails", () => {
        expect(() => validateSetupActions([{
            logicContract: "invalid",
            creatorLogic: [
                new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "0x70a08231", "0x00").gt(BigInt(0))
            ],
            minterLogic: []
        }])).toThrow(InvalidArgumentError)
    })

    test("invalid logic config fails", () => {
        expect(() => validateSetupActions([{
            logicContract: NATIVE_TOKEN,
            creatorLogic: [
                {
                    target: NATIVE_TOKEN,
                    signature: "0x70a08231",
                    data: "0x00",
                    operator: 0,
                    literalOperand: "0x00",
                    interactionPowerType: 0,
                    interactionPower: BigInt(0)
                },
                // @ts-ignore
                {
                    target: NATIVE_TOKEN,
                    signature: "0x70a08231",
                    data: "0x00",
                    literalOperand: "0x00",
                    interactionPowerType: 0,
                    interactionPower: BigInt(0)
                }
            ],
            minterLogic: []
        }])).toThrow(InvalidArgumentError)
    });

    test("valid setup actions passes", () => {
        expect(() => validateSetupActions([{
            feeContract: NATIVE_TOKEN,
            feeArgs: {
                channelTreasury: NATIVE_TOKEN,
                uplinkPercentage: 20,
                channelPercentage: 19.45,
                creatorPercentage: 20.55,
                mintReferralPercentage: 20,
                sponsorPercentage: 20,
                ethMintPrice: BigInt(100),
                erc20MintPrice: BigInt(0),
                erc20Contract: NATIVE_TOKEN
            }
        },
        {
            logicContract: NATIVE_TOKEN,
            creatorLogic: [
                new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "0x70a08231", "0x00").gt(BigInt(0))
            ],
            minterLogic: []
        }
        ])).not.toThrow()
    })
})


describe("infinite transport layer validation", () => {
    test("invalid sale duration fails", () => {
        expect(() => validateInfiniteTransportLayer({
            saleDurationInSeconds: 0
        })).toThrow(InvalidArgumentError)
    })

    test("valid sale duration passes", () => {
        expect(() => validateInfiniteTransportLayer({
            saleDurationInSeconds: 100
        })).not.toThrow()
    })
})

describe("finite transport layer validation", () => {

    test("invalid mint start time fails", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000),
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 1,
            rewards: {
                ranks: [1],
                allocations: [BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000777 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    })

    test("invalid mint end time fails", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 1,
            rewards: {
                ranks: [1],
                allocations: [BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000777 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    })

    test("uneven rewards array length fails", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 2,
            rewards: {
                ranks: [1, 2],
                allocations: [BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000777 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    })


    test("invalid rank order fails", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 2,
            rewards: {
                ranks: [2, 1],
                allocations: [BigInt(0.000777 * 10 ** 18), BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000777 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)

        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 2,
            rewards: {
                ranks: [1, 1],
                allocations: [BigInt(0.000777 * 10 ** 18), BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000777 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    });

    test("invalid total allocation fails", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 2,
            rewards: {
                ranks: [1, 2],
                allocations: [BigInt(0.000777 * 10 ** 18), BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000778 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).toThrow(InvalidArgumentError)
    })


    test("invalid reward token fails", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 2,
            rewards: {
                ranks: [1, 2],
                allocations: [BigInt(0.000777 * 10 ** 18), BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(0.000777 * 10 ** 18),
                token: "invalid"
            }
        })).toThrow(InvalidArgumentError)
    })

    test("valid finite transport layer passes", () => {
        expect(() => validateFiniteTransportLayer({
            createStartInSeconds: Math.floor(Date.now() / 1000),
            mintStartInSeconds: Math.floor(Date.now() / 1000) + 1000,
            mintEndInSeconds: Math.floor(Date.now() / 1000) + 2000,
            rewards: {
                ranks: [1, 2],
                allocations: [BigInt(0.000777 * 10 ** 18), BigInt(0.000777 * 10 ** 18)],
                totalAllocation: BigInt(2 * 0.000777 * 10 ** 18),
                token: NATIVE_TOKEN
            }
        })).not.toThrow()
    })

})


describe("infinite channel validation", () => {
    test("invalid infinite channel inputs fails", () => {
        expect(() => validateInfiniteChannelInputs({
            uri: "sample uri",
            name: "my contract",
            defaultAdmin: "0xadmin",
            managers: ["0xadmin"],
            setupActions: [],
            transportLayer: {
                saleDurationInSeconds: 100
            }
        })).toThrow(InvalidArgumentError)
    })

    test("valid infinite channel inputs passes", () => {
        expect(() => validateInfiniteChannelInputs({
            uri: "sample uri",
            name: "my contract",
            defaultAdmin: NATIVE_TOKEN,
            managers: [NATIVE_TOKEN],
            setupActions: [
                {
                    feeContract: NATIVE_TOKEN,
                    feeArgs: {
                        channelTreasury: NATIVE_TOKEN,
                        uplinkPercentage: 20,
                        channelPercentage: 19.45,
                        creatorPercentage: 20.55,
                        mintReferralPercentage: 20,
                        sponsorPercentage: 20,
                        ethMintPrice: BigInt(100),
                        erc20MintPrice: BigInt(0),
                        erc20Contract: NATIVE_TOKEN
                    }
                },
                {
                    logicContract: NATIVE_TOKEN,
                    creatorLogic: [
                        new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "0x70a08231", "0x00").gt(BigInt(0))
                    ],
                    minterLogic: []
                }
            ],
            transportLayer: {
                saleDurationInSeconds: 100
            }
        })).not.toThrow()
    })
})


describe("finite channel validation", () => {
    test("invalid finite channel inputs fails", () => {
        expect(() => validateFiniteChannelInputs({
            uri: "sample uri",
            name: "my contract",
            defaultAdmin: "0xadmin",
            managers: ["0xadmin"],
            setupActions: [],
            transportLayer: {
                createStartInSeconds: Math.floor(Date.now() / 1000),
                mintStartInSeconds: Math.floor(Date.now() / 1000) + 1,
                mintEndInSeconds: Math.floor(Date.now() / 1000) + 2,
                rewards: {
                    ranks: [1],
                    allocations: [BigInt(0.000777 * 10 ** 18)],
                    totalAllocation: BigInt(0.000777 * 10 ** 18),
                    token: NATIVE_TOKEN
                }
            }
        })).toThrow(InvalidArgumentError)
    })

    test("valid finite channel inputs passes", () => {
        expect(() => validateFiniteChannelInputs({
            uri: "sample uri",
            name: "my contract",
            defaultAdmin: NATIVE_TOKEN,
            managers: [NATIVE_TOKEN],
            setupActions: [
                {
                    feeContract: NATIVE_TOKEN,
                    feeArgs: {
                        channelTreasury: NATIVE_TOKEN,
                        uplinkPercentage: 20,
                        channelPercentage: 19.45,
                        creatorPercentage: 20.55,
                        mintReferralPercentage: 20,
                        sponsorPercentage: 20,
                        ethMintPrice: BigInt(100),
                        erc20MintPrice: BigInt(0),
                        erc20Contract: NATIVE_TOKEN
                    }
                },
                {
                    logicContract: NATIVE_TOKEN,
                    creatorLogic: [
                        new UniformInteractionPower(BigInt(10)).ifResultOf(NATIVE_TOKEN, "0x70a08231", "0x00").gt(BigInt(0))
                    ],
                    minterLogic: []
                }
            ],
            transportLayer: {
                createStartInSeconds: Math.floor(Date.now() / 1000),
                mintStartInSeconds: Math.floor(Date.now() / 1000) + 1000,
                mintEndInSeconds: Math.floor(Date.now() / 1000) + 2000,
                rewards: {
                    ranks: [1],
                    allocations: [BigInt(0.000777 * 10 ** 18)],
                    totalAllocation: BigInt(0.000777 * 10 ** 18),
                    token: NATIVE_TOKEN
                }
            }
        })).not.toThrow()
    })
})


describe("create token validation", () => {

    test("invalid channel address fails", () => {
        expect(() => validateCreateTokenInputs({
            channelAddress: "invalid",
            uri: "https://sample.com",
            maxSupply: BigInt(10)
        })).toThrow(InvalidArgumentError)
    })

    test("invalid token uri fails", () => {
        expect(() => validateCreateTokenInputs({
            channelAddress: NATIVE_TOKEN,
            uri: "",
            maxSupply: BigInt(10)
        })).toThrow(InvalidArgumentError)
    });

    test("invalid max supply fails", () => {
        expect(() => validateCreateTokenInputs({
            channelAddress: NATIVE_TOKEN,
            uri: "https://sample.com",
            maxSupply: BigInt(0)
        })).toThrow(InvalidArgumentError)
    })

    test("valid create token inputs passes", () => {
        expect(() => validateCreateTokenInputs({
            channelAddress: NATIVE_TOKEN,
            uri: "https://sample.com",
            maxSupply: BigInt(10)
        })).not.toThrow()
    })
})

describe("validate mint token inputs", () => {

    test("invalid channel address fails", () => {
        expect(() => validateMintTokenBatchInputs({
            channelAddress: "invalid",
            to: NATIVE_TOKEN,
            tokenIds: [BigInt(1)],
            amounts: [1],
            mintReferral: NATIVE_TOKEN,
            data: "0x00"
        })
        ).toThrow(InvalidArgumentError)
    })

    test("invalid to address fails", () => {
        expect(() => validateMintTokenBatchInputs({
            channelAddress: NATIVE_TOKEN,
            to: "invalid",
            tokenIds: [BigInt(1)],
            amounts: [1],
            mintReferral: NATIVE_TOKEN,
            data: "0x00"
        })
        ).toThrow(InvalidArgumentError)
    })

    /// hmmmm
    test("invalid to address fails", () => {
        expect(() => validateMintTokenBatchInputs({
            channelAddress: NATIVE_TOKEN,
            to: "invalid",
            tokenIds: [BigInt(1)],
            amounts: [1],
            mintReferral: NATIVE_TOKEN,
            data: "0x00"
        })
        ).toThrow(InvalidArgumentError)
    })


    test("empty token ids fails", () => {
        expect(() => validateMintTokenBatchInputs({
            channelAddress: NATIVE_TOKEN,
            to: NATIVE_TOKEN,
            tokenIds: [],
            amounts: [1],
            mintReferral: NATIVE_TOKEN,
            data: "0x00"
        })
        ).toThrow(InvalidArgumentError)
    })

    test("uneven array length fails", () => {
        expect(() => validateMintTokenBatchInputs({
            channelAddress: NATIVE_TOKEN,
            to: NATIVE_TOKEN,
            tokenIds: [BigInt(1), BigInt(2)],
            amounts: [1],
            mintReferral: NATIVE_TOKEN,
            data: "0x00"
        })
        ).toThrow(InvalidArgumentError)
    })


    test("invalid amount field fails", () => {
        expect(() => validateMintTokenBatchInputs({
            channelAddress: NATIVE_TOKEN,
            to: NATIVE_TOKEN,
            tokenIds: [BigInt(1), BigInt(2)],
            amounts: [1, 0],
            mintReferral: NATIVE_TOKEN,
            data: "0x00"
        })
        ).toThrow(InvalidArgumentError)
    })
})

describe("validate withdraw rewards inputs", () => {
    test("invalid channel address fails", () => {
        expect(() => validateWithdrawRewardsInputs({
            channelAddress: "invalid",
            token: NATIVE_TOKEN,
            to: NATIVE_TOKEN,
            amount: BigInt(10)
        })
        ).toThrow(InvalidArgumentError)
    });

    test("invalid token address fails", () => {
        expect(() => validateWithdrawRewardsInputs({
            channelAddress: NATIVE_TOKEN,
            token: "invalid",
            to: NATIVE_TOKEN,
            amount: BigInt(10)
        })
        ).toThrow(InvalidArgumentError)
    });

    test("invalid recipient address fails", () => {
        expect(() => validateWithdrawRewardsInputs({
            channelAddress: NATIVE_TOKEN,
            token: NATIVE_TOKEN,
            to: "invalid",
            amount: BigInt(10)
        })
        ).toThrow(InvalidArgumentError)
    });

    test("invalid amount fails", () => {
        expect(() => validateWithdrawRewardsInputs({
            channelAddress: NATIVE_TOKEN,
            token: NATIVE_TOKEN,
            to: NATIVE_TOKEN,
            amount: BigInt(0)
        })
        ).toThrow(InvalidArgumentError)
    });

    test("passes on valid inputs", () => {
        expect(() => validateWithdrawRewardsInputs({
            channelAddress: NATIVE_TOKEN,
            token: NATIVE_TOKEN,
            to: NATIVE_TOKEN,
            amount: BigInt(10)
        })
        ).not.toThrow()
    });
})

describe("validate sponsor token inputs", () => {
    const deferredTokenIntent: DeferredTokenIntent = {
        author: zeroAddress,
        intent: {
            domain: {
                name: "Transmissions",
                version: "1",
                chainId: 1234, // Should be a number
                verifyingContract: zeroAddress
            },
            types: {
                DeferredTokenPermission: [
                    { name: "uri", type: "string" },
                    { name: "maxSupply", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                    { name: "nonce", type: "bytes32" }
                ]
            },
            primaryType: "DeferredTokenPermission",
            message: {
                uri: "sample uri",
                maxSupply: BigInt(100),
                deadline: BigInt(Math.floor(Date.now() / 1000) + 2400),
                nonce: '0x' + randomBytes(32).toString("hex") as Hex
            }
        }
    }


    test("mismatched target channel addresses fails", async () => {
        const sponsorTokenInputs: SponsorTokenConfig = {
            channelAddress: zeroAddress,
            sponsoredToken: {
                ...deferredTokenIntent,
                intent: {
                    ...deferredTokenIntent.intent,
                    domain: {
                        ...deferredTokenIntent.intent.domain,
                        verifyingContract: testClient.account.address // different from channel address
                    }
                },
                signature: "0x00"
            },
            to: zeroAddress,
            amount: 10,
            mintReferral: zeroAddress,
            data: ""
        }

        await expect(validateSponsorTokenInputs(sponsorTokenInputs)).rejects.toThrow(InvalidArgumentError)
    })

    test("invalid amount to mint fails", async () => {
        const sponsorTokenInputs: SponsorTokenConfig = {
            channelAddress: zeroAddress,
            sponsoredToken: { ...deferredTokenIntent, signature: "0x00" },
            to: zeroAddress,
            amount: 0,
            mintReferral: zeroAddress,
            data: ""
        }

        await expect(validateSponsorTokenInputs(sponsorTokenInputs)).rejects.toThrow(InvalidArgumentError)
    })

    test("invalid deadline fails", async () => {
        const sponsorTokenInputs: SponsorTokenConfig = {
            channelAddress: zeroAddress,
            sponsoredToken: {
                ...deferredTokenIntent,
                intent: {
                    ...deferredTokenIntent.intent,
                    message: {
                        ...deferredTokenIntent.intent.message,
                        deadline: BigInt(Math.floor(Date.now() / 1000) - 100)
                    }
                },
                signature: "0x00"
            },
            to: zeroAddress,
            amount: 10,
            mintReferral: zeroAddress,
            data: ""
        }

        await expect(validateSponsorTokenInputs(sponsorTokenInputs)).rejects.toThrow(InvalidArgumentError)
    })

    test("pass on valid inputs", async () => {
        const signature = await testClient.signTypedData(deferredTokenIntent.intent);

        const sponsorTokenInputs: SponsorTokenConfig = {
            channelAddress: zeroAddress,
            sponsoredToken: { ...deferredTokenIntent, author: testClient.account.address, signature },
            to: zeroAddress,
            amount: 10,
            mintReferral: zeroAddress,
            data: ""
        }

        await expect(validateSponsorTokenInputs(sponsorTokenInputs)).resolves.not.toThrow()
    })

})
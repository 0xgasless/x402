import { Hono } from "hono";
import type { PublicClient, Address, Hex } from "viem";
import { parseErc6492Signature, encodeFunctionData } from "viem";
import { verify as x402Verify } from "x402/schemes";
import type { PaymentPayload, PaymentRequirements, VerifyResponse, SettleResponse, ExactEvmPayload } from "x402/types";
import type { Config } from "./config";
import type { SmartAccountClient } from "@0xgasless/dev-account";
import { PaymasterMode } from "@0xgasless/dev-account";
import { getUsdcAddress } from "./evm";

const usdcABI = [
  {
    type: "function",
    name: "transferWithAuthorization",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export function createRoutes(
  viemClient: PublicClient,
  gaslessClient: SmartAccountClient,
  config: Config,
) {
  const app = new Hono();

  app.post("/verify", async (c) => {
    try {
      const body = await c.req.json();
      const { x402Version, paymentPayload, paymentRequirements } = body as {
        x402Version: string;
        paymentPayload: PaymentPayload;
        paymentRequirements: PaymentRequirements;
      };

      const result: VerifyResponse = await x402Verify(
        viemClient,
        paymentPayload,
        paymentRequirements,
      );

      if (!result.isValid) {
        return c.json(result, 402);
      }

      return c.json(result, 200);
    } catch (error) {
      console.error("Verify error:", error);
      return c.json(
        {
          isValid: false,
          invalidReason: "internal_error",
          payer: "",
        },
        400,
      );
    }
  });

  app.post("/settle", async (c) => {
    try {
      const body = await c.req.json();
      const { x402Version, paymentPayload, paymentRequirements } = body as {
        x402Version: string;
        paymentPayload: PaymentPayload;
        paymentRequirements: PaymentRequirements;
      };

      const verifyResult: VerifyResponse = await x402Verify(
        viemClient,
        paymentPayload,
        paymentRequirements,
      );

      if (!verifyResult.isValid) {
        const response: SettleResponse = {
          success: false,
          errorReason: verifyResult.invalidReason ?? "invalid_payment",
          transaction: "",
          network: paymentPayload.network,
          payer: verifyResult.payer,
        };
        return c.json(response, 402);
      }

      const payload = paymentPayload.payload as ExactEvmPayload;
      const { signature } = parseErc6492Signature(payload.signature as Hex);

      const usdcAddress = getUsdcAddress(config.chainId);

      const calldata = encodeFunctionData({
        abi: usdcABI,
        functionName: "transferWithAuthorization",
        args: [
          payload.authorization.from as Address,
          payload.authorization.to as Address,
          BigInt(payload.authorization.value),
          BigInt(payload.authorization.validAfter),
          BigInt(payload.authorization.validBefore),
          payload.authorization.nonce as Hex,
          signature,
        ],
      });

      const userOpResult = await gaslessClient.sendTransaction(
        {
          to: usdcAddress,
          value: 0n,
          data: calldata,
        },
        {
          paymasterServiceData: {
            mode: PaymasterMode.SPONSORED,
          },
        },
      );

      const receipt = await userOpResult.wait();

      if (receipt.status !== "success") {
        const response: SettleResponse = {
          success: false,
          errorReason: "transaction_failed",
          transaction: receipt.transactionHash ?? "",
          network: paymentPayload.network,
          payer: payload.authorization.from,
        };
        return c.json(response, 402);
      }

      const response: SettleResponse = {
        success: true,
        transaction: receipt.transactionHash ?? "",
        network: paymentPayload.network,
        payer: payload.authorization.from,
      };

      return c.json(response, 200);
    } catch (error) {
      console.error("Settle error:", error);
      return c.json(
        {
          success: false,
          errorReason: "internal_error",
          transaction: "",
          network: "",
          payer: "",
        },
        402,
      );
    }
  });

  app.get("/supported", async (c) => {
    const supported = {
      schemes: ["exact"],
      networks: [
        {
          network: "avalanche-fuji",
          chainId: 43113,
          tokens: [
            {
              symbol: "USDC",
              address: "0x5425890298aed601595a70AB815c96711a31Bc65",
            },
          ],
        },
        {
          network: "avalanche",
          chainId: 43114,
          tokens: [
            {
              symbol: "USDC",
              address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            },
          ],
        },
      ],
    };

    return c.json(supported, 200);
  });

  return app;
}

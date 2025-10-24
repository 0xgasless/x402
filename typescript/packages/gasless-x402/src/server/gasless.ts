import { createSmartAccountClient, type SmartAccountClient } from "@0xgasless/dev-account";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import type { Config } from "./config";
import { getChain } from "./evm";

export async function createGaslessClient(config: Config): Promise<SmartAccountClient> {
  const privateKey = process.env.GASLESS_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("GASLESS_PRIVATE_KEY environment variable is required");
  }

  const signer: PrivateKeyAccount = privateKeyToAccount(privateKey as `0x${string}`);
  const chain = getChain(config.chainId);

  const client = await createSmartAccountClient({
    signer,
    bundlerUrl: config.bundlerUrl,
    paymasterUrl: config.paymasterUrl,
    chainId: config.chainId,
  });

  return client;
}

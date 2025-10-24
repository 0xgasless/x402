import { createPublicClient, http, type PublicClient, type Address } from "viem";
import { avalanche, avalancheFuji } from "viem/chains";
import type { Config } from "./config";

export const USDC_ADDRESSES: Record<number, Address> = {
  43113: "0x5425890298aed601595a70AB815c96711a31Bc65",
  43114: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
};

export function getChain(chainId: number) {
  switch (chainId) {
    case 43113:
      return avalancheFuji;
    case 43114:
      return avalanche;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

export function createViemClient(config: Config): PublicClient {
  const chain = getChain(config.chainId);
  
  return createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });
}

export function getUsdcAddress(chainId: number): Address {
  const address = USDC_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`USDC not supported on chainId: ${chainId}`);
  }
  return address;
}

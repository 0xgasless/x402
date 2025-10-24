import { z } from "zod";

const ConfigSchema = z.object({
  rpcUrl: z.string().url(),
  chainId: z.number(),
  bundlerUrl: z.string().url(),
  paymasterUrl: z.string().url(),
});

export type Config = z.infer<typeof ConfigSchema>;

export async function loadConfig(): Promise<Config> {
  const configPath = new URL("../../config.json", import.meta.url);
  const file = Bun.file(configPath);
  const json = await file.json();

  const config: Config = {
    rpcUrl: process.env.GASLESS_RPC_URL ?? json.rpcUrl,
    chainId: process.env.GASLESS_CHAIN_ID ? parseInt(process.env.GASLESS_CHAIN_ID) : json.chainId,
    bundlerUrl: process.env.GASLESS_BUNDLER_URL ?? json.bundlerUrl,
    paymasterUrl: process.env.GASLESS_PAYMASTER_URL ?? json.paymasterUrl,
  };

  return ConfigSchema.parse(config);
}

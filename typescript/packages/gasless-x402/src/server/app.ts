import { Hono } from "hono";
import { loadConfig } from "./config";
import { createViemClient } from "./evm";
import { createGaslessClient } from "./gasless";
import { createRoutes } from "./routes";

const app = new Hono();

const PORT = process.env.PORT ?? 3402;

async function main() {
  const config = await loadConfig();
  console.log("Loaded config:", {
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
  });

  const viemClient = createViemClient(config);
  console.log("Created viem client");

  const gaslessClient = await createGaslessClient(config);
  console.log("Created gasless client");

  const routes = createRoutes(viemClient, gaslessClient, config);
  app.route("/", routes);

  console.log(`🚀 Gasless X402 Facilitator running on port ${PORT}`);
}

main().catch(console.error);

export default {
  port: PORT,
  fetch: app.fetch,
};

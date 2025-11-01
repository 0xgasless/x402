import { Address } from "viem";
import { paymentMiddleware } from "x402-next";

const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const facilitatorUrl = "https://x402.0xgasless.com/";

export const middleware = paymentMiddleware(
  payTo,
  {
    "/protected": {
      price: "$0.001",
      network: "avalanche",
      config: {
        description: "Access to protected content",
      },
    },
  },
  { url: facilitatorUrl },
  {
    appName: "Mainnet x402 Demo",
    appLogo: "/x402-icon-blue.png",
    sessionTokenEndpoint: "/api/x402/session-token",
  },
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/protected/:path*"],
};

import { config } from "dotenv";
import express from "express";
import { paymentMiddleware } from "x402-express";

config();

const payToAddress = process.env.ADDRESS as `0x${string}`;
const facilitatorUrl = process.env.FACILITATOR_URL || "https://x402.0xgasless.com/";

if (!payToAddress) {
  console.error("Missing required environment variable: ADDRESS");
  process.exit(1);
}

const app = express();

app.use(
  paymentMiddleware(
    payToAddress,
    {
      "GET /weather": {
        // USDC amount in dollars
        price: "$0.001",
        network: "avalanche",
      },
    },
    // Pass the facilitator URL to the payment middleware
    { url: facilitatorUrl },
  ),
);

app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});

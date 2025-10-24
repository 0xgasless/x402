# @0xgasless/x402

Gasless X402 Facilitator for Avalanche - A Bun-powered HTTP facilitator service implementing `verify` and `settle` for EVM exact scheme on Avalanche (Fuji + C-Chain) with sponsored gas via the 0xgasless stack.

## Features

- **Networks**: Avalanche Fuji (43113) and C-Chain (43114)
- **Scheme**: EVM exact scheme only
- **Token**: USDC (chain-specific addresses)
- **Gas Sponsorship**: Settles transactions using 0xgasless bundler + paymaster
- **No Auth Required**: Simplified facilitator without API keys
- **Bun Runtime**: Fast, modern JavaScript runtime

## Installation

```bash
npm install @0xgasless/x402
```

## Client SDK Usage

```typescript
import { createFacilitatorConfig } from "@0xgasless/x402";
import { paymentMiddleware } from "x402-express";

const facilitator = createFacilitatorConfig("http://localhost:3402");

app.use(paymentMiddleware(
  "0xYourAddress",
  {
    "/protected": {
      price: "$0.10",
      network: "avalanche-fuji"
    }
  },
  facilitator
));
```

## Running the Facilitator Server

### Prerequisites

- Bun runtime installed (`curl -fsSL https://bun.sh/install | bash`)
- Gasless infrastructure:
  - Bundler URL for Avalanche (Fuji or C-Chain)
  - Paymaster URL with sponsorship enabled
  - Private key for facilitator signer (EOA with smart account permissions)

### Configuration

Create `config.json`:

```json
{
  "rpcUrl": "https://api.avax-test.network/ext/bc/C/rpc",
  "chainId": 43113,
  "bundlerUrl": "https://bundler.example.com",
  "paymasterUrl": "https://paymaster.example.com"
}
```

Environment variables (override config.json):

```bash
GASLESS_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
GASLESS_CHAIN_ID=43113
GASLESS_BUNDLER_URL=https://bundler.example.com
GASLESS_PAYMASTER_URL=https://paymaster.example.com
GASLESS_PRIVATE_KEY=0x...  # Required for settlement
PORT=3402  # Optional, defaults to 3402
```

### Start the Server

```bash
# Development mode (hot reload)
bun run dev

# Production mode
bun run start
```

## API Endpoints

### POST /verify

Verifies payment payload against requirements.

```bash
curl -X POST http://localhost:3402/verify \
  -H "Content-Type: application/json" \
  -d '{
    "x402Version": "1.0",
    "paymentPayload": { ... },
    "paymentRequirements": { ... }
  }'
```

**Response (200 OK)**:
```json
{
  "isValid": true,
  "payer": "0x..."
}
```

**Response (402 Payment Required)**:
```json
{
  "isValid": false,
  "invalidReason": "insufficient_funds",
  "payer": "0x..."
}
```

### POST /settle

Settles payment using gasless transaction.

```bash
curl -X POST http://localhost:3402/settle \
  -H "Content-Type: application/json" \
  -d '{
    "x402Version": "1.0",
    "paymentPayload": { ... },
    "paymentRequirements": { ... }
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "transaction": "0x...",
  "network": "avalanche-fuji",
  "payer": "0x..."
}
```

**Response (402 Payment Required)**:
```json
{
  "success": false,
  "errorReason": "transaction_failed",
  "transaction": "0x...",
  "network": "avalanche-fuji",
  "payer": "0x..."
}
```

### GET /supported

Returns supported networks and tokens.

```bash
curl http://localhost:3402/supported
```

**Response (200 OK)**:
```json
{
  "schemes": ["exact"],
  "networks": [
    {
      "network": "avalanche-fuji",
      "chainId": 43113,
      "tokens": [
        {
          "symbol": "USDC",
          "address": "0x5425890298aed601595a70AB815c96711a31Bc65"
        }
      ]
    },
    {
      "network": "avalanche",
      "chainId": 43114,
      "tokens": [
        {
          "symbol": "USDC",
          "address": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
        }
      ]
    }
  ]
}
```

## USDC Addresses

- **Avalanche Fuji (43113)**: `0x5425890298aed601595a70AB815c96711a31Bc65`
- **Avalanche C-Chain (43114)**: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`

## How It Works

1. **Verify**: Uses viem public client to validate payment payload via x402 `verify()` function
2. **Settle**: 
   - Re-verifies the payment
   - Encodes USDC `transferWithAuthorization` calldata (EIP-3009)
   - Sends transaction via 0xgasless smart account with sponsored gas
   - Returns settlement result with transaction hash

## Development

```bash
# Build package
bun run build

# Run tests
bun run test

# Format code
bun run format

# Lint code
bun run lint
```

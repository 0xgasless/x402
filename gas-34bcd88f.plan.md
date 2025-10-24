<!-- 34bcd88f-d3ce-4e13-a938-92d9a50f6584 1a776158-07d8-4e7e-925d-5b8027b5ecfd -->
# Gasless X402 MVP (Clean Plan)

## What we will build

- A minimal `@0xgasless/x402` package containing:
  - A tiny client SDK that provides a `FacilitatorConfig` (URL + headers) for x402 middlewares.
  - A Bun-powered HTTP facilitator service implementing `verify` and `settle` for EVM exact scheme on Avalanche (Fuji + C-Chain).

## Scope (explicit)

- Networks: `avalanche-fuji` (43113), `avalanche` (43114)
- Scheme: exact (EVM only)
- Token: USDC (chain-specific addresses)
- No auth, no sqlite, no API keys
- Configuration via JSON + ENV (Bun runtime only, no Node-specific APIs)
- Settle via `@0xgasless/dev-account` (sponsored UserOps with bundler + paymaster)
- Optional `GET /supported` added last

## Prerequisites: Gasless stack on Avalanche

- Bundler: reachable `bundlerUrl` for the target chain (e.g., Fuji 43113 or C-Chain 43114)
- Paymaster: reachable `paymasterUrl` for the target chain (sponsorship enabled)
- EntryPoint: v0.8 is assumed by the SDK
- Facilitator signer EOA: `GASLESS_PRIVATE_KEY` with permissions to deploy/use smart account

## Package layout (paths and roles)

- `x402/typescript/packages/gasless-x402/`
  - `src/index.ts`
    - `createFacilitatorConfig(baseUrl?: string)` → returns `{ url, createAuthHeaders }`
    - `createAuthHeaders()` → adds only `Correlation-Context` for `verify|settle|supported|list`
  - `src/server/app.ts`
    - Hono+Bun entry (`Bun.serve({ fetch: app.fetch })`); mounts routes
  - `src/server/config.ts`
    - Loads `config.json` via `Bun.file().json()` with ENV overrides
    - Fields: `rpcUrl`, `chainId`, `bundlerUrl`, `paymasterUrl`
  - `src/server/evm.ts`
    - USDC addresses (Fuji, C-Chain), chain helpers, viem public client
  - `src/server/gasless.ts`
    - `createSmartAccountClient` factory using `GASLESS_PRIVATE_KEY`, `bundlerUrl`, `paymasterUrl`, `chainId`
  - `src/server/routes.ts`
    - `POST /verify`: call x402 `verify()` with a viem client
    - `POST /settle`: encode USDC `transferWithAuthorization` calldata, send with gasless client, return x402 `SettleResponse`
    - `GET /supported`: static networks/tokens (added last)
  - `package.json`
    - Bun scripts: `dev`, `start`, `build`, `test`

## Endpoints (request/response + status)

- `POST /verify`
  - Body: `{ x402Version, paymentPayload, paymentRequirements }`
  - Behavior: Build viem client (from `rpcUrl`) → `x402.verify()` → return `VerifyResponse`
  - Status: `200` on success; `400/402` if invalid/unsupported
- `POST /settle`
  - Body: `{ x402Version, paymentPayload, paymentRequirements }`
  - Behavior: Re-run `verify`; if invalid → `402`. Else encode `transferWithAuthorization` and `sendTransaction({ to: usdc, value: 0, data })` with `PaymasterMode.SPONSORED`; await receipt; return `SettleResponse`
  - Status: `200` on success; `402` on settlement failure
- `GET /supported` (later)
  - Static: networks + USDC addresses + `schemes:["exact"]`

## Configuration

- File: `x402/typescript/packages/gasless-x402/config.json`
  - `{ "rpcUrl": "...", "chainId": 43113, "bundlerUrl": "...", "paymasterUrl": "..." }`
- ENV overrides (read in `config.ts`): `GASLESS_RPC_URL`, `GASLESS_CHAIN_ID`, `GASLESS_BUNDLER_URL`, `GASLESS_PAYMASTER_URL`
- Private key: `GASLESS_PRIVATE_KEY` (required for settlement signer)

## How settlement uses the Gasless SDK on Avalanche

- Build a smart account client using `@0xgasless/dev-account`:
  - Inputs: `signer` (EOA from `GASLESS_PRIVATE_KEY`), `bundlerUrl`, `paymasterUrl`, `chainId`
  - Mode: `PaymasterMode.SPONSORED` for gas sponsorship
- Prepare calldata for USDC `transferWithAuthorization` (EIP-3009):
  - Args: `from, to, value, validAfter, validBefore, nonce, signature`
  - If signature is ERC-6492-wrapped, unwrap before encoding
- Send transaction via smart account:
  - `sendTransaction({ to: <USDC address>, value: 0, data }, { paymasterServiceData: { mode: SPONSORED } })`
  - Await userOp result → wait for receipt
- Map result to `SettleResponse`:
  - Success: `{ success: true, transaction: <hash>, network, payer }`
  - Failure: `{ success: false, errorReason, transaction?: <hash>, network, payer }`

Example (conceptual):

```ts
import { PaymasterMode, createSmartAccountClient } from "@0xgasless/dev-account";

const smart = await createSmartAccountClient({
  signer,                  // from GASLESS_PRIVATE_KEY
  bundlerUrl,              // config
  paymasterUrl,            // config
  chainId,                 // 43113 or 43114
});

const userOp = await smart.sendTransaction(
  { to: usdcAddress, value: 0n, data: calldata },
  { paymasterServiceData: { mode: PaymasterMode.SPONSORED } },
);

const receipt = await userOp.wait();
```

## Implementation details

- Mirror request/response shapes and error codes used by x402 middlewares to stay compatible
- Use Bun runtime only (e.g., `Bun.file`, `Bun.serve`)
- EVM verify: reuse `x402` verify with a viem ConnectedClient
- EVM settle: follow x402 exact EVM argument order; unwrap ERC-6492 if present
- USDC addresses:
  - Fuji: `0x5425890298aed601595a70AB815c96711a31Bc65`
  - C-Chain: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`

## Dev scripts (Bun)

- `bun run dev` → start server with hot reload (tsx)
- `bun run start` → start server
- `bun run build` → tsup build (esm+cjs)
- `bun run test` → vitest smoke tests

## Integration example

- Client SDK usage:
  - `import { createFacilitatorConfig } from "@0xgasless/x402";`
  - `const facilitator = createFacilitatorConfig("http://localhost:3402");`
  - Pass `facilitator` into `x402-express`/`x402-hono` middleware

## Out of scope

- Any authentication (API keys/JWT), sqlite, rate-limiting, paywall UI customization beyond defaults

## To-dos

- [ ] Create client SDK with createFacilitatorConfig (no auth)
- [ ] Add Hono+Bun app with config loader and route wiring
- [ ] Implement POST /verify using viem and x402.verify
- [ ] Implement POST /settle using gasless client and USDC calldata
- [ ] Add GET /supported (Avalanche + USDC)
- [ ] Write README with Bun commands and curl examples

### To-dos

- [ ] Create client SDK with createFacilitatorConfig (no auth)
- [ ] Add Hono+Bun app with config loader and route wiring
- [ ] Implement POST /verify using viem and x402.verify
- [ ] Implement POST /settle using gasless client and USDC calldata
- [ ] Add GET /supported (Avalanche + USDC)
- [ ] Write README with Bun commands and curl examples
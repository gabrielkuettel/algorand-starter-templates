# Algorand Starter Templates

## What This Is

This repo contains three progressively more complete Algorand dApp starter templates, designed as flat GitHub repos you can clone directly (not generated via `algokit init`). The original `algokit init` output is in `hello-world/` for reference.

## The Three Tiers

### `algorand-starter-contracts/` -- Contracts Only
Just smart contracts, compilation, tests, and deployment. No frontend.

```
src/hello-world.algo.ts         # Contract source (Algorand TypeScript)
src/hello-world.algo.spec.ts    # Unit test (pure TS, no network)
src/hello-world.e2e.spec.ts     # E2E test (deploys to LocalNet)
artifacts/                       # Build output: TEAL, ABI specs, typed client
deploy.ts                        # Deployment script
.env.localnet / .env.testnet / .env.mainnet
```

### `algorand-starter-fullstack/` -- Contracts + Frontend
Adds a React frontend connected to contracts via npm workspaces.

```
contracts/                       # @repo/contracts package (same as Tier 1)
app/                             # @repo/app package (React + Vite)
  src/App.tsx                    # WalletProvider + WalletUIProvider + WalletButton
  src/components/AppCalls.tsx    # Contract interaction component
  src/utils/algorand.ts          # AlgorandClient config helper
```

### `algorand-starter-kitchensink/` -- Kitchen Sink
Everything from Tier 2, plus an event subscriber and a CI workflow.

```
contracts/                       # (identical to Tier 2)
app/                             # (identical to Tier 2)
subscriber/                      # @repo/subscriber package
  src/index.ts                   # Connects to algod, filters by APP_ID
  src/handlers.ts                # Logs [ALERT] for UpdateApplication/DeleteApplication
  src/watermark.ts               # File-based bigint persistence to survive restarts
.github/workflows/ci.yaml       # PR validation: test, type-check, build frontend
```

## Key Architecture Decisions

### npm Workspaces (Tiers 2 & 3)
The contracts package exports the generated typed client directly as TypeScript:
```json
// contracts/package.json
{ "exports": { ".": "./artifacts/HelloWorldClient.ts" } }
```
The frontend imports it as a workspace dependency:
```ts
import { HelloWorldFactory } from '@repo/contracts'
```
Vite transpiles the `.ts` file on the fly. No file copying, no `algokit project link`.

### Build Pipeline
`npm run build` runs two steps:
1. `algokit compile ts src --output-source-map --out-dir ../artifacts` -- compiles `.algo.ts` to TEAL + ABI specs. The `--out-dir` is relative to the source directory, so `../artifacts` lands at the package root.
2. `algokit generate client artifacts --output {app_spec_dir}/{contract_name}Client.ts` -- generates `HelloWorldClient.ts` from the ABI spec.

Artifacts (TEAL, ABI JSON, typed client) are committed to git. Only `.puya.map` source maps are gitignored.

### Deployment
The deploy script (`deploy.ts`) configures both algod and indexer clients via env vars. `factory.deploy()` uses the indexer to check for existing app deployments, making it idempotent.

On LocalNet, the default dispenser account is used (no mnemonic needed). On testnet/mainnet, `DEPLOYER_MNEMONIC` must be set. Uses `tsx --env-file=.env.localnet deploy.ts` to load env vars without dotenv.

### Environment Strategy
No `.env` files are committed -- only `.env*.example` templates. Gitignore uses `.env*` / `!.env*.example` to catch everything.

```bash
# Contracts (all tiers):
cp .env.localnet.example .env.localnet          # LocalNet defaults (algod + indexer)
cp .env.testnet.example .env.testnet             # Set DEPLOYER_MNEMONIC, uses Nodely
cp .env.mainnet.example .env.mainnet             # Set DEPLOYER_MNEMONIC, uses Nodely

# Frontend (fullstack/kitchensink):
cp app/.env.local.example app/.env.local

# Subscriber (kitchensink):
cp subscriber/.env.local.example subscriber/.env.local  # Set APP_ID after deploy
```

### Frontend Wallet UI
Uses `@txnlab/use-wallet-ui-react` with `WalletButton` component for wallet connection. Tailwind CSS v4 with `@tailwindcss/vite` plugin (no postcss.config or tailwind.config needed). Dark mode with system preference detection. Configured wallets: Pera and Lute.

### Frontend Deploy Cache
`AppCalls.tsx` uses `factory.deploy()` which needs either an indexer client or an `existingDeployments` cache to check for existing apps. The frontend `AlgorandClient` doesn't configure an indexer (it only has algod), so an empty `existingDeployments` cache is passed. The resulting `appClient` is stored in a `useRef` -- first call deploys, subsequent calls reuse the cached client.

### Subscriber (Tier 3)
Monitors all 6 application call `OnComplete` types for a given APP_ID. Logs `[ALERT]` for `UpdateApplication` and `DeleteApplication` (security-critical -- could indicate compromised deployer key). Uses file-based watermark persistence (`bigint` values) so it doesn't miss events across restarts.

The subscriber loads its env via `tsx --env-file=.env.local`. `APP_ID` must be set after deploying the contract.

## Consistency Rules

- **Tiers 2 and 3 share identical `contracts/` and `app/` directories.** When editing one, sync the other.
- **Tier 1's contract `package.json` is identical to Tiers 2/3** (`@repo/contracts` name, same `exports` field). The scoped name is harmless standalone since it's `"private": true`.
- **The deploy script (`deploy.ts`) and env example files are identical across all tiers.**

## Tech Stack

| Component | Tool |
|-----------|------|
| Smart contracts | Algorand TypeScript (`@algorandfoundation/algorand-typescript`) |
| Compiler | puya-ts (`@algorandfoundation/puya-ts`) via `algokit compile ts` |
| Client generator | `algokit generate client` |
| Contract tests | Vitest + `algorand-typescript-testing` (unit) + `algokit-utils/testing` (e2e) |
| Deploy runner | tsx |
| Frontend | React 19 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Wallet UI | `@txnlab/use-wallet-ui-react` + `@txnlab/use-wallet-react` |
| Algorand SDK | `algosdk` v3 + `@algorandfoundation/algokit-utils` v9 |
| Subscriber | `@algorandfoundation/algokit-subscriber` |
| Node API (testnet/mainnet) | Nodely free tier (`4160.nodely.dev`) |

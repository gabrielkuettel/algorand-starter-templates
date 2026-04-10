# Algorand Starter Templates

## What This Is

This repo contains three progressively more complete Algorand dApp starter templates, designed as flat GitHub repos you can clone directly (not generated via `algokit init`). They were created as a simplified alternative to the output of `algokit init`, which produces ~40+ files with CI/CD workflows, VSCode workspace configs, and AlgoKit-specific orchestration that obscures the actual contract and frontend code.

The original `algokit init` output is in `hello-world/` for reference. The three templates are:

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
contracts/                       # @repo/contracts package
  (same structure as Tier 1)
app/                             # @repo/app package (React + Vite)
  src/App.tsx                    # WalletProvider + WalletUIProvider + WalletButton
  src/components/AppCalls.tsx    # Contract interaction component
  src/utils/algorand.ts          # AlgorandClient config helper
```

### `algorand-starter-kitchensink/` -- Kitchen Sink
Everything from Tier 2, plus an event subscriber for monitoring contract lifecycle calls, and a CI workflow.

```
contracts/                       # (identical to Tier 2)
app/                             # (identical to Tier 2)
subscriber/                      # @repo/subscriber package
  src/index.ts                   # Connects to algod, filters by APP_ID
  src/handlers.ts                # Logs [ALERT] for UpdateApplication/DeleteApplication
  src/watermark.ts               # File-based persistence to survive restarts
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
1. `algokit compile ts src --out-dir ../artifacts` -- compiles `.algo.ts` to TEAL + ABI specs. The `--out-dir` is relative to the source directory, so `../artifacts` lands at the package root.
2. `algokit generate client artifacts` -- generates `HelloWorldClient.ts` from the ABI spec.

Artifacts (TEAL, ABI JSON, typed client) are committed to git. Only `.puya.map` source maps are gitignored.

### Deployment + Environment Strategy
No `.env` files are committed -- only `.env*.example` templates. Users copy them and fill in values. Gitignore uses `.env*` / `!.env*.example` to catch everything.

```bash
# First time setup:
cp .env.localnet.example .env.localnet          # LocalNet (just Docker defaults)
cp .env.testnet.example .env.testnet             # Set DEPLOYER_MNEMONIC
cp .env.mainnet.example .env.mainnet             # Set DEPLOYER_MNEMONIC

# For frontend (fullstack/kitchensink):
cp app/.env.local.example app/.env.local         # LocalNet defaults + KMD wallet

npm run deploy              # LocalNet (uses dispenser, no mnemonic needed)
npm run deploy:testnet      # Needs DEPLOYER_MNEMONIC in .env.testnet
npm run deploy:mainnet      # Needs DEPLOYER_MNEMONIC in .env.mainnet
```

Uses `tsx --env-file=.env.localnet deploy.ts` to load env vars without dotenv.

### Frontend Wallet UI
Uses `@txnlab/use-wallet-ui-react` with `WalletButton` component for wallet connection. Tailwind CSS v4 with `@tailwindcss/vite` plugin (no postcss.config or tailwind.config needed). Dark mode with system preference detection.

Configured wallets are Pera and Lute (`WalletId.PERA`, `WalletId.LUTE`).

### Frontend Deploy Cache
`AppCalls.tsx` uses `factory.deploy()` which needs either an indexer client or an `existingDeployments` cache to check for existing apps. Since we don't configure an indexer, we pass an empty cache and store the resulting `appClient` in a `useRef`. First call deploys; subsequent calls reuse the cached client.

### Subscriber (Tier 3)
Monitors all 6 application call `OnComplete` types for a given APP_ID. Logs `[ALERT]` for `UpdateApplication` and `DeleteApplication` (security-critical -- could indicate compromised deployer key). Uses file-based watermark persistence so it doesn't miss events across restarts.

## Consistency Rules

- **Tiers 2 and 3 share identical `contracts/` and `app/` directories.** When editing one, sync the other.
- **Tier 1's `package.json` is identical to Tiers 2/3** (`@repo/contracts` name, same `exports` field). The scoped name is harmless standalone since it's `"private": true`.
- **The deploy script (`deploy.ts`) and env files are identical across all tiers.**

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
| Wallet UI | `@txnlab/use-wallet-ui-react` |
| Wallet management | `@txnlab/use-wallet-react` |
| Algorand SDK | `algosdk` v3 + `@algorandfoundation/algokit-utils` v9 |
| Subscriber | `@algorandfoundation/algokit-subscriber` |
| Node API (testnet/mainnet) | Nodely free tier (`4160.nodely.dev`) |

## What's NOT Included (by design)

- CI/CD workflows (except kitchensink, which includes a PR validation workflow)
- VSCode workspace configs
- `.algokit.toml` workspace orchestration
- ESLint / Prettier configs
- daisyui, notistack, playwright, jest
- Dynamic deployer (`smart_contracts/index.ts` pattern from algokit init)

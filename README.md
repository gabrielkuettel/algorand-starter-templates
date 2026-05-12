# Algorand Starter Templates

Simplified alternatives to `algokit init` output. Three progressively complete starters, designed as flat repos you clone directly.

**`algorand-starter-contracts`**: Just smart contracts, tests, and deployment.

**`algorand-starter-fullstack`**: Contracts plus a React frontend connected via npm workspaces.

**`algorand-starter-kitchensink`**: Everything above, plus an event subscriber and CI workflow.

The templates are additive -- each is a superset of the one below. Contracts, deploy scripts, and env templates are identical across all three, so you can copy a directory (e.g. `app/`) from a higher tier and add it as a workspace in `package.json`.

## Key differences from `algokit init`

These templates produce the same result (contracts, frontend, tests, deploy) with less indirection:

- **Flat npm workspaces** instead of `algokit project link` symlinking. The frontend imports the typed contract client as a local package (`@repo/contracts`), publishable to a registry when you're ready.
- **npm scripts call algokit directly** (`algokit compile ts`, `algokit generate client`) instead of routing through the AlgoKit CLI's project-level orchestration. One `package.json` to understand, not two tools.
- **Standard tooling** -- no custom build wrappers or AlgoKit-specific config files (`.algokit.toml`, `.copier-answers.yml`, etc.).
- **Minimal CI** -- one workflow that tests, type-checks, and builds. The `algokit init` output ships 6 workflow files including CD pipelines, environment-gated secrets, and Vercel deployment that aren't wired up on day one.
- **Fewer files** -- the algokit production template has ~100 files; the equivalent kitchensink has ~38, fullstack ~31, contracts-only ~13.

The original `algokit init` output is in `hello-world/` (typescript) and `hello-world-python/` for reference.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24.0 (required by `@algorandfoundation/algokit-utils@10` and `@algorandfoundation/algokit-client-generator@7`)
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) (`pipx install algokit`)
- [Docker](https://www.docker.com/) (for running LocalNet)

## Quick Start

```bash
git clone <url> algorand-starter-contracts
cd algorand-starter-contracts
cp .env.localnet.example .env.localnet
npm install
algokit localnet start
npm test              # Build + run tests against LocalNet
npm run deploy        # Deploy to LocalNet
```

For fullstack/kitchensink, also copy `contracts/.env.localnet.example` and `app/.env.local.example`.

## Directory Structures

### `algorand-starter-contracts`

```
├── src/
│   ├── hello-world.algo.ts           # Smart contract source
│   ├── hello-world.algo.spec.ts      # Unit test
│   └── hello-world.e2e.spec.ts       # E2E test (deploys to LocalNet)
├── artifacts/                         # Build output (TEAL, ABI, typed clients)
├── deploy.ts                          # Deployment script
├── .env.localnet.example
├── .env.testnet.example
├── .env.mainnet.example
├── package.json
├── tsconfig.json
└── vitest.config.mts
```

### `algorand-starter-fullstack`

```
├── contracts/                         # Smart contract package (@repo/contracts)
│   ├── src/
│   │   ├── hello-world.algo.ts
│   │   ├── hello-world.algo.spec.ts
│   │   └── hello-world.e2e.spec.ts
│   ├── artifacts/                     # Build output (TEAL, ABI, typed clients)
│   ├── deploy.ts
│   ├── .env.localnet.example
│   ├── .env.testnet.example
│   ├── .env.mainnet.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.mts
├── app/                               # React frontend (@repo/app)
│   ├── src/
│   │   ├── App.tsx                    # Wallet setup (use-wallet-ui)
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   └── AppCalls.tsx           # Contract interaction
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── utils/
│   │       └── algorand.ts            # AlgorandClient configuration
│   ├── index.html
│   ├── .env.local.example
│   ├── .env.testnet.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── package.json                       # Root workspace config
```

### `algorand-starter-kitchensink`

```
├── contracts/                         # Smart contracts (@repo/contracts)
│   ├── src/
│   │   ├── hello-world.algo.ts
│   │   ├── hello-world.algo.spec.ts
│   │   └── hello-world.e2e.spec.ts
│   ├── artifacts/
│   ├── deploy.ts
│   ├── .env.localnet.example
│   ├── .env.testnet.example
│   ├── .env.mainnet.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.mts
├── app/                               # React frontend (@repo/app)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   └── AppCalls.tsx
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── utils/
│   │       └── algorand.ts
│   ├── index.html
│   ├── .env.local.example
│   ├── .env.testnet.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── subscriber/                        # Event subscriber (@repo/subscriber)
│   ├── src/
│   │   ├── index.ts                   # Entry point -- connects to algod, filters by APP_ID
│   │   ├── handlers.ts               # Lifecycle event handlers ([ALERT] for update/delete)
│   │   └── watermark.ts              # File-based watermark persistence
│   ├── .env.local.example
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       └── ci.yaml                    # CI workflow
└── package.json                       # Root workspace config
```

## Key Details

- **Build**: `npm run build` compiles `.algo.ts` to TEAL via `algokit compile ts`, then generates a typed client via `algokit generate client`. Artifacts are committed; `.puya.map` source maps are gitignored.
- **Deploy**: `tsx --env-file=.env.localnet deploy.ts`. On LocalNet, uses the default dispenser and local indexer. On testnet/mainnet, reads `DEPLOYER_MNEMONIC` and Nodely endpoints from the env file.
- **Frontend**: React 19, Vite 6, Tailwind CSS v4. Wallet connection via `@txnlab/use-wallet-ui-react` with Pera and Lute.
- **Subscriber** (kitchensink only): Monitors application call `OnComplete` types for a given `APP_ID`. Alerts on `UpdateApplication`/`DeleteApplication`. File-based watermark for restart persistence.
- **Environment**: No `.env` files are committed. All configs ship as `.env*.example` templates. Copy them and fill in values.

# Algorand Starter Templates

Simplified alternatives to `algokit init` output. Three progressively complete starters, designed as flat repos you clone directly.

**`algorand-starter-contracts`** -- Just smart contracts, tests, and deployment. Start here if you're building contracts and don't need a frontend yet.

**`algorand-starter-fullstack`** -- Contracts plus a React frontend connected via npm workspaces. The typical starting point for a dApp.

**`algorand-starter-kitchensink`** -- Everything above, plus an event subscriber and CI workflow. This is a reference implementation showing how various Algorand technologies work together -- not necessarily a starting point, but useful to pull from.

The templates are additive. Each is a superset of the one below. Contracts, deploy scripts, and env templates are identical across all three, so you can copy a directory (e.g. `app/`) from a higher tier and add it as a workspace in `package.json`.

The original `algokit init` output is in `hello-world/` for reference.

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

## Environment Files

No `.env` files are committed. All configs ship as `.env*.example` templates.

```bash
cp .env.localnet.example .env.localnet    # LocalNet defaults
cp .env.testnet.example .env.testnet      # Set DEPLOYER_MNEMONIC
cp .env.mainnet.example .env.mainnet      # Set DEPLOYER_MNEMONIC
```

## Key Details

- **npm workspaces**: The frontend imports the typed contract client directly (`import { HelloWorldFactory } from '@repo/contracts'`). Vite transpiles the `.ts` export on the fly. No symlinking or `algokit project link`. Because it's a standard npm package, you can publish the contract client to a registry with versioning when you're ready.
- **Build**: `npm run build` compiles `.algo.ts` to TEAL via `algokit compile ts`, then generates a typed client via `algokit generate client`, rather than relying on the AlgoKit CLI. Artifacts are committed; `.puya.map` source maps are gitignored.
- **Deploy**: Uses `tsx --env-file=.env.localnet deploy.ts`. On LocalNet, uses the default dispenser. On testnet/mainnet, reads `DEPLOYER_MNEMONIC` from the env file.
- **Frontend**: React 19, Vite 6, Tailwind CSS v4. Wallet connection via `@txnlab/use-wallet-ui-react` with Pera and Lute.
- **Subscriber** (kitchensink only): Monitors application call `OnComplete` types for a given `APP_ID`. Alerts on `UpdateApplication`/`DeleteApplication`, which is a good security practice. File-based watermark for restart persistence.
# algorand-starter-templates

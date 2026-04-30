# Algorand Starter: Full Stack

A minimal full-stack Algorand dApp with smart contracts and a React frontend, connected via npm workspaces.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24.0
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) (`pipx install algokit`)
- [Docker](https://www.docker.com/) (for running LocalNet)

## Getting Started

```bash
# Copy environment templates
cp contracts/.env.localnet.example contracts/.env.localnet
cp app/.env.local.example app/.env.local

# Install all dependencies (contracts + app)
npm install

# Start the local Algorand network
algokit localnet start

# Build contracts (compile to TEAL + generate typed clients)
npm run build

# Start the frontend dev server
npm run dev
```

## Project Structure

```
contracts/                      # Smart contract package (@repo/contracts)
  src/
    hello-world.algo.ts         # Contract source
    hello-world.algo.spec.ts    # Unit test
    hello-world.e2e.spec.ts     # E2E test
  artifacts/                    # Build output (TEAL, ABI, typed clients)
  deploy.ts                     # Deployment script
  .env.localnet.example         # LocalNet config template
  .env.testnet.example          # TestNet config template
  .env.mainnet.example          # MainNet config template
app/                            # React frontend (@repo/app)
  src/
    App.tsx                     # Wallet setup (use-wallet-ui)
    components/
      AppCalls.tsx              # Contract interaction
    utils/
      algorand.ts               # AlgorandClient configuration
```

## How It Works

The frontend imports contract clients directly from the contracts package via npm workspaces:

```ts
import { HelloWorldFactory } from '@repo/contracts'
```

No file copying, no code generation in the frontend. The dependency is explicit in `package.json`.

The wallet UI is provided by [@txnlab/use-wallet-ui-react](https://github.com/TxnLab/use-wallet-ui), which gives a polished connect/disconnect button with dark mode and NFD support out of the box.

## Deploying

```bash
npm run deploy              # LocalNet (uses dispenser account)

# For TestNet/MainNet, copy the .example file first:
cp contracts/.env.testnet.example contracts/.env.testnet
# Edit contracts/.env.testnet and set DEPLOYER_MNEMONIC
npm run deploy:testnet
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile contracts and generate typed clients |
| `npm run dev` | Build contracts + start Vite dev server |
| `npm run deploy` | Build + deploy to LocalNet |
| `npm run deploy:testnet` | Build + deploy to TestNet |
| `npm test` | Run contract tests (unit + e2e) |
| `npm run check-types` | Type-check all packages |

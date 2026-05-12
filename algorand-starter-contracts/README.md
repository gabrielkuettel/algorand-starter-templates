# Algorand Starter: Smart Contracts

A minimal template for writing, compiling, testing, and deploying Algorand smart contracts in TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24.0
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) (`pipx install algokit`)
- [Docker](https://www.docker.com/) (for running LocalNet)

## Getting Started

```bash
# Copy environment template
cp .env.localnet.example .env.localnet

# Install dependencies
npm install

# Start the local Algorand network
algokit localnet start

# Build contracts (compile to TEAL + generate typed clients)
npm run build

# Run tests (unit + e2e against LocalNet)
npm test

# Deploy to LocalNet
npm run deploy
```

## Project Structure

```
src/
  hello-world.algo.ts          # Smart contract source
  hello-world.algo.spec.ts     # Unit test (pure TS, no network needed)
  hello-world.e2e.spec.ts      # E2E test (deploys to LocalNet)
artifacts/                      # Build output (TEAL, ABI, typed clients)
deploy.ts                       # Deployment script
.env.localnet.example           # LocalNet config template
.env.testnet.example            # TestNet config template (Nodely free tier)
.env.mainnet.example            # MainNet config template (Nodely free tier)
```

## Build Pipeline

`npm run build` runs two steps:

1. **Compile**: `algokit compile ts src --out-dir ../artifacts` compiles `.algo.ts` files to TEAL and ABI specs. The `--out-dir` is relative to the source directory, so `../artifacts` resolves to the package root.
2. **Generate client**: `algokit generate client artifacts` creates a typed TypeScript client (`HelloWorldClient.ts`) from the ABI spec.

## Deploying

```bash
npm run deploy              # LocalNet (uses dispenser account)
npm run deploy:testnet      # TestNet (set DEPLOYER_MNEMONIC in .env.testnet)
npm run deploy:mainnet      # MainNet (set DEPLOYER_MNEMONIC in .env.mainnet)
```

On LocalNet, the deploy script uses the default dispenser account (no mnemonic needed). For TestNet/MainNet, copy the `.example` file and set `DEPLOYER_MNEMONIC`:

```bash
cp .env.testnet.example .env.testnet
# Edit .env.testnet and set DEPLOYER_MNEMONIC
npm run deploy:testnet
```

No `.env` files are committed to git -- only `.env*.example` templates.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile contracts to TEAL and generate typed TypeScript clients |
| `npm test` | Build + run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run deploy` | Deploy to LocalNet |
| `npm run deploy:testnet` | Deploy to TestNet |
| `npm run deploy:mainnet` | Deploy to MainNet |

## Adding a New Contract

1. Create `src/my-contract.algo.ts` extending `Contract`
2. Run `npm run build` to compile and generate the typed client in `artifacts/`
3. Add tests in `src/my-contract.algo.spec.ts` (unit) and `src/my-contract.e2e.spec.ts` (e2e)

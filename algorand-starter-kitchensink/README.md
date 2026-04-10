# Algorand Starter: Kitchen Sink

A full-stack Algorand dApp with smart contracts, React frontend, and an event subscriber for monitoring application lifecycle calls.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22.0
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) (`pipx install algokit`)
- [Docker](https://www.docker.com/) (for running LocalNet)

## Getting Started

```bash
# Copy environment templates
cp contracts/.env.localnet.example contracts/.env.localnet
cp app/.env.local.example app/.env.local
cp subscriber/.env.local.example subscriber/.env.local

# Install all dependencies
npm install

# Start the local Algorand network
algokit localnet start

# Build contracts
npm run build

# Deploy the contract -- note the APP_ID in the output
npm run deploy
# => Deployed HelloWorld: APP_ID=1234

# Set the APP_ID in subscriber/.env.local
echo "APP_ID=1234" >> subscriber/.env.local

# Start the frontend
npm run dev

# In another terminal: start the subscriber
npm run dev:subscriber
```

## Project Structure

```
contracts/                      # Smart contracts (@repo/contracts)
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
subscriber/                     # Event subscriber (@repo/subscriber)
  src/
    index.ts                    # Entry point -- connects to algod, filters by APP_ID
    handlers.ts                 # Lifecycle event handlers (logs [ALERT] for update/delete)
    watermark.ts                # File-based watermark persistence
  .env.local.example            # APP_ID and network config template
```

## Deploying

```bash
npm run deploy              # LocalNet (uses dispenser account)

# For TestNet/MainNet, copy the .example file first:
cp contracts/.env.testnet.example contracts/.env.testnet
# Edit contracts/.env.testnet and set DEPLOYER_MNEMONIC
npm run deploy:testnet
```

## Subscriber

The subscriber monitors your deployed contract for all application call types:

| Event | Level | Purpose |
|-------|-------|---------|
| `NoOp` | INFO | Normal method calls -- operational telemetry |
| `OptIn` | INFO | Account opting into the app |
| `CloseOut` | INFO | Account closing out |
| `ClearState` | INFO | Account force-clearing state |
| `UpdateApplication` | **ALERT** | Contract code being updated -- security critical |
| `DeleteApplication` | **ALERT** | Contract being deleted -- security critical |

The `[ALERT]` events for UpdateApplication and DeleteApplication are the primary security concern -- in production, an unexpected update or delete could indicate a compromised deployer key.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile contracts and generate typed clients |
| `npm run deploy` | Build + deploy to LocalNet (outputs APP_ID) |
| `npm run deploy:testnet` | Build + deploy to TestNet |
| `npm run dev` | Build contracts + start Vite dev server |
| `npm run dev:subscriber` | Start the event subscriber in watch mode |
| `npm test` | Run contract tests (unit + e2e) |

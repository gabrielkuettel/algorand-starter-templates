# Python Starter Templates -- Design

Python equivalents of the TypeScript templates, using uv instead of Poetry. Same philosophy: minimal scaffolding, standard tooling, no AlgoKit orchestration layer.

## Templates

### `algorand-starter-contracts-python/`

```
smart_contracts/
  __init__.py
  __main__.py                # Build + deploy entry point (auto-discovers contracts)
  hello_world/
    contract.py              # algorand-python ARC4Contract
    deploy_config.py         # Per-contract deploy logic
  artifacts/                 # Build output: TEAL, ARC56 JSON, typed Python client
tests/
  conftest.py                # AlgorandClient fixture (defaults to localnet)
  hello_world_test.py        # Unit test (algopy_testing, no network)
  hello_world_client_test.py # E2E test (deploys to localnet)
pyproject.toml
.env.localnet.example
.env.testnet.example
.env.mainnet.example
```

### `algorand-starter-kitchensink-python/`

```
contracts/                   # uv workspace member (same contents as above)
subscriber/                  # uv workspace member
  src/
    __init__.py
    __main__.py              # Entry point
    handlers.py              # [ALERT] for update/delete
    watermark.py             # File-based persistence
  pyproject.toml             # depends on contracts via { workspace = true }
  .env.local.example         # APP_ID + algod config
pyproject.toml               # root workspace config
uv.lock
.github/workflows/ci.yaml
```

## Build and Deploy

Build runs the same two steps as TS:

```bash
algokit compile python smart_contracts/ --out-dir smart_contracts/artifacts
algokit generate client smart_contracts/artifacts --output smart_contracts/artifacts/{contract_name}_client.py
```

The `__main__.py` auto-discovers contract folders, builds each, and generates typed clients.

Deploy uses `uv run --env-file` (no python-dotenv needed, consistent with the TS approach of `tsx --env-file`):

```bash
uv run --env-file .env.localnet python -m smart_contracts deploy
uv run --env-file .env.testnet python -m smart_contracts deploy
```

On LocalNet, uses dispenser (no mnemonic). On testnet/mainnet, reads `DEPLOYER_MNEMONIC`.

## Testing

```bash
uv run pytest                                   # All tests
uv run pytest tests/hello_world_test.py         # Unit only (algopy_testing, no network)
uv run pytest tests/hello_world_client_test.py  # E2E (needs localnet)
```

## Tech Stack

| Component              | Tool                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| Smart contracts        | `algorand-python`                                                 |
| Compiler               | `puyapy` via `algokit compile python`                             |
| Client generator       | `algokit generate client`                                         |
| Tests                  | pytest + `algorand-python-testing` (unit) + `algokit-utils` (e2e) |
| Package/env management | uv                                                                |
| Subscriber             | `algokit-subscriber`                                              |

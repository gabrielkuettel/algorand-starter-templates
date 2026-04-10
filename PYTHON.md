# Python Starter Templates — Design

Python equivalents of the TypeScript starter templates, using uv instead of Poetry. Same philosophy: minimal scaffolding, standard tooling, no AlgoKit orchestration layer.

No fullstack tier — frontends are always JS/TS. Two templates: contracts-only and kitchensink.

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
.gitignore
README.md
```

### `algorand-starter-kitchensink-python/`

```
contracts/                   # uv workspace member (same contents as above)
  smart_contracts/...
  tests/...
  pyproject.toml
subscriber/                  # uv workspace member
  src/
    __init__.py
    __main__.py              # Entry point
    handlers.py              # Lifecycle event handlers ([ALERT] for update/delete)
    watermark.py             # File-based persistence
  pyproject.toml             # depends on contracts via { workspace = true }
  .env.local.example         # APP_ID + algod config
pyproject.toml               # root workspace config
uv.lock
.github/workflows/ci.yaml
.gitignore
README.md
```

## pyproject.toml Examples

### Contracts-only (root)

```toml
[project]
name = "algorand-starter-contracts-python"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "algokit-utils>=4.0.0",
    "python-dotenv>=1.0.0",
    "algorand-python>=3",
    "algorand-python-testing>=1",
]

[dependency-groups]
dev = [
    "algokit-client-generator>=2.1.0",
    "puyapy",
    "pytest",
]
```

### Kitchensink root

```toml
[project]
name = "algorand-starter-kitchensink-python"
version = "0.1.0"
requires-python = ">=3.12"

[tool.uv.workspace]
members = ["contracts", "subscriber"]
```

### Kitchensink subscriber

```toml
[project]
name = "subscriber"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "contracts",
    "algokit-subscriber",
    "algokit-utils>=4.0.0",
]

[tool.uv.sources]
contracts = { workspace = true }
```

## Build Pipeline

Same two steps as TS, Python equivalents:

```bash
algokit compile python smart_contracts/ --out-dir smart_contracts/artifacts
algokit generate client smart_contracts/artifacts --output smart_contracts/artifacts/{contract_name}_client.py
```

The `__main__.py` from the reference project handles this — it auto-discovers contract folders, builds each one, and generates typed clients. Keep this pattern as-is; it's already simple and useful for multi-contract projects.

## Deploy

Uses `uv run --env-file` (uv supports this natively, no python-dotenv needed):

```bash
uv run --env-file .env.localnet python -m smart_contracts deploy
uv run --env-file .env.testnet python -m smart_contracts deploy
uv run --env-file .env.mainnet python -m smart_contracts deploy
```

On LocalNet, uses dispenser (no mnemonic). On testnet/mainnet, reads `DEPLOYER_MNEMONIC` from env.

Alternatively, define scripts in pyproject.toml:

```toml
[project.scripts]
deploy = "smart_contracts.__main__:main"
```

But plain `uv run` commands are clearer for a template.

## Testing

```bash
uv run pytest                              # All tests
uv run pytest tests/hello_world_test.py    # Unit only (no network)
uv run pytest tests/hello_world_client_test.py  # E2E (needs localnet)
```

Unit tests use `algopy_testing` (emulates AVM in Python, no network needed).
E2E tests deploy to localnet and call contract methods.

## Env Files

Same pattern as TS — only `.env*.example` committed, real files gitignored.

```
.env*
!.env*.example
```

## CI (kitchensink only)

```yaml
name: CI
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pipx install algokit
      - run: algokit localnet start
      - run: uv sync
      - run: uv run pytest
      - run: uv run python -m smart_contracts build
```

## What's NOT Included

- Poetry (replaced by uv)
- `.algokit.toml` workspace orchestration
- Copier generators / `.algokit/` directory
- Pre-commit hooks
- Black / Ruff / MyPy configs
- `.vscode` configs / `.tours`
- pip-audit / TEAL auditing / Tealer
- Frontend (use the TS fullstack template for that)

## Open Decision: python-dotenv vs uv --env-file

`uv run --env-file` works for CLI invocations, but the deploy code in `deploy_config.py` currently calls `load_dotenv()` to read env vars. Two options:

1. **Keep python-dotenv**: Deploy code loads its own env. Works when called programmatically too.
2. **Drop python-dotenv, use uv --env-file only**: Simpler deps, but only works via `uv run`. Tests that need env vars would also need `--env-file`.

Recommendation: drop python-dotenv, use `uv run --env-file` everywhere. It's consistent with the TS approach (`tsx --env-file`) and keeps dependencies minimal.

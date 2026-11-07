# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- The Spaces constants in `startos/utils.ts` mirror `spaces-startos` by hand (it is not an npm dependency). Re-check them whenever Spaces changes its RPC host id, port, volume, or `store.json` layout.
- Never reach Spaces through `spaces.startos` DNS or its container IP, even though sibling packages do. Only the `getBridgeAddress(...).const()` address heals when Spaces is installed second.

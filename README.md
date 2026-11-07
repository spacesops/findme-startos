<p align="center">
  <img src="icon.svg" alt="FindMe Logo" width="21%">
</p>

# FindMe on StartOS

> Everything not listed in this document should behave the same as upstream
> FindMe. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

FindMe ([atfindme](https://github.com/spacesops/atfindme)) is a stateless Next.js app that resolves Spaces protocol handles to the records their owners published, through the certrelay mesh, optionally enriched with on-chain data from a spaced JSON-RPC node.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs the upstream image unmodified, with its own entrypoint and command.

| Property      | Value                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Image         | `spacesops/findme` (upstream, unmodified)                                                        |
| Architectures | x86_64, aarch64                                                                                  |
| Entrypoint    | Image default: `docker-entrypoint.sh node scripts/listen.mjs start`, cwd `/app`, user `atfindme` |

One subcontainer, `findme`, runs the single daemon of the same name. Attach with `start-cli package attach findme -n findme -- <cmd>`.

All configuration reaches the app as environment variables set by `startos/main.ts` on every start. On boot the app logs each variable it read, with `SPACED_RPC_PASSWORD` redacted. That log block is the quickest way to see whether Spaces was wired in.

## Volume and Data Layout

The app writes nothing to disk; its only cache is in memory and is lost on every restart. Two package volumes exist, and neither is mounted into the app's subcontainer.

| Volume       | Mounted in | Contents                                                                                                                     |
| ------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `startos`    | (none)     | `store.json`: the certrelay list set by **Configure Certrelays**                                                             |
| `dep-mounts` | (none)     | `spaces-main/`: a read-only mount of Spaces' `main` volume, made from the package's own container to read spaced credentials |

## File Models

The package owns one file and reads one that belongs to Spaces. It writes no upstream config file: every setting is an environment variable, re-derived on every start.

- **`store.json`** (`startos` volume, JSON). Holds `certrelays`, a list of URLs. Absent until **Configure Certrelays** first runs; a missing or invalid value reads as an empty list. Only that action writes it. A hand edit survives and takes effect on the next start, since main reads it reactively. An empty list leaves `FABRIC_SEEDS` unset, so the image's public relays apply.
- **Spaces' `store.json`** (`dep-mounts/spaces-main/store.json`, read-only). Only `spacedAuth.username` and `spacedAuth.password` are read. FindMe never writes it.

Environment variables set on every start:

| Variable                                                   | Value                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `HOST`, `PORT`                                             | `0.0.0.0`, `3000`                                                                                |
| `SPACED_CHAIN`                                             | `mainnet`                                                                                        |
| `SPACED_ENABLED`                                           | `true` when both the Spaces RPC bridge address and its credentials resolve; otherwise `false`    |
| `SPACED_RPC_URL`, `SPACED_RPC_USER`, `SPACED_RPC_PASSWORD` | Set only when `SPACED_ENABLED=true`; the URL is Spaces' bridge address, `http://10.0.3.1:<port>` |
| `FABRIC_SEEDS`                                             | Comma-joined certrelay list; set only when the list is non-empty                                 |

`FABRIC_DEV_MODE` is never set. `NEXT_PUBLIC_SITE_NAME` is inlined at image build time and cannot be changed by the package.

## Dependencies

Spaces is an optional dependency. FindMe runs fully without it.

| Dependency        | Required            | Health checks | Mount                                                                                                                        | Why                                                                                                                                         |
| ----------------- | ------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Spaces (`spaces`) | Optional, `running` | `spaced`      | Spaces' `main` volume, read-only, at `dep-mounts/spaces-main` in the package's own container (not in the app's subcontainer) | Supplies the spaced JSON-RPC address and its Basic-auth credentials (`store.json` → `spacedAuth`) for on-chain num, alias and fallback data |

The dependency is reported as enabled only while Spaces' RPC binding resolves, meaning while Spaces is installed. When Spaces is absent, StartOS shows no unmet-dependency warning.

The wiring is reactive. Installing Spaces after FindMe restarts FindMe once, now enriched. Uninstalling Spaces restarts it once, back to certrelay only. Stopping Spaces does not restart FindMe: the address stays resolvable, the app's RPC calls fail, and it falls back to certrelay data per request (with `[spaced] … failed` warnings in the log). StartOS then shows the Spaces dependency as not running.

## Network Access and Interfaces

One interface. The JSON API shares its port and paths.

| Interface id | Type | Port | Protocol | Purpose                                                                    |
| ------------ | ---- | ---- | -------- | -------------------------------------------------------------------------- |
| `ui`         | `ui` | 3000 | HTTP     | Search page and profiles at `/<handle>`; JSON at `/api/resolve?q=<handle>` |

The app makes outbound HTTPS connections to certrelays: the public `relay-{cosmos,atlas,orion,pulsar}.spacesprotocol.org`, or the configured list.

## Installation and First-Run Flow

Install needs no setup. There are no accounts or credentials, no setup wizard, and no tasks. The service is usable on first start.

The first fabric lookup after a start can take tens of seconds while the app connects to relays. A slow first profile load is not a fault.

## Actions

One action.

**Configure Certrelays** (`configure-certrelays`)

- **When to run it:** to query your own or specific certrelays instead of the public set, or to return to the public set by saving an empty list.
- **What it changes:** `certrelays` in `store.json`. The form is pre-filled with the current list.
- **Cost:** FindMe restarts if the list changed, which drops the in-memory cache, so the next lookup is slow again.
- **Repeat safety:** idempotent. Saving the same list does not restart the service.
- **Outputs:** none.

## Tasks

None. The service never waits on a prompt, and its ordinary controls are always available.

## Health Checks

One check, the daemon's readiness.

| Check                    | Probes                                                                                              | Grace period | Failure means                                                                                                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web Interface (`findme`) | HTTP GET `http://127.0.0.1:3000/` from the package container; any HTTP response passes, 5 s timeout | SDK default  | The Next.js server is not answering. Past start-up, read the log for a crash (for example `Failed to load next.config`). The check does not depend on relays or Spaces, so relay or spaced outages never turn it red. They show up as `503` lookups or missing on-chain data instead. |

## Backups and Restore

Volumes are copied wholesale (`ofVolumes`). Only `startos` is backed up, so a restore brings back the certrelay list and nothing else is needed.

`dep-mounts` is excluded deliberately: it holds only a mount of Spaces' volume, including Spaces' RPC credentials, which belong in Spaces' own backup. After a restore FindMe re-mounts and re-reads them on start.

## Limitations and Differences

1. The site name (`NEXT_PUBLIC_SITE_NAME`) is fixed at image build and cannot be changed.
2. `FABRIC_DEV_MODE` is not exposed. Unfinalized local relays cannot be used.
3. Spaces' own certrelay is not added to the seed list automatically. Add it with **Configure Certrelays** if you want it.
4. spaced connection settings cannot be pointed at a node other than the Spaces package on this server.
5. Directory registration (`fabric publish`) is not automated by the package. `instructions.md` describes doing it by hand.
6. The upstream image answers `/<handle>?format=json` and `/<handle>` with `Accept: application/json` with `400 {"error":"invalid"}` for valid handles. This is an upstream defect that reproduces outside StartOS. Use `/api/resolve?q=<handle>`.

---

## Quick Reference for AI Consumers

```yaml
package_id: findme
image: spacesops/findme
architectures: [x86_64, aarch64]
subcontainers: [findme]
volumes:
  startos: (not mounted)
  dep-mounts: (not mounted; read-only mount of spaces:main at spaces-main/)
file_models:
  - startos/store.json
  - dep-mounts/spaces-main/store.json (read-only, Spaces')
startos_managed_env_vars:
  - HOST
  - PORT
  - SPACED_CHAIN
  - SPACED_ENABLED
  - SPACED_RPC_URL
  - SPACED_RPC_USER
  - SPACED_RPC_PASSWORD
  - FABRIC_SEEDS
dependencies: [spaces (optional)]
interfaces:
  ui: { type: ui, port: 3000 }
actions:
  - configure-certrelays
tasks: []
health_checks:
  - findme
```

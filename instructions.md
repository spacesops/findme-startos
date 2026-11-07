# FindMe

## Documentation

- [FindMe upstream README](https://github.com/spacesops/atfindme/blob/main/README.md) — what the app does, its JSON responses, and how directory listing works.

## What you get on StartOS

- **Web Interface** — a search page for Spaces handles. Open a handle directly at `/<handle>`, for example `/andrew@lunde`. The homepage also links to other FindMe instances listed in the directory.
- **Two kinds of lookup:**
  - **Certrelay only.** Without Spaces installed, FindMe resolves handles through the certrelay mesh. Profile pages say that only certrelays were queried and that more information may be available on-chain.
  - **Spaces-enriched.** When Spaces is installed and running on this server, FindMe connects to its spaced node automatically. Profiles then also show the on-chain num, alias and fallback records. There is nothing to configure. Installing Spaces later turns this on by itself, and if Spaces is stopped FindMe keeps working, certrelay only.
- **No accounts and no stored data.** FindMe has no login. The only thing it keeps is your certrelay list, if you set one.

## Getting set up

1. Open the **Web Interface** and search for a handle such as `andrew@lunde`. The first lookup after a start can take tens of seconds while FindMe reaches the relays. Later lookups are fast.
2. Optional: install **Spaces** on this server to add on-chain data to every profile.

## Using FindMe

### JSON API

The Web Interface address also serves JSON:

```
https://<your-address>/api/resolve?q=andrew@lunde
```

The status code tells you the outcome: `200` found, `404` no such handle, `400` the query is not a handle, `503` the certrelay lookup failed. The `spaced_enabled` field says whether FindMe is set up to use your Spaces node. It stays `true` while Spaces is stopped, and those lookups then come from the certrelays alone.

### Configure Certrelays

Every lookup connects from this server to the certrelays, so those relays see the server's IP address. If you publish FindMe through a tunnel to keep your home IP private, send its outbound traffic through that tunnel too. If you use a tunnel for another reason, such as a port your router can't forward, there is nothing to change.

By default FindMe queries the public certrelays run by the Spaces project. Run **Configure Certrelays** to query relays of your choosing instead. Enter one `https://` URL per entry. To go back to the public relays, remove every entry and save. FindMe restarts to apply the change.

### List your instance in the directory

Other FindMe instances link to yours from their homepage once you publish a directory record. You need:

- a public HTTPS domain on the **Web Interface**. A `.local` or Tor address cannot be listed, and nothing on this server is public until you add a domain yourself.
- a Spaces handle you control, and its secret key (64 hex characters).

With those, open the **Space-CLI Web UI** interface of the Spaces service (its web terminal) and run, replacing the hostname and handle:

```
read -rs SECRET && export SECRET
/data/bin/fabric publish --seeds https://relay-cosmos.spacesprotocol.org \
  --secret-key-env SECRET \
  --addr service-type=directory \
  --txt type=spaces-webproxy \
  --txt website=https://<your-findme-domain> \
  <your handle>
```

The first line reads your secret key without echoing it or saving it in the shell history. Paste the key and press Enter. Records take a little while to spread across the relays. To check, open `https://relay-cosmos.spacesprotocol.org/addrs?name=service-type&addr=directory` and look for your handle.

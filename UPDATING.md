# Updating the upstream version

Upstream is the prebuilt Docker image `spacesops/findme`, built from [spacesops/atfindme](https://github.com/spacesops/atfindme). It is pinned by tag.

## Determining the upstream version

The pin is `images.findme.source.dockerTag` in `startos/manifest/index.ts`.

List the published tags, and watch upstream commits for the change they ship:

```bash
curl -s "https://hub.docker.com/v2/repositories/spacesops/findme/tags?page_size=25" | jq -r '.results[].name'
git ls-remote https://github.com/spacesops/atfindme refs/heads/main
```

Tags are `v`-prefixed (`v0.1.0`). Upstream has re-pushed a tag in place before, so compare the digest (`docker pull spacesops/findme:<tag>`) even when the tag is unchanged.

## Applying the bump

1. Confirm the new tag is multi-arch:
   ```bash
   docker manifest inspect spacesops/findme:<tag> | jq -r '.manifests[].platform.architecture'
   ```
   It must list `amd64` and `arm64`.
2. Set `dockerTag: 'spacesops/findme:<tag>'` in `startos/manifest/index.ts`.
3. Read upstream's README environment table for added, renamed or removed variables, and reconcile the `env` in `startos/main.ts`.

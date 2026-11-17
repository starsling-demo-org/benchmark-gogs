# gogs CI: GitHub-hosted runners vs StarSling Runners (with agents)

_Not affiliated with [gogs/gogs](https://github.com/gogs/gogs) (47.9k stars)._

gogs's own CI workflows, replayed for a real upstream merge to its default branch on GitHub-hosted runners and on StarSling Runners (with agents). Every number comes from this repository's replays; upstream's own runs are linked for comparison.

StarSling Runners (with agents) = StarSling runners + StarSling agent PRs.

## Results

Every sample starts with no GitHub Actions caches.

| Runner configuration | Merge CI duration<br><sub>Merge to the default branch</sub> | Runner time<br><sub>Merge to the default branch</sub> |
|---|---:|---:|
| **GitHub-hosted runners** | 25.40 min | 25.43 min |
| **StarSling Runners (with agents)** | 1.98 min<br>**12.8× faster** | 1.93 min<br>**13.2× less** |

- On StarSling Runners (with agents), every check for a merge to the default branch finished in **1.98 min** instead of 25.40 min (**12.8× faster**), using 1.93 min instead of 25.43 min of runner time (**13.2× less**).
- **PR updates:** not measured. On a pull request, upstream's own conditions skip the long `buildx-next` job (it runs only on a merge) and build the image for linux/amd64 only, so the emulated ARM builds the agent PR removes do not run there.
- **Context, not the headline** (upstream's own runs; not like-for-like with the numbers above): What upstream sees today: a median 32.9 min per merge to the default branch on upstream's own GitHub runners (n=10, most recent comparable merges to the default branch within the last 60 days; standard runners, warm caches, many commits; includes image push; not a like-for-like replay).

<sub>Medians over complete rounds.</sub>

## Runners

| Runners | Label | vCPU | Memory |
|---|---|---:|---:|
| GitHub-hosted | `ubuntu-26.04-4core` | 4 | 16 GiB |
| StarSling | `starsling-ubuntu-26.04` | 4 | 16 GiB |

Runner time compared at these machine sizes: GitHub 4 vCPU vs StarSling 4 vCPU. StarSling's 4 vCPU runners can burst to 5 vCPU and 32 GB RAM (Afterburner); GitHub's 4-core runners have 16 GB.

GitHub-hosted jobs run on the explicit GitHub larger-runner label shown, pinned to the size of upstream's public-repository runner, so the comparison does not change with this repository's visibility.

## Claim checklist

- [x] **Same CI as upstream:** replays run the same workflows and jobs as upstream's own runs, with the same conclusions, except upstream's release-archive build, which is excluded in every configuration (see below)
- [x] **Same checks, same results:** the same 9 checks ran and passed in every sample
- [x] **Cache state verified** for every sample
- [x] **Both runner configurations measured** (2 of 2)
- [x] **All requested samples finished** (10 of 10)
- [x] **At least 5 rounds** (5 requested)
- [x] **No interference:** no other workflow run overlapped a sample
- [x] **Cost neutral:** the agent PR adds no parallel jobs that spend the freed runner time

### Same CI as upstream

- **Merge to the default branch:** same workflows as upstream's own runs for the same commit ([#42738563561](https://github.com/gogs/gogs/actions/runs/42738563561), [#42738563665](https://github.com/gogs/gogs/actions/runs/42738563665), [#42738563871](https://github.com/gogs/gogs/actions/runs/42738563871)), same conclusions. The replayed merge fires `docker.yml`, `shell.yml` and `release.yml`. Two differences, identical in every configuration: `release.yml`'s `build` job (it builds, signs and notarizes release archives with Apple secrets) is kept off, and `deploy-demo` does not run. Upstream did run the release build on this merge, so that work is not in any column. Details are under Method.

### Same checks, same results

Every counted sample's results were read from its own job logs. In all 10 samples (5 per configuration) the same 9 checks ran and passed: the `Dockerfile.next` image build, the web assets, the Go binary and the image for each of linux/amd64, linux/arm64 and linux/arm/v7, and shellcheck. The binary is not byte-identical: with the fix, clang compiles the C parts (the PAM binding and Go's cgo runtime) instead of gcc, so the `gogs` binary differs in size by at most 3.3 KB per platform (out of about 120 MB), measured in the earlier showcase runs.

## Terms

| Term | Meaning |
|---|---|
| **PR CI duration** | Elapsed time from the first workflow starting to the last job finishing, across every workflow one PR update starts (including `workflow_run` follow-ups). |
| **Merge CI duration** | The same, for every workflow one merge to the default branch starts. |
| **Runner time** | Total machine time all jobs used for one event, summed across jobs; billed per second. Jobs kept on GitHub-hosted runners still count. |
| **StarSling Runners (with agents)** | StarSling runners plus StarSling agent PRs: the project's CI with StarSling's agent PRs applied, running on StarSling runners. "StarSling" on this page always means this one configuration. |
| **Round** | One replay of the event on every runner configuration. Medians use only complete rounds. |
| **Cost neutral** | The agent PRs save runner time without adding parallel jobs that spend it again. |

## Appendix

<details>
<summary>Agent PRs</summary>

Merged in this order. Each fix's own measurement, on the CI step it changes, is under What we changed.

| # | Agent PR | What it changed |
|---:|---|---|
| 1 | [pull/1](https://github.com/starsling-demo-org/benchmark-gogs/pull/1) | Cross-compile the ARM builds of `Dockerfile.next` with the xx helper instead of running the Go and C compile under CPU emulation. One file, `Dockerfile.next`; the build checks that each binary is for the target CPU. |

</details>

<details>
<summary>What was slow</summary>

Every merge to gogs's default branch that touches the Docker files runs one long job, `buildx-next`, which builds the `Dockerfile.next` image for three CPU types: linux/amd64, linux/arm64 and linux/arm/v7. The two ARM builds ran under a CPU emulator, so the whole Go and C compile for those platforms ran at emulation speed. That one job is almost the whole wait: in this benchmark it took a median 1520 s of the 1524 s merge on GitHub-hosted runners. Cold, with no caches.

</details>

<details>
<summary>What we changed</summary>

The original showcase for this project proposed one fix: cross-compile the ARM builds instead of emulating them. We re-measured it on its own on StarSling, cold, with 5 runs on each side (the CI as it was, and the CI with the fix), on the step it changes.

| Fix | Result | Decision |
|---|---|---|
| Cross-compile the ARM builds of `Dockerfile.next` with the xx helper instead of emulating them | Image build step: 583 s to 94 s (median), **6.2x faster**; every run with the fix beat every run without it | Kept (agent PR 1) |

The fix uses no cache, so the full benchmark runs cold only. It compares GitHub-hosted runners with StarSling Runners (with agents), over 5 rounds.

- [Cross-compile the ARM builds of `Dockerfile.next` with the xx helper instead of running the Go and C compile under CPU emulation. One file, `Dockerfile.next`; the build checks that each binary is for the target CPU.](https://github.com/starsling-demo-org/benchmark-gogs/pull/1)

</details>

<details>
<summary>Every sample, with links to its runs</summary>

Each cell is the whole wait for that merge and links to its run.

| Upstream commit | Round | GitHub-hosted runners | StarSling Runners (with agents) |
|---|---:|---:|---:|
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 1 | [24.90 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43807814067) | [2.15 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813027051) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 2 | [25.68 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43816656858) | [1.98 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813856705) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 3 | [24.50 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43821167620) | [2.05 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43820287443) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 4 | [25.40 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43826547864) | [1.83 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43830563871) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 5 | [34.87 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43836043680) | [1.93 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43841996889) |

</details>

<details>
<summary>Method</summary>

1. **Pin.** gogs/gogs is pinned at [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542), the [`upstream/`](upstream) submodule in this repository. Each scenario replays one real upstream event: the merge of [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) to the default branch.
2. **Replay natively.** Each sample lands that exact tree on this repository as a merge to the default branch and fires the real GitHub event (a merge to the default branch, or a PR update). Every workflow, job and step runs with its own triggers, filters, `needs`, conditions, matrices and `workflow_run` follow-ups, in the order GitHub schedules them.
3. **Runner configurations.** GitHub-hosted runners run the CI unchanged; StarSling Runners (with agents) run it with the agent PR applied. Jobs on runners StarSling does not offer stay on GitHub-hosted runners in every configuration and still count.
4. **Rounds.** 5 rounds; in each, every runner configuration replays the event once, in a deterministic shuffled order, one sample at a time. Medians use only complete rounds, and a sample counts only if every expected job succeeded on the first attempt.
5. **Control caches.** Cold cache: every sample starts with no GitHub Actions caches.
6. **Check.** Replays are compared job by job with upstream's own runs for the same commit, and every sample's test verdicts, coverage and cache restores are read from its own job logs.

- **Control configuration.** Each round also replayed the event on StarSling runners with the CI unchanged, as an internal control. It is not part of this comparison, and its samples are not shown in the tables on this page; they are in the data files under `benchmark/`.
- **Default branch.** The default branch is `main`.
- **Workflows in this merge.** The replayed merge changes `.github/workflows/docker.yml` and `docker/build/finalize.sh`, so upstream's own path filters fire `docker.yml`, `shell.yml` and `release.yml`. `go.yml` and `web.yml` do not fire for this merge (their path filters do not match), and `lock.yml` is scheduled only. The Go tests, the Windows, macOS and MySQL jobs and the web build are therefore not part of these numbers.
- **Bench-only changes, identical in every configuration and never part of the agent PR:**
  - Identity remap: upstream runs `buildx-next` and `deploy-demo` only when `github.repository == 'gogs/gogs'`. That name is remapped to this repository; the rest of each condition is kept.
  - Switched off: the three registry logins (Docker Hub, GHCR, DigitalOcean), the image push (`push: false`; the image is built but not published), the Trivy scan of the pushed image, the `deploy-demo` job and the failure e-mail steps. None of the secrets they need exist here.
  - Excluded job: `release.yml` `build`, which builds, signs and notarizes release archives with Apple secrets. It is gated on `gogs/gogs` and is kept off explicitly. Upstream did run it on this merge, so that upstream work is not in any column.
  - Excluded job: `web.yml` `web` (it fails in the replay because it compares against a branch the replay checkout lacks). It does not fire for this merge anyway.
  - Secret references for secrets that do not exist here are removed; they were already empty in every configuration.
- **Runner sizes.** Upstream's `ubuntu-latest` jobs run on GitHub `ubuntu-26.04-4core` (4 vCPU, 16 GiB) and StarSling `starsling-ubuntu-26.04` (4 vCPU, 16 GiB). StarSling's 4 vCPU runners can burst to 5 vCPU and 32 GB RAM (Afterburner); GitHub's 4-core runners have 16 GB. Every job in this merge runs on those labels.
- **Upstream reference (context only; not like-for-like; not the headline).** What upstream sees today: a median 32.9 min per merge to the default branch on upstream's own GitHub runners (n=10, most recent comparable merges to the default branch within the last 60 days; standard runners, warm caches, many commits; includes image push; not a like-for-like replay).
- **Failed or re-run samples** (replaced, not in the medians): GitHub-hosted runners: 0; StarSling Runners (with agents): 0.

</details>

<sub>Generated by `bench showcase` from experiment `full-1`. Machine-readable results: [`benchmark/results.json`](benchmark/results.json).</sub>

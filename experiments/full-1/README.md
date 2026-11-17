# gogs CI: GitHub vs StarSling

> Not affiliated with [gogs/gogs](https://github.com/gogs/gogs) (47.9k stars). This repository replays gogs's own CI on real upstream commits to measure **how much machine time a push uses** (runner time) and **how long it waits for every check**, from the first workflow starting to the last job finishing.

## Results

**Pushes** (typical per push):

**StarSling: 13.2x less runner time** than GitHub per push (25.43 min → 1.93 min of machine time; GitHub 4 vCPU vs StarSling 4 vCPU).

StarSling = StarSling runners + StarSling agent PRs.

Wait: **StarSling is 12.8x faster** than GitHub for a push to finish every check (25.40 min → 1.98 min).

| | Runner time per push | vs GitHub | Wait per push | vs GitHub |
|---|---:|---:|---:|---:|
| GitHub (the project's CI as is, on GitHub-hosted runners) | **25.43 min** | 1x | **25.40 min** | 1x |
| StarSling (StarSling runners + agent PRs) | **1.93 min** | **13.2x** less runner time | **1.98 min** | **12.8x** faster |

Runner time compared at these machine sizes: GitHub 4 vCPU vs StarSling 4 vCPU.

**Where the savings come from**

Runner time:

- StarSling runners alone (CI unchanged): 10.10 min, **2.5x** less runner time than GitHub
- StarSling agent PRs, on the same runners: **5.2x** less runner time (10.10 min → 1.93 min)
- Together: 2.5x × 5.2x = 13.2x

Wait:

- StarSling runners alone (CI unchanged): 10.17 min, **2.5x** faster than GitHub
- StarSling agent PRs, on the same runners: **5.1x** faster (10.17 min → 1.98 min)
- Together: 2.5x × 5.1x = 12.8x

<sub>Typical = the median over complete rounds. Total = StarSling runners alone × agent PRs on top. Details are in the Appendix.</sub>

## Terms

| Term | Meaning |
|---|---|
| **Runner time** | Total machine time all jobs used for one push, summed across jobs; billed per second. |
| **Wait** | How long one push (or PR update) takes until every check has finished: from the first workflow starting to the last job finishing. |
| **GitHub** | The project's own CI, unchanged, on GitHub-hosted runners (the machines GitHub rents out). |
| **StarSling** | StarSling runners (faster machines) plus StarSling agent PRs (changes to the CI itself). |
| **Agent PRs** | Small pull requests StarSling's agent wrote against the project's CI to make it faster. Each is measured on its own in the Appendix. |
| **Median** | The middle result. Half the runs were faster, half were slower, so one odd run does not move it. |
| **Round** | One replay of the same change on every setup. Only rounds where every setup finished cleanly count. |
| **Cold** | Every run starts with no GitHub Actions caches (saved downloads and build output). |

## Appendix

<details>
<summary>Agent PRs: what each one changed and its own effect</summary>

Merged in this order. Each row's effect comes from its own before/after experiment; the last row's cumulative wait is the headline.

| # | Agent PR | What it changed | Its own effect (typical wait, before → after) | Wait after it (cumulative) |
|---:|---|---|---|---:|
| 1 | [pull/1](https://github.com/starsling-demo-org/benchmark-gogs/pull/1) | dockerfile next cross compile | 10.17 min → 1.98 min (−80%), 5 runs per side | 1.98 min |

</details>

<details>
<summary>What we changed</summary>

- [dockerfile next cross compile](https://github.com/starsling-demo-org/benchmark-gogs/pull/1)

</details>

<details>
<summary>Same checks, same results</summary>



</details>

<details>
<summary>Every push, round by round</summary>

Each cell is the whole wait for that push and links to its run.

| Upstream commit | Round | GitHub unchanged | StarSling unchanged (hardware alone) | StarSling + agent PRs |
|---|---:|---:|---:|---:|
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 1 | [24.90 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43807814067) | [10.08 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43806067812) | [2.15 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813027051) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 2 | [25.68 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43816656858) | [10.95 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43814663695) | [1.98 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813856705) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 3 | [24.50 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43821167620) | [9.98 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43824781997) | [2.05 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43820287443) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 4 | [25.40 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43826547864) | [10.17 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43831589720) | [1.83 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43830563871) |
| [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) | 5 | [34.87 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43836043680) | [10.37 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43833835427) | [1.93 min](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43841996889) |

</details>

<details>
<summary>How it's measured</summary>

1. **Pin.** gogs/gogs is pinned at [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542), the [`upstream/`](upstream) submodule in this repository. Each scenario replays one real upstream event: the merge of [`00062cc7`](https://github.com/gogs/gogs/commit/00062cc78626a7349da9af742be97fae41288542) to `main`.
2. **Replay natively.** Each sample pushes that exact tree to this repository's `main` branch and fires the real GitHub event (a push, or a PR synchronize). Every workflow, job and step runs with its own triggers, filters, `needs`, conditions, matrices and `workflow_run` follow-ups, in the order GitHub schedules them.
3. **Runner configurations.** GitHub-hosted runners and StarSling Runners run the CI unchanged; StarSling Runners also run it with the agent PR applied (self-improving CI). Jobs on runners StarSling does not offer stay on GitHub-hosted runners in every configuration and still count.
4. **Rounds.** 5 rounds; in each, every runner configuration replays the event once, in a deterministic shuffled order, one sample at a time. Medians use only complete rounds, and a sample counts only if every expected job succeeded on the first attempt.
5. **Control caches.** Cold cache: Every sample starts with no GitHub Actions caches.
6. **Check.** Replays are compared job by job with upstream's own runs for the same commit, and every sample's test verdicts, coverage and cache restores are read from its own job logs.

- **Cold:** Every sample starts with no GitHub Actions caches.
- **Failed or re-run samples** (replaced, not in the medians): GitHub unchanged: 0; StarSling unchanged (hardware alone): 0; StarSling + agent PRs: 0.

</details>

<details>
<summary>Runners</summary>

| Runners | Label | vCPU | Memory |
|---|---|---:|---:|
| GitHub-hosted | `ubuntu-26.04-4core` | 4 | 16 GiB |
| StarSling | `starsling-ubuntu-26.04` | 4 | 16 GiB |

GitHub-hosted jobs run on the explicit GitHub larger-runner label shown, pinned to the size of upstream's public-repository runner, so the comparison does not change with this repository's visibility.

</details>

<sub>Generated by `bench showcase` from experiment `full-1`. Machine-readable results: [`benchmark/results.json`](benchmark/results.json). Configurations: GitHub-hosted runners; StarSling Runners (hardware only); StarSling Runners (self-improving CI).</sub>

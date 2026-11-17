# StarSling Whole-Pipeline Benchmark Report (`full-1`)

- **Upstream:** `gogs/gogs@00062cc78626a7349da9af742be97fae41288542`
- **Timestamp Resolution:** `1s` (GitHub Actions workflow/job/step timestamps)

## Event `main-push` · cold cache

**Total speedup 12.81×: hardware speedup 2.50×, self-improving CI speedup 5.13× on StarSling Runners and — on GitHub-hosted runners. Evidence: coverage-qualified.**

### Runner configurations

| Runner configuration | Complete / requested | CI duration p50 (IQR) | CI minutes p50 | Estimated cost p50 (USD) | Trigger latency p50 | Harness overhead p50 |
|---|---|---|---|---|---|---|
| `github-baseline` | 5/5 | 1524.0 s (IQR 47.0 s, n=5) | 25.43 min | $0.4320 | 5.0 s | 0.0 s |
| `starsling-baseline` | 5/5 | 610.0 s (IQR 17.0 s, n=5) | 10.10 min | $0.0960 | 4.0 s | 0.0 s |
| `starsling-patched` | 5/5 | 119.0 s (IQR 7.0 s, n=5) | 1.93 min | $0.0240 | 4.0 s | 0.0 s |

### Speedups

| Speedup | Ratio | Compares | Cost neutral |
|---|---|---|---|
| `github-baseline` / `github-patched` | — | Self-improving CI speedup, GitHub-hosted runners | Not established (Self-improving CI changed which runners jobs use, so its speedup includes a hardware change.) |
| `starsling-baseline` / `starsling-patched` | 5.13× | Self-improving CI speedup, StarSling Runners | Yes |
| `github-baseline` / `starsling-baseline` | 2.50× | Hardware speedup | Not applicable: hardware speedups never establish it |
| `github-baseline` / `starsling-patched` | 12.81× | Total speedup | Not applicable |

### Step times

| Workflow › job | Step | Change | GitHub-hosted p50 | GitHub-hosted, self-improving CI p50 | StarSling, hardware only p50 | StarSling, self-improving CI p50 |
|---|---|---|---|---|---|---|
| `.github/workflows/shell.yml#shellcheck` | Set up job | `matched` | 1.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/shell.yml#shellcheck` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/shell.yml#shellcheck` | Run actions/checkout@1af3b93b6815bc44a9784bd300feb67ff0d1eeb3 | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/shell.yml#shellcheck` | Run ShellCheck | `matched` | 1.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/shell.yml#shellcheck` | Post Run actions/checkout@1af3b93b6815bc44a9784bd300feb67ff0d1eeb3 | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/shell.yml#shellcheck` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Set up job | `matched` | 4.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/docker.yml#buildx-next` | Benchmark event context (harness) | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Check out code | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/docker.yml#buildx-next` | Set up QEMU | `matched` | 6.0 s | — | 2.0 s | 2.0 s |
| `.github/workflows/docker.yml#buildx-next` | Set up Docker Buildx | `matched` | 5.0 s | — | 3.0 s | 3.0 s |
| `.github/workflows/docker.yml#buildx-next` | Inspect builder | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Login to Docker Hub | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Login to GitHub Container registry | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Login to DigitalOcean Container registry | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Build and push next-gen images | `matched` | 1469.0 s | — | 583.0 s | 94.0 s |
| `.github/workflows/docker.yml#buildx-next` | Scan for container vulnerabilities | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Send email on failure | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Post Build and push next-gen images | `matched` | 2.0 s | — | 1.0 s | 1.0 s |
| `.github/workflows/docker.yml#buildx-next` | Post Set up Docker Buildx | `matched` | 23.0 s | — | 4.0 s | 3.0 s |
| `.github/workflows/docker.yml#buildx-next` | Post Set up QEMU | `matched` | 2.0 s | — | 1.0 s | 2.0 s |
| `.github/workflows/docker.yml#buildx-next` | Post Check out code | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Complete job | `matched` | 0.0 s | — | 0.0 s | 0.0 s |
| `.github/workflows/shell.yml#shellcheck` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/shell.yml#shellcheck` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Set up runner | `matched` | — | — | 0.0 s | 0.0 s |
| `.github/workflows/docker.yml#buildx-next` | Complete runner | `matched` | — | — | 0.0 s | 0.0 s |

### Samples

| Sample ID | Round | Runner configuration | Complete | CI duration | CI minutes | Runs and diagnostics |
|---|---|---|---|---|---|---|
| `full-1-main-push-cold-rep1-starsling-baseline` | 1 | `starsling-baseline` | ✓ | 605.0 s | 10.03m | [run #43806067812](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43806067812), [run #43806067769](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43806067769), [run #43806067820](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43806067820) |
| `full-1-main-push-cold-rep1-github-baseline` | 1 | `github-baseline` | ✓ | 1494.0 s | 24.93m | [run #43807814067](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43807814067), [run #43807814051](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43807814051), [run #43807814038](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43807814038) |
| `full-1-main-push-cold-rep1-starsling-patched` | 1 | `starsling-patched` | ✓ | 129.0 s | 2.08m | [run #43813027051](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813027051), [run #43813026976](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813026976), [run #43813027003](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813027003) |
| `full-1-main-push-cold-rep2-starsling-patched` | 2 | `starsling-patched` | ✓ | 119.0 s | 1.93m | [run #43813856705](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813856705), [run #43813856672](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813856672), [run #43813856730](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43813856730) |
| `full-1-main-push-cold-rep2-starsling-baseline` | 2 | `starsling-baseline` | ✓ | 657.0 s | 10.95m | [run #43814663695](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43814663695), [run #43814663616](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43814663616), [run #43814663607](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43814663607) |
| `full-1-main-push-cold-rep2-github-baseline` | 2 | `github-baseline` | ✓ | 1541.0 s | 25.72m | [run #43816656858](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43816656858), [run #43816656892](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43816656892), [run #43816656860](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43816656860) |
| `full-1-main-push-cold-rep3-starsling-patched` | 3 | `starsling-patched` | ✓ | 123.0 s | 1.98m | [run #43820287443](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43820287443), [run #43820287559](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43820287559), [run #43820287493](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43820287493) |
| `full-1-main-push-cold-rep3-github-baseline` | 3 | `github-baseline` | ✓ | 1470.0 s | 24.55m | [run #43821167620](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43821167620), [run #43821167683](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43821167683), [run #43821167673](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43821167673) |
| `full-1-main-push-cold-rep3-starsling-baseline` | 3 | `starsling-baseline` | ✓ | 599.0 s | 9.93m | [run #43824781997](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43824781997), [run #43824782004](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43824782004), [run #43824781976](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43824781976) |
| `full-1-main-push-cold-rep4-github-baseline` | 4 | `github-baseline` | ✓ | 1524.0 s | 25.43m | [run #43826547864](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43826547864), [run #43826547868](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43826547868), [run #43826547873](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43826547873) |
| `full-1-main-push-cold-rep4-starsling-patched` | 4 | `starsling-patched` | ✓ | 110.0 s | 1.82m | [run #43830563871](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43830563871), [run #43830563532](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43830563532), [run #43830563590](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43830563590) |
| `full-1-main-push-cold-rep4-starsling-baseline` | 4 | `starsling-baseline` | ✓ | 610.0 s | 10.10m | [run #43831589720](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43831589720), [run #43831589649](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43831589649), [run #43831589646](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43831589646) |
| `full-1-main-push-cold-rep5-starsling-baseline` | 5 | `starsling-baseline` | ✓ | 622.0 s | 10.28m | [run #43833835427](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43833835427), [run #43833835611](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43833835611), [run #43833835326](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43833835326) |
| `full-1-main-push-cold-rep5-github-baseline` | 5 | `github-baseline` | ✓ | 2092.0 s | 34.93m | [run #43836043680](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43836043680), [run #43836043521](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43836043521), [run #43836043681](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43836043681) |
| `full-1-main-push-cold-rep5-starsling-patched` | 5 | `starsling-patched` | ✓ | 116.0 s | 1.85m | [run #43841996889](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43841996889), [run #43841996637](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43841996637), [run #43841996661](https://github.com/starsling-demo-org/benchmark-gogs/actions/runs/43841996661) |



## GitHub API calls

Budget: 252 calls per hour for this controller. Free `304 Not Modified` answers are listed separately and do not count against the account.

- **Experiment:** 474 calls (1129 free 304s); workflows 102, workflow-write 94, jobs 75, run-list 64, artifacts 62, caches 30, job-logs 30, cache-delete 15, other-read 2
- **Waiting:** 5285 s stretched to fit the budget, 0 s waiting for an account reset

| Sample | Calls | Free 304s | Biggest callers |
| --- | ---: | ---: | --- |
| `full-1-main-push-cold-rep1-starsling-baseline` | 38 | 85 | workflows 15, workflow-write 9, jobs 5, artifacts 4, run-list 3, job-logs 2 |
| `full-1-main-push-cold-rep1-github-baseline` | 26 | 161 | workflows 6, workflow-write 6, jobs 5, artifacts 4, run-list 3, job-logs 2 |
| `full-1-main-push-cold-rep1-starsling-patched` | 29 | 22 | run-list 9, jobs 6, workflows 4, workflow-write 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep2-starsling-patched` | 25 | 23 | workflows 6, workflow-write 6, jobs 4, artifacts 4, run-list 3, job-logs 2 |
| `full-1-main-push-cold-rep2-starsling-baseline` | 28 | 69 | workflows 6, workflow-write 6, jobs 6, run-list 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep2-github-baseline` | 27 | 126 | workflows 6, workflow-write 6, jobs 5, run-list 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep3-starsling-patched` | 25 | 23 | workflows 6, workflow-write 6, jobs 4, artifacts 4, run-list 3, job-logs 2 |
| `full-1-main-push-cold-rep3-github-baseline` | 27 | 112 | workflows 6, workflow-write 6, jobs 5, run-list 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep3-starsling-baseline` | 27 | 63 | workflows 6, workflow-write 6, jobs 5, run-list 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep4-github-baseline` | 28 | 118 | workflows 6, workflow-write 6, jobs 6, run-list 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep4-starsling-patched` | 26 | 22 | workflows 6, workflow-write 6, jobs 5, artifacts 4, run-list 3, job-logs 2 |
| `full-1-main-push-cold-rep4-starsling-baseline` | 30 | 62 | workflows 6, workflow-write 6, jobs 6, artifacts 6, run-list 4, job-logs 2 |
| `full-1-main-push-cold-rep5-starsling-baseline` | 27 | 63 | workflows 6, workflow-write 6, jobs 5, run-list 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep5-github-baseline` | 26 | 148 | workflows 6, workflow-write 6, run-list 4, jobs 4, artifacts 4, job-logs 2 |
| `full-1-main-push-cold-rep5-starsling-patched` | 25 | 23 | workflows 6, workflow-write 6, jobs 4, artifacts 4, run-list 3, job-logs 2 |

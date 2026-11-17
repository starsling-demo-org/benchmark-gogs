/**
 * Evidence extractor for gogs/gogs CI (docker.yml, go.yml, shell.yml, web.yml).
 *
 * "Same checks, same results" is proved from the replay's own job logs, one unit per check. Unit ids never contain
 * matrix labels, runner labels, timings, BuildKit step numbers (`k/n`), stage names, vertex numbers or the build
 * platform of a cross-compiled stage, so they are identical before and after the Dockerfile.next cross-compile lever:
 *
 *   go-test:<leg>                  the whole `go test` step of a leg (leg: linux, macos, windows, postgres, mysql)
 *   go-test:<leg>:<go package>     one package of that leg (tparse package table, or plain `go test -v` output)
 *   go-lint:tidy                   `go mod tidy` + `go generate` leave the tree clean
 *   go-lint:golangci-lint          golangci-lint reports 0 issues
 *   shellcheck                     the ShellCheck step passed
 *   web:lint | web:build | web:clean-tree   the moon tasks and the final `git diff --exit-code`
 *   docker:<job>:build             the docker build step of a job
 *   docker:<job>:web-assets        the UI build (`pnpm ... run build`), shared by every platform (Dockerfile.next only)
 *   docker:<job>:go-binary:<platform>  the Go build for a TARGET platform (`go build` or `xx-go build`)
 *   docker:<job>:image:<platform>  the final image stage for a target platform
 *
 * A unit passes when the log shows it ran to completion; it fails on an error, on a failed step, or when it cannot be
 * found at all (an expected leg or platform that left no trace is a failure, never a silent pass). A BuildKit unit that
 * was restored from cache is `passed` with mode `reused`, as in the pilot.
 */
import { stripVTControlCharacters } from 'node:util'
import type { EvidenceExtractor, EvidenceJob } from '../src/evidence-collect.ts'
import type { TestCaseVerdictRecord } from '../src/parity.ts'

type Verdict = TestCaseVerdictRecord['verdict']
type Mode = TestCaseVerdictRecord['mode']
interface Unit {
  verdict: Verdict
  mode: Mode
}

export const GO_LEGS = ['linux', 'macos', 'windows', 'postgres', 'mysql'] as const
export type GoLeg = (typeof GO_LEGS)[number]
export const DEFAULT_PLATFORMS = ['linux/amd64', 'linux/arm64', 'linux/arm/v7']

const PASSED: Unit = { verdict: 'passed', mode: 'executed' }
const FAILED: Unit = { verdict: 'failed', mode: 'executed' }

/** Timestamps and ANSI are already stripped by the harness; strip again so the extractor is robust on raw logs. */
function tidy(log: string): string {
  return log
    .split(/\r?\n/)
    .map((line) => stripVTControlCharacters(line.replace(/^(?:﻿)?\d{4}-\d\d-\d\dT[\d:.]+Z ?/, '')))
    .join('\n')
}

function workflowOf(job: EvidenceJob): 'go' | 'docker' | 'shell' | 'web' | undefined {
  const file = job.workflowPath.split('/').pop() ?? ''
  const name = file.replace(/\.ya?ml$/, '')
  return name === 'go' || name === 'docker' || name === 'shell' || name === 'web' ? name : undefined
}

/** A step's verdict; a log with no step list falls back to the job conclusion. */
function stepOk(job: EvidenceJob, pattern: RegExp): boolean {
  const step = job.steps.find((s) => pattern.test(s.name))
  return step ? step.conclusion === 'success' : job.steps.length === 0 && job.conclusion === 'success'
}

// ---- Go ---------------------------------------------------------------------------------------------------------

/** The leg of a go.yml job from its logical job id (stable), falling back to the job name; never the matrix label. */
export function goLegOf(job: EvidenceJob, log: string): GoLeg | 'lint' | undefined {
  const id = job.logicalJobId.toLowerCase()
  const name = job.jobName.toLowerCase()
  if (id === 'lint' || /^lint\b/.test(name)) return 'lint'
  if (id === 'postgres' || /^postgres\b/.test(name)) return 'postgres'
  if (id === 'mysql' || /^mysql\b/.test(name)) return 'mysql'
  if (id === 'test-windows' || /^test windows\b/.test(name)) return 'windows'
  if (id === 'test' || /^test\b/.test(name))
    return /^Image: macos|\/Users\/runner\//m.test(log) || /macos/.test(name) ? 'macos' : 'linux'
  return undefined
}

export interface PackageResult {
  verdict: Verdict
  mode: Mode
}

/** Per-package results from tparse's package table or from plain `go test -v` output (the Windows leg). */
export function goPackageResults(log: string): Map<string, PackageResult> {
  const packages = new Map<string, PackageResult>()
  for (const line of log.split('\n')) {
    // tparse: | STATUS | elapsed | package | cover | pass | fail | skip |
    const row = /^│\s*(PASS|FAIL|SKIP)\s*│[^│]*│\s*(\S+)\s*│[^│]*│\s*(\d+)\s*│\s*(\d+)\s*│\s*(\d+)\s*│\s*$/.exec(line)
    if (row) {
      const [, status, pkg = '', , failed] = row
      if (status === 'FAIL' || Number(failed) > 0) packages.set(pkg, { verdict: 'failed', mode: 'executed' })
      else if (status === 'SKIP') packages.set(pkg, { verdict: 'skipped', mode: 'skipped' })
      else packages.set(pkg, { verdict: 'passed', mode: 'executed' })
      continue
    }
    // go test: `ok  \tpkg\t0.1s`, `FAIL\tpkg\t0.1s`, `?   \tpkg\t[no test files]`
    const plain = /^(ok|FAIL)\s+(\S+)\s+(\S.*)$/.exec(line)
    if (plain) {
      const [, status, pkg = '', rest = ''] = plain
      if (status === 'ok') packages.set(pkg, { verdict: 'passed', mode: /\(cached\)/.test(rest) ? 'reused' : 'executed' })
      else packages.set(pkg, { verdict: 'failed', mode: 'executed' })
      continue
    }
    const none = /^\?\s+(\S+)\s+\[no test files\]/.exec(line)
    if (none?.[1]) packages.set(none[1], { verdict: 'skipped', mode: 'skipped' })
  }
  return packages
}

export function golangciIssues(log: string): number | undefined {
  const match = /^(\d+) issues?\.$/m.exec(log)
  if (match) return Number(match[1])
  return /golangci-lint found no issues/.test(log) ? 0 : undefined
}

// ---- BuildKit ---------------------------------------------------------------------------------------------------

export interface BuildkitVertex {
  /** Target platform: `linux/arm64` for a native `[linux/arm64 ...]` and a cross `[linux/amd64->arm64 ...]` step. */
  target: string | undefined
  command: string
  done: boolean
  cached: boolean
  error: boolean
}

/** `linux/amd64`, `linux/arm/v7`, `arm64` or `arm/v7` -> `linux/amd64`, `linux/arm/v7`, ... */
function normalisePlatform(value: string): string {
  return value.startsWith('linux/') ? value : `linux/${value}`
}

/**
 * BuildKit's plain-progress vertices: `#N [platform stage k/n] COMMAND` followed by `#N DONE|CACHED|ERROR`.
 * The stage name and `k/n` are parsed away; only the target platform and the command identify a unit.
 */
export function buildkitVertices(log: string): BuildkitVertex[] {
  const vertices = new Map<string, BuildkitVertex>()
  for (const line of log.split('\n')) {
    const step =
      /^#(\d+) \[(?:(linux\/\w+(?:\/v\d+)?)(?:->(\w+(?:\/v\d+)?))? )?[\w.-]+ \d+\/\d+\] (.*)$/.exec(line)
    if (step) {
      const [, id = '', platform, cross, command = ''] = step
      if (!vertices.has(id))
        vertices.set(id, {
          target: cross ? normalisePlatform(cross) : platform,
          command: command.replace(/\s+/g, ' ').trim(),
          done: false,
          cached: false,
          error: false,
        })
      continue
    }
    const end = /^#(\d+) (DONE|CACHED|ERROR|CANCELED)\b/.exec(line)
    const vertex = end ? vertices.get(end[1] ?? '') : undefined
    if (!vertex) continue
    if (end?.[2] === 'DONE') vertex.done = true
    else if (end?.[2] === 'CACHED') vertex.cached = true
    else vertex.error = true
  }
  return [...vertices.values()]
}

function verdictOf(vertices: BuildkitVertex[]): Unit {
  if (!vertices.length || vertices.some((v) => v.error)) return FAILED
  if (vertices.every((v) => v.done)) return PASSED
  // Restored from BuildKit's cache: the unit did not run in this sample.
  if (vertices.every((v) => v.done || v.cached)) return { verdict: 'passed', mode: 'reused' }
  return FAILED
}

/** The target platforms of the build-push step, from its logged `platforms:` input. */
export function buildPlatforms(log: string): string[] {
  const from = log.indexOf('Run docker/build-push-action')
  const match = from >= 0 ? /^\s+platforms: (\S+)\s*$/m.exec(log.slice(from)) : null
  const platforms = match?.[1]?.split(',').map((p) => p.trim()).filter(Boolean)
  return platforms?.length ? platforms.map(normalisePlatform) : DEFAULT_PLATFORMS
}

const GO_BUILD = /^RUN .*\bgo build\b/
const WEB_BUILD = /^RUN pnpm .*\brun build\b/
const IMAGE_STEPS = [/^COPY --from=binarybuilder\b/, /^RUN chmod \+x start\.sh\b/]

/** `go build ...` and `xx-go build ...` normalise to one command so the lever does not change `commands`. */
function goBuildCommand(command: string): string {
  const text = command.replace(/^RUN /, '').replace(/\bxx-go build\b/, 'go build')
  return (text.split(' -ldflags')[0] ?? text).trim()
}

// ---- extractor --------------------------------------------------------------------------------------------------

const extract: EvidenceExtractor = ({ jobs }) => {
  const units = new Map<string, Unit>()
  const commands = new Set<string>()
  const obligations = new Set<string>()
  const put = (id: string, unit: Unit) => {
    const previous = units.get(id)
    // A repeated unit (a rerun, a duplicate job) keeps its worst verdict.
    if (!previous || previous.verdict === 'passed' || unit.verdict === 'failed') units.set(id, unit)
  }
  const put2 = (id: string, ok: boolean) => put(id, ok ? PASSED : FAILED)

  const goLegsSeen = new Set<string>()
  let goPresent = false

  for (const job of jobs) {
    const workflow = workflowOf(job)
    if (!workflow) continue
    const log = tidy(job.log)

    if (workflow === 'go') {
      goPresent = true
      const leg = goLegOf(job, log)
      if (leg === 'lint') {
        goLegsSeen.add('lint')
        put2('go-lint:tidy', stepOk(job, /tidiness|go mod tidy|generated/i))
        const issues = golangciIssues(log)
        put2('go-lint:golangci-lint', stepOk(job, /golangci/i) && issues === 0)
        commands.add('go mod tidy')
        commands.add('go generate ./...')
        const run = /Running \[\S*golangci-lint run\s+([^\]]*)\]/.exec(log)
        if (run) commands.add(`golangci-lint run ${(run[1] ?? '').trim()}`.trim())
      } else if (leg) {
        goLegsSeen.add(leg)
        const packages = goPackageResults(log)
        const ran = stepOk(job, /^Run tests/i)
        const failedPackage = [...packages.values()].some((p) => p.verdict === 'failed')
        put2(`go-test:${leg}`, ran && packages.size > 0 && !failedPackage)
        for (const [pkg, result] of packages) put(`go-test:${leg}:${pkg}`, result)
        const test = /^##\[group\]Run (go test [^\n>]*)/m.exec(log)
        if (test?.[1]) commands.add(test[1].replace(/\s+/g, ' ').trim())
      }
    }

    if (workflow === 'shell') {
      put2('shellcheck', stepOk(job, /shellcheck/i) && /ShellCheck - shell script analysis tool/.test(log))
    }

    if (workflow === 'web') {
      for (const [id, task, step] of [
        ['web:lint', 'moon run web:lint', /^Lint$/],
        ['web:build', 'moon run web:build', /^Build$/],
      ] as const) {
        const start = log.indexOf(`##[group]Run ${task}`)
        const segment = start >= 0 ? log.slice(start).split('##[group]')[1] ?? '' : ''
        const tasks = /Tasks: (\d+) completed(?: \((\d+) cached\))?/.exec(segment)
        const ok = stepOk(job, step) && tasks !== null && !/Tasks: .*failed/.test(segment)
        const allCached = tasks !== null && tasks[2] !== undefined && tasks[1] === tasks[2]
        put(id, ok ? (allCached ? { verdict: 'passed', mode: 'reused' } : PASSED) : FAILED)
        if (start >= 0) commands.add(task)
      }
      put2('web:clean-tree', stepOk(job, /uncommitted/i))
    }

    if (workflow === 'docker') {
      const jobId = job.logicalJobId || job.jobName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const buildStep = stepOk(job, /^Build and push/i)
      put2(`docker:${jobId}:build`, buildStep)
      if (!/load build definition from Dockerfile\.next/.test(log)) continue
      const vertices = buildkitVertices(log)
      const gate = (unit: Unit): Unit => (buildStep ? unit : FAILED)
      put(`docker:${jobId}:web-assets`, gate(verdictOf(vertices.filter((v) => WEB_BUILD.test(v.command)))))
      for (const platform of buildPlatforms(log)) {
        const goBuild = vertices.filter((v) => v.target === platform && GO_BUILD.test(v.command))
        const image = IMAGE_STEPS.flatMap((pattern) =>
          vertices.filter((v) => v.target === platform && pattern.test(v.command)),
        )
        // Every image step must be present: a missing step is a unit that did not run.
        const imageUnit = IMAGE_STEPS.every((p) => image.some((v) => p.test(v.command))) ? verdictOf(image) : FAILED
        put(`docker:${jobId}:go-binary:${platform}`, gate(verdictOf(goBuild)))
        put(`docker:${jobId}:image:${platform}`, gate(imageUnit))
      }
      for (const v of vertices) {
        if (GO_BUILD.test(v.command)) commands.add(goBuildCommand(v.command))
        else if (WEB_BUILD.test(v.command)) commands.add(v.command.replace(/^RUN /, ''))
      }
    }
  }

  // A go.yml run is expected to leave every leg behind; a leg with no job is a failed unit, not a missing one.
  if (goPresent) {
    for (const leg of GO_LEGS) if (!goLegsSeen.has(leg)) put(`go-test:${leg}`, FAILED)
    if (!goLegsSeen.has('lint')) {
      put('go-lint:tidy', FAILED)
      put('go-lint:golangci-lint', FAILED)
    }
  }

  const tests: TestCaseVerdictRecord[] = [...units]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([testId, unit]) => ({ testId, verdict: unit.verdict, mode: unit.mode }))
  const passed = new Set(tests.filter((t) => t.verdict === 'passed').map((t) => t.testId))
  for (const leg of GO_LEGS) if (passed.has(`go-test:${leg}`)) obligations.add(`go-tests:${leg}`)
  for (const id of ['go-lint:tidy', 'go-lint:golangci-lint', 'shellcheck', 'web:lint', 'web:build', 'web:clean-tree'])
    if (passed.has(id)) obligations.add(id)
  for (const id of passed) {
    const image = /^docker:([^:]+):image:(.+)$/.exec(id)
    if (image && passed.has(`docker:${image[1]}:go-binary:${image[2]}`)) obligations.add(`docker-image:${image[2]}`)
  }
  return {
    tests,
    // Package units appear only when seen; packages without test files are skipped, not required.
    coverage: { scope: tests.filter((t) => t.verdict !== 'skipped').map((t) => t.testId), covered: [...passed].sort() },
    obligations: [...obligations].sort(),
    commands: [...commands].sort(),
  }
}

export default extract

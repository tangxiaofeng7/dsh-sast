/**
 * The structural loop guard over the sast write tools (tools-protocol.md §3
 * "循环防护"): an identical write repeated after success is a duplicate and
 * is rejected; an identical write retried past two consecutive failures is a
 * loop and is rejected; a different intervening write resets the streak while
 * read-only re-orienting does not; `sast_start_scan` keeps its documented
 * reset semantics (an identical re-scan is a legitimate restart) with only
 * its failure-retry storm capped. Also covers the `sast_checkpoint`
 * orientation tool the guard's errors point at.
 * @module
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { sastHarness, SESSION_ID } from './harness.ts'

let workspacePath: string

beforeEach(() => {
  workspacePath = mkdtempSync(join(tmpdir(), 'sast-loop-guard-'))
  mkdirSync(join(workspacePath, 'src', 'dao'), { recursive: true })
  writeFileSync(join(workspacePath, 'src', 'dao', 'OrderDao.java'), 'line1\nline2\nline3\n')
  writeFileSync(join(workspacePath, 'README.md'), 'hello\n')
})

afterEach(() => {
  rmSync(workspacePath, { recursive: true, force: true })
})

/** Start a scan against the fixture workspace (provider: local skips cloning). */
function startScan(call: (name: string, args: unknown, sessionId: string) => Promise<unknown>, sessionId = SESSION_ID): Promise<unknown> {
  return call('sast_start_scan', { repoUrl: workspacePath, objective: 'find sqli' }, sessionId)
}

const DUPLICATED_INTENT = { scanId: 'scan-1', title: '测绘控制器与路由', detail: 'scope src/' }
const REJECTED_FACT = { intentId: 'intent-1', kind: 'sink', path: 'src/missing.ts', detail: 'never exists' }

describe('loop guard: duplicate-success rejection', () => {
  it('rejects a second identical sast_add_intent and leaves the graph unchanged', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await call('sast_add_intent', DUPLICATED_INTENT, SESSION_ID)
    await expect(call('sast_add_intent', DUPLICATED_INTENT, SESSION_ID)).rejects.toThrow(/loop guard rejected sast_add_intent/)
    const state = await call('sast_state', {}, SESSION_ID) as { counts: { intents: number } }
    expect(state.counts.intents).toBe(1)
  })

  it('rejects a duplicate delegated sast_submit without double-writing the parent graph', async () => {
    const { call, callAsChild } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as { id: string }
    const submission = {
      intentId: intent.id,
      facts: [{ kind: 'sink', path: 'src/dao/OrderDao.java', detail: '拼接 SQL' }],
      assets: [],
      findings: [],
    }
    await expect(callAsChild('sast_submit', submission, SESSION_ID)).resolves.toEqual({ facts: 1, assets: 0, findings: 0 })
    await expect(callAsChild('sast_submit', submission, SESSION_ID)).rejects.toThrow(/loop guard rejected sast_submit/)
    const state = await call('sast_state', {}, SESSION_ID) as { counts: { facts: number } }
    expect(state.counts.facts).toBe(1)
  })

  it('still accepts a genuinely different write: new arguments pass, and any other intervening write resets the streak', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await call('sast_add_intent', DUPLICATED_INTENT, SESSION_ID)
    await call('sast_add_asset', { type: 'file', value: 'src/dao/OrderDao.java' }, SESSION_ID)
    // The asset write reset the guard state, so the identical intent is
    // accepted again — the guard breaks consecutive loops, it does not
    // reimplement the protocol's own duplicate-intent discipline.
    await expect(call('sast_add_intent', DUPLICATED_INTENT, SESSION_ID)).resolves.toMatchObject({ id: 'intent-2' })
  })

  it('does not let read-only re-orienting launder a loop: reads never reset the streak', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await call('sast_add_intent', DUPLICATED_INTENT, SESSION_ID)
    await call('sast_state', {}, SESSION_ID)
    await call('sast_checkpoint', {}, SESSION_ID)
    await call('sast_coverage', {}, SESSION_ID)
    await expect(call('sast_add_intent', DUPLICATED_INTENT, SESSION_ID)).rejects.toThrow(/loop guard/)
  })

  it('keys the streak per session: another session\'s identical write is unaffected', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await startScan(call, 'session-b')
    await call('sast_add_intent', { ...DUPLICATED_INTENT, scanId: 'scan-1' }, SESSION_ID)
    await expect(call('sast_add_intent', { ...DUPLICATED_INTENT, scanId: 'scan-1' }, SESSION_ID)).rejects.toThrow(/loop guard/)
    await expect(call('sast_add_intent', { ...DUPLICATED_INTENT, scanId: 'scan-1' }, 'session-b')).resolves.toMatchObject({ id: 'intent-1' })
  })

  it('rejects a non-agent caller with the owning-session error before executing', async () => {
    const { callWithoutAgent } = await sastHarness()
    await expect(callWithoutAgent('sast_add_intent', DUPLICATED_INTENT)).rejects.toThrow(/require an owning agent session/)
  })
})

describe('loop guard: failure-retry rejection', () => {
  it('allows two identical failures, then rejects the third identical attempt', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as { id: string }
    const badFact = { ...REJECTED_FACT, intentId: intent.id }
    await expect(call('sast_add_fact', badFact, SESSION_ID)).rejects.toThrow(/does not exist in the scan workspace/)
    await expect(call('sast_add_fact', badFact, SESSION_ID)).rejects.toThrow(/does not exist in the scan workspace/)
    await expect(call('sast_add_fact', badFact, SESSION_ID)).rejects.toThrow(/loop guard rejected sast_add_fact/)
  })

  it('lets corrected arguments through after repeated failures of the rejected ones', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    const intent = await call('sast_add_intent', { scanId: 'scan-1', title: 'a' }, SESSION_ID) as { id: string }
    const badFact = { ...REJECTED_FACT, intentId: intent.id }
    await expect(call('sast_add_fact', badFact, SESSION_ID)).rejects.toThrow(/does not exist/)
    await expect(call('sast_add_fact', badFact, SESSION_ID)).rejects.toThrow(/does not exist/)
    await expect(call('sast_add_fact', { ...badFact, path: 'src/dao/OrderDao.java' }, SESSION_ID)).resolves.toMatchObject({ id: 'fact-1' })
  })

  it('caps a failing sast_start_scan retry storm while keeping the documented identical re-scan reset', async () => {
    const { call } = await sastHarness()
    const badUrl = join(workspacePath, 'nope')
    await expect(call('sast_start_scan', { repoUrl: badUrl, objective: 'o' }, SESSION_ID)).rejects.toThrow(/does not exist/)
    await expect(call('sast_start_scan', { repoUrl: badUrl, objective: 'o' }, SESSION_ID)).rejects.toThrow(/does not exist/)
    await expect(call('sast_start_scan', { repoUrl: badUrl, objective: 'o' }, SESSION_ID)).rejects.toThrow(/loop guard rejected sast_start_scan/)
    // An identical SUCCEEDED re-scan stays legal: restarting an audit is a
    // real user flow, and the scan resets the graph by contract.
    await expect(startScan(call)).resolves.toMatchObject({ id: 'scan-1' })
    await expect(startScan(call)).resolves.toMatchObject({ id: 'scan-1' })
  })
})

describe('sast_checkpoint', () => {
  it('points an uninitialized session at sast_start_scan', async () => {
    const { call } = await sastHarness()
    await expect(call('sast_checkpoint', {}, SESSION_ID)).resolves.toEqual({
      summary: 'Progress: no scan recorded yet in this session.',
      nextAction: 'Call sast_start_scan with repoUrl and objective to begin the audit.',
    })
  })

  it('summarizes progress and suggests the audit-chain next step for each stage', async () => {
    const { call } = await sastHarness()
    await startScan(call)
    await call('sast_add_asset', { type: 'file', value: 'src/dao/OrderDao.java' }, SESSION_ID)
    await expect(call('sast_checkpoint', {}, SESSION_ID)).resolves.toMatchObject({
      nextAction: expect.stringMatching(/sast_add_intent/),
    })
    await call('sast_add_intent', { scanId: 'scan-1', title: '测绘控制器' }, SESSION_ID)
    await expect(call('sast_checkpoint', {}, SESSION_ID)).resolves.toMatchObject({
      summary: expect.stringMatching(/1 intents, 0 facts, 0 findings/),
      nextAction: expect.stringMatching(/sast_submit|sast_add_fact/),
    })
    await call('sast_add_fact', { intentId: 'intent-1', kind: 'sink', path: 'src/dao/OrderDao.java', line: 2, detail: '拼接 SQL' }, SESSION_ID)
    await expect(call('sast_checkpoint', {}, SESSION_ID)).resolves.toMatchObject({
      nextAction: expect.stringMatching(/sast_add_finding|derivedFromFactId/),
    })
    await call('sast_add_finding', {
      intentId: 'intent-1', title: 'SQL 注入', severity: 'high',
      codePath: [{ path: 'src/dao/OrderDao.java', line: 2 }],
    }, SESSION_ID)
    await expect(call('sast_checkpoint', {}, SESSION_ID)).resolves.toMatchObject({
      summary: expect.stringMatching(/Last finding: 「SQL 注入」\[high\]/),
      nextAction: expect.stringMatching(/sast_triage|sast_report/),
    })
  })

  it('renders as a one-line summary plus an arrow-prefixed next action', async () => {
    const { render } = await sastHarness()
    const blocks = render('sast_checkpoint', {}, { summary: 'Progress: 1 intents.', nextAction: 'Call sast_state.' }) as Array<{ text: string }>
    expect(blocks).toEqual([{ type: 'text', text: 'Progress: 1 intents.\n→ Call sast_state.' }])
  })
})

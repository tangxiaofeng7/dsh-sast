/**
 * Sast apply acceptance: the per-session 白盒审计 view registration. No
 * entry mounts until the CURRENT session (or a listed ancestor) carries the
 * sast capability: the `sast` preset id, a copy keeping the `sast-` prefix,
 * or the host-folded `sastMounted` mark proving the session's own log
 * carries the row. The entry follows current-session switches and in-place
 * preset switches; the preset reads off either sessions-list wire (0.1.2+
 * projects it into `projectionValues`, 0.1.1 and earlier row it); the inject
 * disposer removes every subscription and registration.
 */
import { describe, expect, it, vi, type Mock } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { apply } from '../src/client/index.ts'
import { apply as nodeApply } from '../src/index.ts'
import { SastView } from '../src/client/SastView.tsx'
import { NS, en, zh } from '../src/client/locales.ts'

/** One recorded view registration. */
interface RegisterCall {
  options: { name: string; id?: string; order?: number; locale?: string; label?: () => string }
  component: unknown
}

/** The locale service's dictionary-registration signature. */
type RegisterDictionary = (_ns: string, _dicts: { zh: Record<string, string>; en: Record<string, string> }) => () => undefined

/** The fake ctx effect's signature (runs the function, keeps its disposer). */
type RunEffect = (fn: () => () => void) => () => void

/** Which sessions-list wire carries the agent preset. */
type PresetWire = 'projection' | 'row'

/** One fake session row: the preset fact in the shape the selected wire uses. */
interface Row {
  agentPreset?: string
  projectionValues?: Record<string, unknown>
  parentId?: string
}

/** Driving harness: fake slots/locale/sessions services with manual notify. */
function boot(wire: PresetWire = 'projection'): {
  setCurrent(id: string | undefined): void
  setPreset(id: string, preset: string | null | undefined): void
  setMounted(id: string, mounted: boolean): void
  setParent(id: string, parentId: string | undefined): void
  touchList(): void
  disposeInjection(): void
  registeredIds(): string[]
  registerCalls(): RegisterCall[]
  listListeners(): number
  injectNames(): string[]
  effect: Mock<RunEffect>
  localeRegister: Mock<RegisterDictionary>
} {
  const listListeners = new Set<() => void>()
  const registerCalls: RegisterCall[] = []
  const registered = new Map<string, unknown>()
  const injectNames: string[] = []
  let current: string | undefined
  const byId = new Map<string, Row>()
  let injectDispose: (() => void) | undefined

  const register = (options: RegisterCall['options'], component: unknown) => {
    registerCalls.push({ options, component })
    const id = options.id ?? ''
    registered.set(id, component)
    return () => { registered.delete(id) }
  }
  const inject = (name: string, callback: () => () => void) => {
    injectNames.push(name)
    injectDispose = callback()
    return () => { injectDispose?.() }
  }
  const localeRegister: Mock<RegisterDictionary> = vi.fn((_ns, _dicts) => () => undefined)
  const bind = vi.fn(() => (key: string) => key)
  const effect: Mock<RunEffect> = vi.fn(fn => fn())

  apply({
    slots: { inject, register },
    locale: { register: localeRegister, bind },
    effect,
    sessions: {
      list: {
        getSnapshot: () => ({
          current,
          byId: Object.fromEntries(byId),
        }),
        subscribe: (fn: () => void) => {
          listListeners.add(fn)
          return () => { listListeners.delete(fn) }
        },
      },
    },
  } as never)

  return {
    setCurrent(id) {
      current = id
      for (const fn of [...listListeners]) fn()
    },
    setPreset(id, preset) {
      const row: Row = { ...byId.get(id) }
      if (wire === 'row') {
        if (typeof preset === 'string') row.agentPreset = preset
        else delete row.agentPreset
      } else {
        const projectionValues = { ...row.projectionValues }
        if (preset === undefined) delete projectionValues.agentPreset
        else projectionValues.agentPreset = preset
        row.projectionValues = projectionValues
      }
      byId.set(id, row)
      for (const fn of [...listListeners]) fn()
    },
    setMounted(id, mounted) {
      const row: Row = { ...byId.get(id) }
      row.projectionValues = { ...row.projectionValues, sastMounted: mounted }
      byId.set(id, row)
      for (const fn of [...listListeners]) fn()
    },
    setParent(id, parentId) {
      const row: Row = { ...byId.get(id) }
      if (parentId === undefined) delete row.parentId
      else row.parentId = parentId
      byId.set(id, row)
      for (const fn of [...listListeners]) fn()
    },
    touchList() {
      for (const fn of [...listListeners]) fn()
    },
    disposeInjection() { injectDispose?.() },
    registeredIds: () => [...registered.keys()],
    registerCalls: () => registerCalls,
    listListeners: () => listListeners.size,
    injectNames: () => injectNames,
    effect,
    localeRegister,
  }
}

describe('sast surface registration', () => {
  it('mounts the dictionaries and no entries until a sast-preset session is current', () => {
    const h = boot()
    expect(h.effect).toHaveBeenCalledWith(expect.any(Function), 'ui-sast: dictionaries')
    expect(h.localeRegister).toHaveBeenCalledTimes(1)
    const [ns, dictionaries] = h.localeRegister.mock.calls[0]!
    expect(ns).toBe(NS)
    expect(dictionaries.zh).toBe(zh)
    expect(dictionaries.en).toBe(en)
    expect(h.injectNames()).toEqual(['conversation.view'])
    expect(h.registeredIds()).toEqual([])

    h.setCurrent('s-a')
    expect(h.registeredIds()).toEqual([]) // listed session, no preset yet

    h.setPreset('s-a', 'standard')
    expect(h.registeredIds()).toEqual([]) // non-sast preset: no tab

    h.setPreset('s-a', 'sast')
    expect(h.registeredIds()).toEqual(['sast'])
    expect(h.registerCalls()).toHaveLength(1)
    const viewCall = h.registerCalls()[0]!
    expect(viewCall.options).toMatchObject({ name: 'conversation.view', id: 'sast', order: 20, locale: NS })
    expect(viewCall.options.label!()).toBe('view.sast')
    expect(viewCall.component).toBe(SastView)
  })

  it('tracks the current session and its agent preset', () => {
    const h = boot()
    h.setPreset('s-sast', 'sast')
    h.setCurrent('s-sast')
    expect(h.registeredIds()).toEqual(['sast'])

    h.setPreset('s-normal', 'standard')
    h.setCurrent('s-normal') // switch away: disposed
    expect(h.registeredIds()).toEqual([])

    h.setCurrent('s-sast') // switch back: re-registered
    expect(h.registeredIds()).toEqual(['sast'])
    expect(h.registerCalls()).toHaveLength(2)

    h.setPreset('s-sast', 'standard') // in-place preset switch: disposed
    expect(h.registeredIds()).toEqual([])

    h.setPreset('s-sast', 'sast') // back again
    expect(h.registeredIds()).toEqual(['sast'])
    expect(h.registerCalls()).toHaveLength(3)

    h.touchList() // same session, same preset: no re-registration
    expect(h.registerCalls()).toHaveLength(3)

    h.setCurrent('s-ghost') // current without a list row: nothing to watch
    expect(h.registeredIds()).toEqual([])

    h.setCurrent(undefined) // no current session
    expect(h.registeredIds()).toEqual([])
    expect(h.registerCalls()).toHaveLength(3)
  })

  it('mounts the tab for subagents of a sast session and hides it for others', () => {
    const h = boot()
    h.setPreset('s-parent', 'sast')
    h.setParent('s-child', 's-parent')
    h.setCurrent('s-child')
    expect(h.registeredIds()).toEqual(['sast'])

    h.setParent('s-grandchild', 's-child')
    h.setCurrent('s-grandchild')
    expect(h.registeredIds()).toEqual(['sast'])

    h.setPreset('s-normal', 'standard')
    h.setParent('s-child-of-normal', 's-normal')
    h.setCurrent('s-child-of-normal')
    expect(h.registeredIds()).toEqual([])

    h.setPreset('s-parent', 'standard')
    h.setCurrent('s-child')
    expect(h.registeredIds()).toEqual([])
  })

  it('terminates on ancestor cycles', () => {
    const h = boot()
    h.setPreset('s-cyc', 'standard')
    h.setParent('s-cyc', 's-cyc')
    h.setCurrent('s-cyc')
    expect(h.registeredIds()).toEqual([])
  })

  it('reads the preset off either sessions-list wire', () => {
    const projected = boot('projection')
    projected.setPreset('s-sast', 'sast')
    projected.setCurrent('s-sast')
    expect(projected.registeredIds()).toEqual(['sast'])

    const row = boot('row')
    row.setPreset('s-sast', 'sast')
    row.setCurrent('s-sast')
    expect(row.registeredIds()).toEqual(['sast'])
  })

  it('mounts nothing for a null preset projection', () => {
    const h = boot()
    h.setPreset('s-plain', null)
    h.setCurrent('s-plain')
    expect(h.registeredIds()).toEqual([])

    h.setPreset('s-plain', 'sast')
    expect(h.registeredIds()).toEqual(['sast'])
  })

  it('mounts the tab for preset copies: the id prefix and the session mark', () => {
    const prefixed = boot()
    prefixed.setPreset('s-copy', 'sast-hardened')
    prefixed.setCurrent('s-copy')
    expect(prefixed.registeredIds()).toEqual(['sast'])

    const renamed = boot()
    renamed.setPreset('s-renamed', 'audit-lab')
    renamed.setCurrent('s-renamed')
    expect(renamed.registeredIds()).toEqual([])
    renamed.setMounted('s-renamed', true)
    expect(renamed.registeredIds()).toEqual(['sast'])
  })

  it('reads the mount mark off either sessions-list wire', () => {
    const projected = boot('projection')
    projected.setPreset('s-any', 'recon-mode')
    projected.setMounted('s-any', true)
    projected.setCurrent('s-any')
    expect(projected.registeredIds()).toEqual(['sast'])

    const row = boot('row')
    row.setPreset('s-any', 'recon-mode')
    row.setMounted('s-any', true)
    row.setCurrent('s-any')
    expect(row.registeredIds()).toEqual(['sast'])
  })

  it('resolves a renamed preset through the ancestor chain', () => {
    const h = boot()
    h.setPreset('s-commander', 'audit-lab')
    h.setMounted('s-commander', true)
    h.setParent('s-executor', 's-commander')
    h.setCurrent('s-executor')
    expect(h.registeredIds()).toEqual(['sast'])
  })

  it('keeps the tab once the session proved the mount, even after a preset switch', () => {
    const h = boot()
    h.setPreset('s-swapped', 'sast')
    h.setCurrent('s-swapped')
    expect(h.registeredIds()).toEqual(['sast'])

    h.setMounted('s-swapped', true)
    h.setPreset('s-swapped', 'standard')
    expect(h.registeredIds()).toEqual(['sast'])
  })

  it('leaves a foreign session unregistered', () => {
    const h = boot()
    h.setPreset('s-plain', 'standard')
    h.setMounted('s-plain', false)
    h.setCurrent('s-plain')
    expect(h.registeredIds()).toEqual([])
  })

  it('the inject disposer removes every subscription and the entry', () => {
    const h = boot()
    h.setPreset('s-sast', 'sast')
    h.setCurrent('s-sast')
    expect(h.registeredIds()).toEqual(['sast'])
    expect(h.listListeners()).toBe(1)

    h.disposeInjection()
    expect(h.registeredIds()).toEqual([])
    expect(h.listListeners()).toBe(0)

    h.setPreset('s-sast', 'standard')
    h.setCurrent('s-normal')
    expect(h.registerCalls()).toHaveLength(1)
  })
})

describe('ui-sast node half', () => {
  it('the node apply is an inert loader seat; the invariant host covers the companion', async () => {
    expect(() => { nodeApply() }).not.toThrow()
    const ctx = new Context()
    await ctx.plugin({ name: 'ui-sast-node', apply: nodeApply })
    await ctx.fiber.dispose()
  })
})

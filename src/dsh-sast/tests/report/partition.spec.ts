/**
 * @module
 */

import { describe, expect, it } from 'vitest'
import { partitionByTriage } from '../../src/report/partition.ts'
import { findingFixture } from './fixtures.ts'

describe('partitionByTriage', () => {
  it('routes an open finding into active', () => {
    const finding = findingFixture({ status: 'open' })
    expect(partitionByTriage([finding])).toEqual({ active: [finding], excluded: [] })
  })

  it('routes a confirmed finding into active', () => {
    const finding = findingFixture({ status: 'confirmed' })
    expect(partitionByTriage([finding])).toEqual({ active: [finding], excluded: [] })
  })

  it('routes a wont-fix finding into active (it is still a real, active vulnerability)', () => {
    const finding = findingFixture({ status: 'wont-fix' })
    expect(partitionByTriage([finding])).toEqual({ active: [finding], excluded: [] })
  })

  it('routes a false-positive finding into excluded, without dropping it', () => {
    const finding = findingFixture({ status: 'false-positive' })
    expect(partitionByTriage([finding])).toEqual({ active: [], excluded: [finding] })
  })

  it('preserves relative order within each partition across a mixed list', () => {
    const a = findingFixture({ id: 'finding-a', status: 'open' })
    const b = findingFixture({ id: 'finding-b', status: 'false-positive' })
    const c = findingFixture({ id: 'finding-c', status: 'confirmed' })
    expect(partitionByTriage([a, b, c])).toEqual({ active: [a, c], excluded: [b] })
  })
})

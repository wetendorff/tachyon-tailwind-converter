import { describe, expect, it } from 'bun:test'
import { removeNewLines } from './strings'

describe('removeNewLines', () => {
  it('should remove all new lines from a string', () => {
    const input = 'This is a\nstring\nwith\nnew lines.'
    const expectedOutput = 'This is a string with new lines.'
    expect(removeNewLines(input)).toEqual(expectedOutput)
  })

  it('should return an empty string if given an empty string', () => {
    expect(removeNewLines('')).toEqual('')
  })

  it('should return the same string if there are no new lines', () => {
    const input = 'This is a string without new lines.'
    expect(removeNewLines(input)).toEqual(input)
  })
})

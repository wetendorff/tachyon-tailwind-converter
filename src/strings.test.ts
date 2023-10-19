import { describe, expect, it } from 'bun:test'
import {
  decodeStringSymbolsInComments,
  encodeStringSymbolsInComments,
  removeNewLines,
} from './strings'

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

describe('encodeStringSymbolsInComments', () => {
  it('should encode string symbols in single-line comments', () => {
    const input = `// This is a comment with "double quotes" and 'single quotes'.`
    const expectedOutput =
      '// This is a comment with °double quotes° and ∑single quotes∑.'
    expect(encodeStringSymbolsInComments(input)).toEqual(expectedOutput)
  })

  it('should encode string symbols in multi-line comments', () => {
    const input = `/* This is a comment with "double quotes" and 'single quotes'. */`
    const expectedOutput =
      '/* This is a comment with °double quotes° and ∑single quotes∑. */'
    expect(encodeStringSymbolsInComments(input)).toEqual(expectedOutput)
  })

  it('should not encode string symbols in comments that are not enclosed in quotes', () => {
    const input = '// This is a comment with a string symbol: $'
    expect(encodeStringSymbolsInComments(input)).toEqual(input)
  })

  it('should not encode string symbols in comments that are already encoded', () => {
    const input =
      '// This is a comment with %22double quotes%22 and %27single quotes%27.'
    expect(encodeStringSymbolsInComments(input)).toEqual(input)
  })
})

describe('decodeStringSymbolsInComments', () => {
  it('should decode string symbols in single line comments', () => {
    const input = '// This is a comment with encoded string symbols: °∑ª'
    const expectedOutput =
      '// This is a comment with encoded string symbols: "\'`'
    expect(decodeStringSymbolsInComments(input)).toEqual(expectedOutput)
  })

  it('should decode string symbols in multi-line comments', () => {
    const input = '/* This is a comment with encoded string symbols: °∑ª */'
    const expectedOutput =
      '/* This is a comment with encoded string symbols: "\'` */'
    expect(decodeStringSymbolsInComments(input)).toEqual(expectedOutput)
  })

  it('should not modify comments without encoded string symbols', () => {
    const input = '// This is a comment without encoded string symbols'
    expect(decodeStringSymbolsInComments(input)).toEqual(input)
  })

  it('should not modify non-comment text', () => {
    const input = 'This is not a comment'
    expect(decodeStringSymbolsInComments(input)).toEqual(input)
  })
})

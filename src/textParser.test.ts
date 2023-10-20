import { describe, expect, it } from 'bun:test'
import { parseText } from './textParser'

describe('parseText', () => {
  it('should correctly parse a string with single-line comments and double quotes', () => {
    const input = `const message = "Hello, world!"; // This is a comment`
    const expectedOutput = {
      strings: [
        {
          content: `"Hello, world!"`,
          start: 16,
          end: 31,
        },
      ],
      comments: [
        {
          content: `// This is a comment`,
          start: 33,
          end: 53,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with multi-line comments and single quotes', () => {
    const input = `const message = 'Hello, world!'; /* This is a\nmulti-line\ncomment */`
    const expectedOutput = {
      strings: [
        {
          content: `'Hello, world!'`,
          start: 16,
          end: 31,
        },
      ],
      comments: [
        {
          content: `/* This is a\nmulti-line\ncomment */`,
          start: 33,
          end: 67,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with HTML comments', () => {
    const input = `const message = 'Hello, world!'; <!-- This is an HTML comment -->`
    const expectedOutput = {
      strings: [
        {
          content: `'Hello, world!'`,
          start: 16,
          end: 31,
        },
      ],
      comments: [
        {
          content: `<!-- This is an HTML comment -->`,
          start: 33,
          end: 65,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with Razor comments', () => {
    const input = `const message = 'Hello, world!'; @* This is a Razor comment *@`
    const expectedOutput = {
      strings: [
        {
          content: `'Hello, world!'`,
          start: 16,
          end: 31,
        },
      ],
      comments: [
        {
          content: `@* This is a Razor comment *@`,
          start: 33,
          end: 62,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with single-line comments and escaped quotes', () => {
    const input = `const message = "Hello, \\"world\\"!"; // This is a comment`
    const expectedOutput = {
      strings: [
        {
          content: `\"Hello, \\\"`,
          start: 16,
          end: 26,
        },
        {
          content: `\"!\"`,
          start: 32,
          end: 35,
        },
      ],
      comments: [
        {
          content: `// This is a comment`,
          start: 37,
          end: 57,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with single-line comments and backticks (NOT SUPPORTED)', () => {
    const input = 'const message = `Hello, world!`; // This is a comment'
    const expectedOutput = {
      strings: [
        {
          content: '`Hello, world!`',
          start: 16,
          end: 31,
        },
      ],
      comments: [
        {
          content: `// This is a comment`,
          start: 33,
          end: 53,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with single-line comments and escaped backticks (NOT SUPPORTED)', () => {
    const input = 'const message = `Hello, \\`world\\`!`; // This is a comment'
    const expectedOutput = {
      strings: [
        {
          content: '`Hello, \\`',
          start: 16,
          end: 26,
        },
        {
          content: '`!`',
          start: 32,
          end: 35,
        },
      ],
      comments: [
        {
          content: `// This is a comment`,
          start: 37,
          end: 57,
        },
      ],
    }
    expect(parseText(input)).toEqual(expectedOutput)
  })

  it('should correctly parse a string with nested multi double quotes strings', () => {
    const input = 'const x = `ma0 line center block ${value ? "mb1" : "mb2"}`;'
    const expectedOutput = {
      strings: [
        {
          content: '`ma0 line center block ${value ? \'"mb1" : "mb2"}`',
          start: 10,
          end: 58,
        },
        {
          content: `"mb1"`,
          start: 43,
          end: 46,
        },
        {
          content: `"mb2"`,
          start: 51,
          end: 54,
        },
      ],
      comments: [],
    }
  })

  it('should correctly parse a string with nested multi single quotes strings', () => {
    const input = "const x = `ma0 line center block ${value ? 'mb1' : 'mb2'}`;"
    const expectedOutput = {
      strings: [
        {
          content: "`ma0 line center block ${value ? 'mb1' : 'mb2'}`",
          start: 10,
          end: 58,
        },
        {
          content: `'mb1'`,
          start: 43,
          end: 46,
        },
        {
          content: `'mb2'`,
          start: 51,
          end: 54,
        },
      ],
      comments: [],
    }
  })
})

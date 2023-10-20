import { describe, expect, it } from 'bun:test'
import {
  parseStringForTachyonClasses,
  replaceTachyonClassesInText,
  replaceTachyonClassesWithTailwindClassesInString,
} from './parse'

describe('parseStringForTachyonClasses', () => {
  it('should return an empty array for an empty string', () => {
    expect(parseStringForTachyonClasses('')).toEqual([])
  })

  it('should return an empty array for a string with no Tachyon classes', () => {
    expect(
      parseStringForTachyonClasses(
        'This is a test string without any tachyon classes',
      ),
    ).toEqual([])
  })

  it('should return an array of Tachyon classes for a string with Tachyon classes', () => {
    expect(
      parseStringForTachyonClasses(
        'This is a test string with some tachyon classes: o-50 pa3 fw6',
      ),
    ).toEqual(['o-50', 'pa3', 'fw6'])
  })

  it('should return an array of unique Tachyon classes for a string with duplicate Tachyon classes', () => {
    expect(
      parseStringForTachyonClasses(
        'This is a test string with some duplicate tachyon classes: o-50 pa3 fw6 o-50',
      ),
    ).toEqual(['o-50', 'pa3', 'fw6'])
  })
})

describe('replaceTachyonClassesWithTailwindClasses', () => {
  it('should replace a single Tachyon class with a single Tailwind class', () => {
    const input = 'o-50'
    const expectedOutput = 'opacity-50'
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
    )
  })

  it('should replace multiple Tachyon classes with multiple Tailwind classes', () => {
    const input = 'o-50 pa3 fw6'
    const expectedOutput = 'opacity-50 p-4 font-semibold'
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
    )
  })

  it('should replace Tachyon classes with a Tailwind class even when there are duplicates', () => {
    const input = 'o-50 pa3 fw6 o-50'
    const expectedOutput = 'opacity-50 p-4 font-semibold opacity-50'
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
    )
  })

  it('should not replace non-Tachyon classes', () => {
    const input = 'This is a test string without any tachyon classes'
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      input,
    )
  })

  it('should ignore Tachyon classes inside a comment if there are fewer Tachyon classes than other "words"', () => {
    const input = 'no-a-tachyon-class ignore-me o-50'
    const expectedOutput = 'no-a-tachyon-class ignore-me o-50'
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
    )
  })
})

describe('replaceTachyonClassesInText', () => {
  it('should replace Tachyon classes with Tailwind classes in a string with Tachyon classes inside a string', () => {
    const input = `This is a test string with some Tachyon classes inside a string: "o-50 pa3 fw6"`
    const expectedOutput = `This is a test string with some Tachyon classes inside a string: "opacity-50 p-4 font-semibold"`
    expect(replaceTachyonClassesInText(input)).toEqual(expectedOutput)
  })

  it('should replace Tachyon classes with Tailwind classes in a string with Tachyon classes inside multiple strings', () => {
    const input =
      'This is a test string with some Tachyon classes inside multiple strings: "o-50" \'pa3 fw6\''
    const expectedOutput =
      'This is a test string with some Tachyon classes inside multiple strings: "opacity-50" \'p-4 font-semibold\''
    expect(replaceTachyonClassesInText(input)).toEqual(expectedOutput)
  })

  it('should replace Tachyon classes with Tailwind classes in a template string with Tachyon classes inside multiple strings', () => {
    const input = `
      <p>
        <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='o-50 pa3 fw6'/>
        <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-o-50 dn pa3 fw6'/>
      </p>
    `
    const expectedOutput = `
      <p>
        <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='opacity-50 p-4 font-semibold'/>
        <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-o-50 hidden p-4 font-semibold'/>
      </p>
    `
    expect(replaceTachyonClassesInText(input)).toEqual(expectedOutput)
  })
})

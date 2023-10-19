import { describe, expect, it } from 'bun:test'
import {
  parseStringForTachyonClasses,
  parseTextForStrings,
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

  it('should return an array of Tachyon classes for a string with Tachyon classes inside a string', () => {
    expect(
      parseStringForTachyonClasses(
        'This is a test string with some tachyon classes inside a string: "o-50 pa3 fw6"',
      ),
    ).toEqual(['o-50', 'pa3', 'fw6'])
  })

  it('should return an array of Tachyon classes for a string with Tachyon classes inside multiple strings', () => {
    expect(
      parseStringForTachyonClasses(
        'This is a test string with some tachyon classes inside multiple strings: "o-50" \'pa3 fw6\'',
      ),
    ).toEqual(['o-50', 'pa3', 'fw6'])
  })

  it('should return an array of Tachyon classes for a template string with Tachyon classes inside multiple string', () => {
    expect(
      parseStringForTachyonClasses(
        `
            <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='default-svg v-mid pb1'/>
            <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-svg dn v-mid pb1'/>
        `,
      ),
    ).toEqual(['v-mid', 'pb1', 'dn'])
  })
})

describe('parseTextForStrings', () => {
  it('should return an empty array for an empty string', () => {
    expect(parseTextForStrings('')).toEqual([])
  })

  it('should return an empty array for a string with no strings', () => {
    expect(
      parseTextForStrings('This is a test string without any strings'),
    ).toEqual([])
  })

  it('should return an array of strings for a string with strings', () => {
    expect(
      parseTextForStrings(
        'This is a test string with some "strings" and `backtick strings`',
      ),
    ).toEqual(['strings', 'backtick strings'])
  })

  it('should return an array of unique strings for a string with duplicate strings', () => {
    expect(
      parseTextForStrings(
        'This is a test string with some duplicate "strings" and `backtick strings` and "strings"',
      ),
    ).toEqual(['strings', 'backtick strings', 'strings'])
  })

  it('should return an array of strings for a string with strings inside multiple strings', () => {
    expect(
      parseTextForStrings(
        `This is a test string with some "strings" 'and backtick strings'`,
      ),
    ).toEqual(['strings', 'and backtick strings'])
  })

  it('should return an array of strings for a template string with strings inside multiple string', () => {
    expect(
      parseTextForStrings(
        `using Microsoft.AspNetCore.Razor.TagHelpers;
    
            namespace Hejdoktor.Web.Helpers.TagHelpers
            {
                public class GhostButtonTertiaryTagHelper : BaseTagHelper
                {
                    public override void Process(TagHelperContext context, TagHelperOutput output)
                    {
                        output.TagName = "button";
                        string commonClasses = "ghost-button-arrow bg-transparent bn dib f5 fw7 lh-copy primary-blue hover-primary-blue-light pointer";
                        string paddingClass = RemovePadding ? "" : "pa3";
                        output.Attributes.Add("class", $"{CssClass} {commonClasses} {paddingClass}");
            
                        if (ShowLeftArrow)
                        {
                            string showLeftArrow = @"
                            <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='default-svg v-mid pb1'/>
                            <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-svg dn v-mid pb1'/>
                            ";
            
                            output.PreContent.SetHtmlContent(showLeftArrow);
                        }
                    }
                }
            }
            `,
      ),
    ).toEqual([
      'button',
      'ghost-button-arrow bg-transparent bn dib f5 fw7 lh-copy primary-blue hover-primary-blue-light pointer',
      'pa3',
      'class',
      '{CssClass} {commonClasses} {paddingClass}',
      `
                            <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='default-svg v-mid pb1'/>
                            <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-svg dn v-mid pb1'/>
                            `,
    ])
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

  it('should replace Tachyon classes inside a string', () => {
    const input =
      'This is a test string with some tachyon classes inside a string: "o-50 pa3 fw6"'
    const expectedOutput =
      'This is a test string with some tachyon classes inside a string: "opacity-50 p-4 font-semibold"'
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
    )
  })

  it('should replace Tachyon classes inside multiple strings', () => {
    const input = `This is a test string with some tachyon classes inside multiple strings: "o-50" 'pa3 fw6'`
    const expectedOutput = `This is a test string with some tachyon classes inside multiple strings: "opacity-50" 'p-4 font-semibold\'`
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
    )
  })

  it('should replace Tachyon classes inside a template string', () => {
    const input = `
      <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='default-svg pb1'/>
      <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-svg dn v-mid pb1'/>
    `
    const expectedOutput = `
      <img src='/images/icons_shape/arrow-left-dark-blue.svg' class='default-svg pb-1'/>
      <img src='/images/icons_shape/arrow-left-light-blue.svg' class='hover-svg hidden align-middle pb-1'/>
    `
    expect(replaceTachyonClassesWithTailwindClassesInString(input)).toEqual(
      expectedOutput,
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

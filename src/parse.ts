import config from '../config'
import db from './database'
import {
  decodeStringSymbolsInComments,
  encodeStringSymbolsInComments,
  findStringsRegEx,
  multiLineCommentsRegEx,
  removeNewLines,
  singleLineCommentsRegEx,
  tachyonClassRegEx,
} from './strings'
import { traverseDirectory } from './traverseDir'

/**
 * Parses a Tachyon CSS file and creates or updates Tachyon classes in the database.
 * @param path - The path to the Tachyon CSS file.
 */
export async function parseTachyonCSSFile(path: string) {
  const file = Bun.file(path)
  const content = await file.text()

  // Regex match: ".[tachyonClassName] { [tachyonClassDefinition] }"
  let match
  while ((match = tachyonClassRegEx.exec(content))) {
    const tachyon = match[1]
    const css = removeNewLines(match[2]).trim()
    db.createOrUpdateTachyon(tachyon, css)
  }
}

/**
 * Finds all used Tachyon classes in files recersive in the source directory.
 */
export async function findAllUsedTachyonClasses() {
  const dir = config.sourceDirectory
  await traverseDirectory(dir, fileCallback)
}

export async function fileCallback(file: string) {
  let text = await Bun.file(file).text()
  text = text.replace(singleLineCommentsRegEx, '')
  text = text.replace(multiLineCommentsRegEx, '')

  const strings = parseTextForStrings(text)
  const tachyonClasses = new Set<string>()

  strings.forEach((str) => {
    const result = parseStringForTachyonClasses(str)
    result.forEach((tachyon) => {
      tachyonClasses.add(tachyon)
    })
  })

  // Mark all found tachyon classes as used and connect it with the current file
  tachyonClasses.forEach((tachyon) => {
    const tachyonId = db.markTachyonClassAsUsed(tachyon)
    db.createOrUpdateFile(file, tachyonId)
  })
}

export function parseTextForStrings(text: string) {
  // Find all strings
  const foundStrings: string[] = []
  let match
  while ((match = findStringsRegEx.exec(text))) {
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        foundStrings.push(match[i])
      }
    }
  }
  return foundStrings
}

export function parseStringForTachyonClasses(str: string): string[] {
  const tachyonSet = db.getTachyonClassesAsSet()
  const tachyonClasses: Set<string> = new Set()

  const foundStrings = parseTextForStrings(str)

  if (foundStrings.length > 0) {
    foundStrings.forEach((str) => {
      const result = parseStringForTachyonClasses(str)

      // Show a warning if we found less tachyon classes than other "words"
      if (result.length > 0) {
        const balance = result.length - (str.split(' ').length - result.length)
        // If the balance is negative, we have found less tachyon classes than other "words"
        if (balance < 0) {
          console.log('\nIgnored due to suspected false positive.')
          console.log('"' + str + '"')
          console.log(result)
        }
      }

      result.forEach((tachyon) => {
        tachyonClasses.add(tachyon)
      })
    })
  } else {
    const words = str.split(' ')
    words.forEach((word) => {
      if (tachyonSet.has(word)) {
        tachyonClasses.add(word)
      }
    })
  }

  return Array.from(tachyonClasses)
}

export async function replaceTachyonClasses() {
  const files = db.getFilesContainingTachyonClasses()
  for (const file of files) {
    console.log('file: ' + file)
    const text = await Bun.file(file).text()
    let safeText = encodeStringSymbolsInComments(text)
    safeText = safeText.replace(findStringsRegEx, (match) => {
      const stringDelimiter = match[0]
      const string = match.substring(1, match.length - 1)
      const newString = replaceTachyonClassesWithTailwindClassesInString(string)
      return `${stringDelimiter}${newString}${stringDelimiter}`
    })
    const finalText = decodeStringSymbolsInComments(safeText)
    await Bun.write(file + '.new', finalText)
  }
}

export function replaceTachyonClassesWithTailwindClassesInString(
  str: string,
): string {
  const regex = findStringsRegEx // Make sure this regex matches correctly
  const mapping = db.getAllMappedTachyonClassesAsMap()

  const newString = str.replace(findStringsRegEx, (match) => {
    const stringDelimiter = match[0]
    const string = match.substring(1, match.length - 1)
    const newString = replaceTachyonClassesWithTailwindClassesInString(string)
    return `${stringDelimiter}${newString}${stringDelimiter}`
  })

  const words = newString.split(' ')

  let replaceCount = 0
  const mappedString = words
    .map((word) => {
      if (mapping.has(word)) {
        replaceCount++
        return mapping.get(word)
      }
      return word
    })
    .join(' ')

  // Don't replace if we found less tachyon classes than other "words"
  if (replaceCount > 0) {
    const balance = replaceCount - (words.length - replaceCount)
    // If the balance is negative, we have found less tachyon classes than other "words"
    if (balance < 0) {
      console.log('Suspected false positive.')
      console.log('Original: "' + str + '"')
      console.log('New    : "' + mappedString + '"')
      return str
    }
  }

  return mappedString
}

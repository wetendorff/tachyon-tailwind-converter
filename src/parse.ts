import config from '../config'
import db from './database'
import { removeNewLines, tachyonClassRegEx } from './strings'
import { parseText } from './textParser'
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

/**
 * Parses the given file for Tachyon classes and marks them as used in the database.
 * @param file - The path to the file to parse.
 * @returns A Promise that resolves when the file has been parsed and all Tachyon classes have been marked as used in the database.
 */
export async function fileCallback(file: string) {
  let text = await Bun.file(file).text()

  // Find all strings in the file
  const { strings } = parseText(text)

  // Find all tachyon classes in the strings
  const tachyonClasses = new Set<string>()
  strings.forEach((str) => {
    const stringWithoutDelimiter = str.content.slice(str.start + 1, str.end - 1)
    const result = parseStringForTachyonClasses(stringWithoutDelimiter)
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

/**
 * Parses a string and returns an array of Tachyon classes found in the string.
 * @param str - The string to parse for Tachyon classes.
 * @returns An array of Tachyon classes found in the string.
 */
export function parseStringForTachyonClasses(str: string): string[] {
  const tachyonSet = db.getTachyonClassesAsSet()
  const tachyonClasses: Set<string> = new Set()

  const words = str.split(' ')
  words.forEach((word) => {
    if (tachyonSet.has(word)) {
      tachyonClasses.add(word)
    }
  })
  return Array.from(tachyonClasses)
}

/**
 * Replaces Tachyon classes in all files containing them.
 * @returns {Promise<void>}
 */
export async function replaceTachyonClasses() {
  // get a list of files that contain Tachyon classes
  const files = db.getFilesContainingTachyonClasses()

  // for each file, replace the Tachyon classes
  for (const file of files) {
    console.log('file: ' + file)
    let text = await Bun.file(file).text()
    text = replaceTachyonClassesInText(text)
    await Bun.write(file + '.new', text)
  }
}

/**
 * Replaces Tachyon classes in a given text with their equivalent Tailwind classes.
 * @param text - The text to replace Tachyon classes in.
 * @returns The text with Tachyon classes replaced with their equivalent Tailwind classes.
 */
export function replaceTachyonClassesInText(text: string) {
  const { strings } = parseText(text)

  // keep track of the last position we saw
  let lastEnd = 0

  // keep track of the result of the replacement
  const result: string[] = []

  // loop through the strings, replacing the classes in each
  strings.forEach((str) => {
    // push the text from the last position to the start of the string
    result.push(text.slice(lastEnd, str.start))

    // push the string with the classes replaced
    const stringDelimiter = str.content[0]
    const stringWithoutDelimiter = text.slice(str.start + 1, str.end - 1)
    const mappedString = replaceTachyonClassesWithTailwindClassesInString(
      stringWithoutDelimiter,
    )
    result.push(stringDelimiter + mappedString + stringDelimiter)

    // update the last position
    lastEnd = str.end
  })

  // append the text after all replacements
  result.push(text.slice(lastEnd))
  return result.join('')
}

/**
 * Replaces all Tachyon classes in a string with their corresponding Tailwind classes.
 *
 * @param str - The string to replace Tachyon classes in.
 * @returns The string with all Tachyon classes replaced with their corresponding Tailwind classes.
 */
export function replaceTachyonClassesWithTailwindClassesInString(
  str: string,
): string {
  const mapping = db.getAllMappedTachyonClassesAsMap()

  let replaceCount = 0
  const words = str.split(' ')
  const mappedString = words
    .map((word) => {
      // if the word is a tachyon class, replace it with the mapped value
      if (mapping.has(word)) {
        replaceCount++
        return mapping.get(word) // Replace with the mapped value (tailwind class)
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

export function testParser(text: string) {
  const { strings, comments } = parseText(text)

  let last = 9999999

  for (let i = strings.length - 1; i >= 0; i--) {
    const str = strings[i]
    console.log(str.end + (str.end >= last ? ' ERROR' : ''))
  }

  console.log('strings', strings)
  console.log('comments', comments)
}

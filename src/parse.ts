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

export async function fileCallback(file: string) {
  let text = await Bun.file(file).text()

  const { strings } = parseText(text)

  const tachyonClasses = new Set<string>()
  strings.forEach((str) => {
    const result = parseStringForTachyonClasses(str.content)
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

export async function replaceTachyonClasses() {
  const files = db.getFilesContainingTachyonClasses()
  for (const file of files) {
    console.log('file: ' + file)
    let text = await Bun.file(file).text()
    text = replaceTachyonClassesInText(text)
    await Bun.write(file + '.new', text)
  }
}

export function replaceTachyonClassesInText(text: string) {
  const { strings } = parseText(text)
  let lastEnd = 0
  const result: string[] = []
  strings.forEach((str) => {
    result.push(text.slice(lastEnd, str.start))
    const stringDelimiter = str.content[0]
    const stringWithoutDelimiter = text.slice(str.start + 1, str.end - 1)
    const mappedString = replaceTachyonClassesWithTailwindClassesInString(
      stringWithoutDelimiter,
    )
    result.push(stringDelimiter + mappedString + stringDelimiter)
    lastEnd = str.end
  })
  // Append the text after all replacements
  result.push(text.slice(lastEnd))
  return result.join('')
}

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

  // console.log('strings', strings)
  // console.log('comments', comments)
}

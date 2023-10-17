import config from '../config'
import db from './db'
import { removeNewLines } from './strings'
import { traverseDirectory } from './traverseDir'

/**
 * Parses a Tachyon CSS file and creates or updates Tachyon classes in the database.
 * @param path - The path to the Tachyon CSS file.
 */
export async function parseTachyonCSSFile(path: string) {
  const file = Bun.file(path)
  const content = await file.text()

  // Regex match: "".[tachyonClassName] { [tachyonClassDefinition] }"
  const regex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g
  let match
  while ((match = regex.exec(content))) {
    const tachyon = match[1]
    const css = removeNewLines(match[2]).trim()
    db.createOrUpdateTachyon(tachyon, css)
  }
}

/**
 * Finds all used Tachyon classes in files recersive in the source directory.
 */
export function findAllUsedTachyonClasses() {
  const dir = config.sourceDirectory
  traverseDirectory(dir, fileCallback)
}

async function fileCallback(file: string) {
  console.log('Found file:', file)
  const text = await Bun.file(file).text()

  // Filter out all strings that are not containing a Tachyon class
  const tachyonSet = db.getTachyonClassesAsSet()
  const strings = parseTextForStrings(text)
  const filteredString = strings.filter((str) => {
    const words = str.split(' ')
    const tachyonClasses = words.filter((word) => tachyonSet.has(word))

    if (tachyonClasses.length > 0) {
      if (str.length > 200) {
        console.log(
          'Warning: Found tachyons classes in string with length > 200:',
          file,
        )
      }
      // console.log(
      //   'Found Tachyon classes in :',
      //   file,
      //   'String:',
      //   str,
      //   tachyonClasses.length === 1 ? 'WARNING!' : '',
      // )
      return true
    }
  })

  // if (filteredString.length)
  //   console.log('Found strings containing tachyon classes in file:', file)
  // filteredString.forEach((str) => {
  //   console.log(`Found string with tachyon classes: "${str}"`)
  // })

  // Mark all found tachyon classes as used and connect it with the current file
  filteredString.forEach((str) => {
    const words = str.split(' ')
    const tachyonClasses = words.filter((word) => tachyonSet.has(word))
    tachyonClasses.forEach((tachyon) => {
      const tachyonId = db.markTachyonClassAsUsed(tachyon)
      db.createOrUpdateFile(file, tachyonId)
    })
  })
}

export function parseTextForStrings(text: string) {
  // Remove all single-line comments
  text = text.replace(/^\s*(\/\/|#).*$/gm, '')

  // Remove all multi-line comments
  text = text.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//gm, '')

  // Find all strings
  const regex = /`([^`]*)`|"([^"]*)"|'([^']*)'/gm
  const foundStrings: string[] = []

  let match
  while ((match = regex.exec(text))) {
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        foundStrings.push(match[i])
      }
    }
  }
  return foundStrings
}

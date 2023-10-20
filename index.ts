import config from './config'
import db from './src/database'
import { backupToFile, restoreFromFile } from './src/backup'
import {
  findAllUsedTachyonClasses,
  parseTachyonCSSFile,
  parseTextForStrings,
  replaceTachyonClasses,
  testParser,
} from './src/parse'
import { question } from './src/strings'

type Command = 'reset' | 'backup' | 'restore' | 'parse' | 'replace' | 'debug'

let commands: Record<Command, () => void | Promise<void>> = {
  /**
   * Resets the database after prompting the user for confirmation.
   */
  async reset() {
    const reset = await question(
      'Are you sure you want to reset the database? (y/N)?',
    )
    if (!reset) {
      console.log('Aborted')
      return
    }

    console.log('Reset Database...')
    db.reset()
  },

  backup() {
    console.log(`Backup mapping to: ${config.backupFile}`)
    backupToFile(config.backupFile)
  },

  async restore() {
    console.log(`Restore mapping from: ${config.backupFile}`)
    await restoreFromFile(config.backupFile)
  },

  async parse() {
    console.log(
      'Parsing Tachyon CSS file and finding all used Tachyon classes in source directory',
    )
    db.init()
    await parseTachyonCSSFile(config.tachyonFile)
    await findAllUsedTachyonClasses()
  },

  async replace(): Promise<void> {
    console.log('Replace Tachyon classes with Tailwind classes')
    const notMapped = db.getNotMappedTailwindClasses()
    if (notMapped.length > 0) {
      console.log('Not mapped Tailwind classes:')
      console.log(notMapped)
      console.log('Aborted')
      return
    }
    await replaceTachyonClasses()
  },

  async debug() {
    const file = Bun.file('test.txt')
    const text = await file.text()
    testParser(text)
  },
}

const command = process.argv[2] as Command
if (commands[command]) {
  console.time('time')
  await commands[command]()
  console.timeEnd('time')
  console.log('Done!')
} else {
  console.log(
    `The command '${command}' does not exist. Available commands: reset, backup, show`,
  )
}

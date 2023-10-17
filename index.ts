import config from './config'
import db from './src/db'
import { saveMappingAsJson } from './src/mapping'
import { findAllUsedTachyonClasses, parseTachyonCSSFile } from './src/parse'

type Command = 'reset' | 'backup' | 'parse'

let commands: Record<Command, () => void | Promise<void>> = {
  reset() {
    console.log('Reset Database')
    db.reset()
  },

  backup() {
    console.log('Backup mapping to mapping.json')
    saveMappingAsJson()
  },

  async parse() {
    console.log(
      'Parsing Tachyon CSS file and finding all used Tachyon classes in source directory',
    )
    db.init()
    await parseTachyonCSSFile(config.tachyonFile)
    findAllUsedTachyonClasses()
  },
}

const command = process.argv[2] as Command
if (commands[command]) {
  console.time()
  await commands[command]()
  console.timeEnd()
  console.log('Done!')
} else {
  console.log(
    `The command '${command}' does not exist. Available commands: reset, backup, show`,
  )
}

// TODO If all tailwind mappings has been made, then go through all files containing Tachyon classes and replace them with Tailwind classes

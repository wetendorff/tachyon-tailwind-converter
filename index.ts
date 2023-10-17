import config from './config'
import db from './src/db'
import { saveMappingAsJson } from './src/mapping'
import { findAllUsedTachyonClasses, parseTachyonCSSFile } from './src/parse'
import readline from 'readline'

type Command = 'reset' | 'backup' | 'parse'

async function question(question: string, callback: (answer: string) => void) {
  process.stdout.write(question)
  for await (const answer of console) {
    callback(answer)
    break
  }
}

let commands: Record<Command, () => void | Promise<void>> = {
  async reset() {
    await question(
      'Are you sure you want to reset the database? (y/N)? ',
      (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('Reset Database...')
          db.reset()
        } else {
          console.log('Aborted')
        }
      },
    )
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
  console.time('time')
  await commands[command]()
  console.timeEnd('time')
  console.log('Done!')
} else {
  console.log(
    `The command '${command}' does not exist. Available commands: reset, backup, show`,
  )
}

// TODO If all tailwind mappings has been made, then go through all files containing Tachyon classes and replace them with Tailwind classes

import db from './database'

/**
 * Writes a backup of all mapped Tachyon classes to a file at the specified filepath.
 * @param filepath - The path to the file to write the backup to.
 */
export function backupToFile(filepath: string) {
  const file = Bun.file(filepath)
  const writer = file.writer()
  const mappedTachyons = db.getAllMappedTachyonClasses()

  writer.write('{\n')
  mappedTachyons.forEach((tachyon, index) => {
    const isLastLine = index === mappedTachyons.length - 1
    const lineEnding = isLastLine ? '\n' : ',\n'
    writer.write(
      `  "${tachyon.tachyon}": { "tailwind": "${tachyon.tailwind}", "css": "${tachyon.css}" }${lineEnding}`,
    )
  })
  writer.write('}\n')
  writer.end()
}

/**
 * Restores a backup of mapped Tachyon classes from a file at the specified filepath.
 * @param filepath - The path to the file to restore the backup from.
 */
export async function restoreFromFile(path: string) {
  const file = Bun.file(path)
  const json = await file.json()
  const tachyons = Object.keys(json)
  tachyons.forEach((tachyonClassName) => {
    const mapping = json[tachyonClassName] as { tailwind: string; css: string }
    db.createOrUpdateTachyon(tachyonClassName, mapping.css, mapping.tailwind)
  })
}

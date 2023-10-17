import db from './db'

export function saveMappingAsJson() {
  const file = Bun.file('mapping.json')
  const writer = file.writer()

  writer.write('{\n')
  db.getAllMappedTachyonClasses().forEach((tachyon) => {
    writer.write(`  "${tachyon.tachyon}": "${tachyon.tailwind}",\n`)
  })
  writer.write('}\n')
  writer.end()
}

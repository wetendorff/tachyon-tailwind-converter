import fs from 'fs'
import path from 'path'
import config from '../config'

export function traverseDirectory(
  dir: string,
  callback: (file: string) => void,
) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const fileStat = fs.statSync(filePath)

    // If file is a directory that is in the ingoreDirectories list, then ignore it and return
    if (fileStat.isDirectory() && config.ignoreDirectories.includes(file)) {
      return
    }

    // If file is a directory, then traverse it
    if (fileStat.isDirectory()) {
      traverseDirectory(filePath, callback)
      return
    }

    // We got a file, ignore it if it not of the correct file extension
    const fileExtension = path.extname(filePath)
    if (!config.fileExtensions.includes(fileExtension)) {
      return
    }

    // We got a file, so call the callback function
    callback(filePath)
  })
}

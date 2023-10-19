import fs from 'fs'
import path from 'path'
import config from '../config'

/**
 * Traverses a directory recursively and calls a callback function for each file that matches the specified file extensions.
 *
 * @param dir - The directory to traverse.
 * @param callback - The callback function to call for each file that matches the specified file extensions.
 * @returns A Promise that resolves when all files have been processed.
 */
export async function traverseDirectory(
  dir: string,
  callback: (file: string) => Promise<void>,
) {
  try {
    const files = fs.readdirSync(dir)

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file)
        const fileStat = fs.statSync(filePath)

        // if file is a directory that is in the ingoreDirectories list, then ignore it and return
        if (fileStat.isDirectory() && config.ignoreDirectories.includes(file)) {
          return
        }

        // if file is a directory, then traverse it
        if (fileStat.isDirectory()) {
          await traverseDirectory(filePath, callback)
          return
        }

        // we got a file, ignore it if it not of the correct file extension
        const fileExtension = path.extname(filePath)
        if (!config.fileExtensions.includes(fileExtension)) {
          return
        }

        // we got a file, so call the callback function
        await callback(filePath)
      }),
    )
  } catch (err) {
    console.error(err)
  }
}

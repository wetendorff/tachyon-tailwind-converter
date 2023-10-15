import fs from "fs";
import path from "path";
import { parseText } from "./strings";

function traverseDirectory(dir, ignoreDirectories, fileExtensions, wordMap) {
  const dirName = path.basename(dir);

  if (ignoreDirectories.includes(dirName)) {
    console.log("Ignoring directory: ", dirName);
    return;
  }

  // Read all files in the directory
  const files = getFileSync(dir);

  // Filter out files that are not of the correct file extension
  const filteredFiles = files.filter((file) => {
    const fileExtension = path.extname(file);
    return fileExtensions.includes(fileExtension);
  });

  // Read the content of each file

  const result = new Map();
  filteredFiles.forEach((file) => {
    // Get the full path of the file
    const filePath = path.join(dir, file);

    // Check if the file is a directory and if so, then traverse the directory
    if (fs.statSync(filePath).isDirectory()) {
      traverseDirectory(filePath, ignoreDirectories, fileExtensions, wordMap);
      return;
    }

    // Read the file information
    const file = Bun.file(filePath);

    // Read the file content as text
    const text = file.text();
    const foundWords = parseText(text, wordMap);

    // Add the found words to the result
    foundWords.forEach((count, word) => {
      if (!result.has(word)) {
        result.set(word, {
          word,
          count,
          files: [filePath],
        });
        return;
      }

      // If the word already exists in the result, then add the count to the existing count
      const currentValue = result.get(word);
      const currentCount = currentValue.count;
      result.set(word, {
        ...currentValue,
        count: currentCount + 1,
      });
    });
  });

  return result;
}

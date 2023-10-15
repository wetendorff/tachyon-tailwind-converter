export function getStrings(text) {
  // Remove all single-line comments
  text = text.replace(/^(\/\/|#).*$/gm, "");

  // Remove all multi-line comments
  text = text.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//gm, "");

  // Get all strings
  const regex = /`([^`]*)`|"([^"]*)"|'([^']*)'/gm;
  const foundStrings = [];

  let match;
  while ((match = regex.exec(text))) {
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        foundStrings.push(match[i]);
      }
    }
  }

  return foundStrings;
}

export function findMatchingWords(inputString, wordMap) {
  const result = new Map();
  inputString.split(" ").forEach((word) => {
    if (!wordMap.has(word)) {
      return;
    }

    if (!result.has(word)) {
      result.set(word, 1);
      return;
    }

    const count = result.get(word);
    result.set(word, count + 1);
  });
  return result;
}

export function parseText(text, wordMap) {
  // Get all strings in the text
  const strings = getStrings(text);

  // Search strings for words on positive list and add found words to result
  let result = new Map();
  strings.forEach((str) => {
    const resultMap = findMatchingWords(str, wordMap);

    resultMap.forEach((count, word) => {
      if (!result.has(word)) {
        result.set(word, count);
        return;
      }

      const currentCount = result.get(word);
      result.set(word, currentCount + count);
    });
  });

  return result;
}

export async function parseCSSFile(path) {
  const file = Bun.file(path);
  const content = await file.text();

  const regex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let match;
  let result = new Map();
  while ((match = regex.exec(content))) {
    result.set(match[1], match[2].trim());
  }
  return result;
}

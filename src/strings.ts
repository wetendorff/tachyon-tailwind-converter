// export function getStrings(text: string) {
//   // Remove all single-line comments
//   text = text.replace(/^(\/\/|#).*$/gm, "");

//   // Remove all multi-line comments
//   text = text.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//gm, "");

//   // Get all strings
//   const regex = /`([^`]*)`|"([^"]*)"|'([^']*)'/gm;
//   const foundStrings = [];

//   let match;
//   while ((match = regex.exec(text))) {
//     for (let i = 1; i < match.length; i++) {
//       if (match[i]) {
//         foundStrings.push(match[i]);
//       }
//     }
//   }

//   return foundStrings;
// }

// export function findMatchingWords(inputString: string, wordMap: any) {
//   const result = new Map();
//   inputString.split(" ").forEach((word) => {
//     if (!wordMap.has(word)) {
//       return;
//     }

//     if (!result.has(word)) {
//       result.set(word, 1);
//       return;
//     }

//     const count = result.get(word);
//     result.set(word, count + 1);
//   });
//   return result;
// }

// export function parseText(text: string, wordMap: any) {
//   // Get all strings in the text
//   const strings = getStrings(text);

//   // Search strings for words on positive list and add found words to result
//   let result = new Map();
//   strings.forEach((str) => {
//     const resultMap = findMatchingWords(str, wordMap);

//     resultMap.forEach((count, word) => {
//       if (!result.has(word)) {
//         result.set(word, count);
//         return;
//       }

//       const currentCount = result.get(word);
//       result.set(word, currentCount + count);
//     });
//   });

//   return result;
// }

export function removeNewLines(str: string) {
  return str.replace(/\r?\n|\r/g, ' ');  
}
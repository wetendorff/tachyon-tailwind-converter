export const findStringsRegEx = /`([^`]*)`|"([^"]*)"|'([^']*)'/gm

export const cStyleCommentsRegEx = /(\/\/.*| ?\/\*[^]*?\*\/)(,?)$/gm
export const htmlStyleCommentsRegEx =
  /<!--(?!-?>)(?:[^<-]|<(?!!--(?!>))|-(?!-!>))*?(?<!<!-)-->/gm
export const razorStyleCommentsRegEx = /@\*[\s\S]*?\*@/gm

export const newLineRegEx = /\r?\n|\r/g
export const tachyonClassRegEx = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g // Regex match: ".[tachyonClassName] { [tachyonClassDefinition] }"

const encodedStringSymbols = ['°', '∑', 'ª']
const decodedStringSymbols = ['"', "'", '`']

export function removeNewLines(str: string) {
  return str.replace(newLineRegEx, ' ')
}

function replaceCommentSymbols(
  comment: string,
  oldChars: string[],
  newChars: string[],
): string {
  oldChars.forEach((oldChar, index) => {
    comment = comment.replace(new RegExp('\\' + oldChar, 'g'), newChars[index])
  })
  return comment
}

export function encodeStringSymbolsInComments(text: string) {
  text = text.replace(cStyleCommentsRegEx, (match) => {
    const newString = replaceCommentSymbols(
      match,
      decodedStringSymbols,
      encodedStringSymbols,
    )
    return newString
  })

  text = text.replace(htmlStyleCommentsRegEx, (match) => {
    const newString = replaceCommentSymbols(
      match,
      decodedStringSymbols,
      encodedStringSymbols,
    )
    return newString
  })

  text = text.replace(razorStyleCommentsRegEx, (match) => {
    const newString = replaceCommentSymbols(
      match,
      decodedStringSymbols,
      encodedStringSymbols,
    )
    return newString
  })

  return text
}

export function decodeStringSymbolsInComments(text: string) {
  text = text.replace(cStyleCommentsRegEx, (match) => {
    const newString = replaceCommentSymbols(
      match,
      encodedStringSymbols,
      decodedStringSymbols,
    )
    return newString
  })

  text = text.replace(htmlStyleCommentsRegEx, (match) => {
    const newString = replaceCommentSymbols(
      match,
      encodedStringSymbols,
      decodedStringSymbols,
    )
    return newString
  })

  text = text.replace(razorStyleCommentsRegEx, (match) => {
    const newString = replaceCommentSymbols(
      match,
      encodedStringSymbols,
      decodedStringSymbols,
    )
    return newString
  })

  return text
}

// export function question(query: string) {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   })

//   return new Promise((resolve) =>
//     rl.question(query, (ans) => {
//       rl.close()
//       const answer = ans.toLowerCase()
//       if (answer === 'y' || answer === 'yes') {
//         resolve(true)
//       } else if (answer === 'n' || answer === 'no') {
//         resolve(false)
//       } else {
//         console.log('Invalid input, please enter either "y" or "n".')
//         return resolve(question(query))
//       }
//     }),
//   )
// }

export async function question(question: string) {
  console.write(question)

  for await (const line of console) {
    const answer = line.toLowerCase()
    if (line === 'y' || line === 'yes') {
      return true
    }
  }
  return false
}

export const newLineRegEx = /\r?\n|\r/g
export const tachyonClassRegEx = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g // Regex match: ".[tachyonClassName] { [tachyonClassDefinition] }"

export function removeNewLines(str: string) {
  return str.replace(newLineRegEx, ' ')
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

export type TextElement = {
  content: string
  start: number
  end: number
}

/**
 * Parses a string of text and returns an object containing an array of text elements that represent strings and an array of text elements that represent comments.
 * @param input The input string to parse.
 * @returns An object containing an array of text elements that represent strings and an array of text elements that represent comments.
 */
export function parseText(input: string): {
  strings: TextElement[]
  comments: TextElement[]
} {
  const strings: TextElement[] = []
  const comments: TextElement[] = []

  // Detectors
  const stringChars = ['"', "'", '`']
  let inString = false
  let inComment = false
  let commentStyle = ''
  let currentStringChar = ''
  let startIndex = -1

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const nextChar = input[i + 1]
    const nextTwoChars = input.substring(i, i + 2)

    if (!inString && !inComment) {
      if (stringChars.includes(char)) {
        inString = true
        currentStringChar = char
        startIndex = i
      } else if (char === '/' && nextChar === '*') {
        inComment = true
        commentStyle = 'cstyle'
        startIndex = i
        i++ // Skip next char
      } else if (char === '@' && nextTwoChars === '@*') {
        inComment = true
        commentStyle = 'razor'
        startIndex = i
        i += 2 // Skip next two chars
      } else if (i < input.length - 4 && input.substr(i, 4) === '<!--') {
        inComment = true
        commentStyle = 'html'
        startIndex = i
        i += 3 // Skip next 3 chars
      } else if (char === '/' && nextChar === '/') {
        inComment = true
        commentStyle = 'singleline'
        startIndex = i
        i++ // Skip next char
      }
    } else if (inString) {
      if (char === currentStringChar) {
        inString = false
        strings.push({
          content: input.substring(startIndex, i + 1),
          start: startIndex,
          end: i + 1,
        })
        currentStringChar = ''
      }
    } else if (inComment) {
      let endDetected = false

      if (commentStyle === 'cstyle' && char === '*' && nextChar === '/') {
        endDetected = true
        i += 2
      } else if (commentStyle === 'razor' && char === '*' && nextChar === '@') {
        endDetected = true
        i += 2
      } else if (
        commentStyle === 'html' &&
        i < input.length - 3 &&
        input.substring(i, i + 3) === '-->'
      ) {
        endDetected = true
        i += 2 // skip next 2 '-->'
      } else if (
        commentStyle === 'singleline' &&
        (char === '\n' || char === '\r')
      ) {
        endDetected = true
      }

      if (endDetected) {
        inComment = false
        comments.push({
          content: input.substring(startIndex, i),
          start: startIndex,
          end: i,
        })
        commentStyle = ''
      } else if (i === input.length - 1) {
        // If the comment is at end of text
        comments.push({
          content: input.substring(startIndex, i + 1),
          start: startIndex,
          end: i + 1,
        })
      }
    }
  }

  return { strings, comments }
}

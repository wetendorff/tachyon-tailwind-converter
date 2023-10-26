// Configuration
const tachyonFile =
  '/Users/lars/Projects/hejdoktor/Web/Hejdoktor.Web/Client/css/tachyons.css'
const sourceDirectory = '/Users/lars/Projects/symptom-checker'
const ignoreDirectories = ['node_modules', 'tests', 'scripts', '.vscode']
const fileExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.cs',
  '.cshtml',
  '.vue',
]
const backupFile = 'mapping.json'

export default {
  tachyonFile,
  sourceDirectory,
  ignoreDirectories,
  fileExtensions,
  backupFile,
}

import { parseCSSFile } from "./src/strings";

const tachyonFile = "example.css";
const sourceDirectory = "src";
const ignoreDirectories = ["node_modules", "dist"];
const fileExtensions = [".js", ".jsx", ".ts", ".tsx"];

// 1. Read and Parse CSS file for all Tachyon classes
const allTachyonClasses = await parseCSSFile(tachyonFile);

// 2. Traverse all files in the project and find all files containing Tachyon classes
const result = traverseDirectory(
  sourceDirectory,
  ignoreDirectories,
  fileExtensions,
  allTachyonClasses
);

// 3. Save or merge the result as an mapping json file

// 4. If all tailwind mappings has been made, then go through all files containing Tachyon classes and replace them with Tailwind classes

const file = Bun.file("example.txt");
const content = await file.text();

// const tachyonClasses = new Map([
//   ["w0", null],
//   ["h-100", null],
//   ["p1", null],
//   ["p2", null],
//   ["p3", null],
//
// ]);

let arrayOfObjects = Array.from(result, ([key, value]) => ({ key, value }));
console.table(arrayOfObjects);

// const result = parseText(content, tachyonClasses);

// console.dir(result);

// const resultat = {
//   tachyonClassName: "w0",
//   tachyonClassDefinition: "width: 0px;",
//   tailwindClassName: "w-0",
//   files: [
//     { path: "src/strings.js", count: 1 },
//     { path: "src/index.js", count: 1 },
//   ],
//   count: 2,
// }

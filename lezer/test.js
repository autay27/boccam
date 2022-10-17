import { parser } from "./occam.js";

import * as fs from 'fs';

const filename = "../program.occ"

let file = fs.readFileSync(filename, 'utf-8')

let tree = parser.parse(file)

let cursor = tree.cursor()
do {
  console.log(`Node ${cursor.name} from ${cursor.from} to ${cursor.to}`)
} while (cursor.next())
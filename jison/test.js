//var parser = require("./occam").parser;

import { parser } from "./occam.js"

import * as fs from 'fs';

const filename = "../program.occ"

let file = fs.readFileSync(filename, 'utf-8')

function exec (input) {
  return parser.parse(input);
}

exec(file);
//import * as fs from 'node:fs';
//import { parse } from  "../jison/occam.js"; 

const fs = require('fs');
const occam = require("../jison/occam").parser;

const testfilepath = "/home/august/boccam/test/parsefiles/"
var files = fs.readdirSync(testfilepath);

for (const f of files) {
    console.log(f)
    console.log("    " + testParsing(f))
    console.log("")
}

function testParsing (filename) {

    const file = fs.readFileSync(testfilepath + filename, 'utf-8')
    const asserts = file.split("---")[1].split('\n')
    const code = file.split("---")[2] + " "

    var output = "SUCCESS"

    try {
        occam.parse(code);
    } catch (e) {
            try {
                output = "Parsing Error: " + e.toString();
            } catch (e2) {
                throw e
            }
    }

    if (asserts.includes("parse: true")) {
        if (output != "SUCCESS") {
            output = "TEST FAILED: Successful parse expected, got " + output
        }
    } else {
        if (output == "SUCCESS") {
            output = "TEST FAILED: Failed parse expected"
        }
    }

    return output
}
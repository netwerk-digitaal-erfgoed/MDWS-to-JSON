#!/usr/bin/env node
const fs = require('fs');
const detectCharacterEncoding = require('detect-character-encoding');
const buf = fs.readFileSync(process.argv[2]);
const charset = detectCharacterEncoding(buf);
 
console.log(process.argv[2]+"\t"+charset.encoding+"\t"+charset.confidence);
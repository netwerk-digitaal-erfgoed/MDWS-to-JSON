#!/usr/bin/env node
//usage: $ ./index.js INPUT.txt
const fs = require('fs');
const readline = require('readline');
const csv = require('csv-parse/lib/sync')
const filename = process.argv[2];
if (!filename) return console.log('usage: ./index.js input_file.txt');
if (!fs.existsSync(filename)) return console.log('File not found: ' + filename);

var item,itemIndex=0,items=[],prevKey;
var separator = "(1) = ";
var soorten = csv(fs.readFileSync(__dirname + "/archiefeenheidsoorten.csv"))

var lineReader = readline.createInterface({
  input: fs.createReadStream(filename, {encoding: "latin1"})
});

console.log('[');
lineReader.on('line', function (str) {
    
    if (!item && str=="") return console.warn("empty line(s) at the beginning");
    
    var r,key,val,aetID,aetCode,code;

    //extract key and value
    r = /^(.*)\(1\)\s=\s(.*)/.exec(str);
    key = r ? r[1] : null;
    val = r ? r[2] : null;

    //get aet
    r = /\s\[aet_id=(\d+)\]/.exec(val);
    aetID = r ? r[1] :  null;
    aetCode = aetID ? soorten.find(o => o[2] == aetID)[0].toLowerCase() : null;

    //use aetCode or default to abk
    if (key=="%0") key = aetCode ? aetCode : "abk";

    //skip items with unkown type at the top
    if (!item && key && !soorten.find(o => o[0].toLowerCase() == key)) return console.warn("Warning: Skip unknown type at start",str);

    //multi-line value
    else if (item && !key) updateItem(prevKey,str); //multi-line

    //key is an existing type, so start a new item
    else if (soorten.find(o => o[0].toLowerCase() == key)) nextItem(key,val);

    //update the current item
    else updateItem(key,val);
});

lineReader.on('close', function (line) {
  if (item) saveItem();
  console.log(']');
});

function nextItem(key,val) {
  // console.warn("nextitem",key,val)
  if (item) saveItem(); //save if there's currently an item being parsed (not header)
  item = { aet: key } //, recordID: parseInt(val) }; //create a new item
  updateItem(key,val); //add identifier such as ft=123 or krt=5
}

function saveItem() {
    /// check here for unexpected results: for example two GUIDS
    if (!item) console.error("Error: Skip saveItem because item is undefined");
    else if (!item["GUID"]) console.error("Error: Skip saveItem because item has no GUID, id="+item.id);
    else if (Array.isArray(item["GUID"])) console.error("Error: Skip saveItem because item has multiple GUIDs. This might indicate an unknown aetCode - ",item,Object.keys(item));
    else {
      if (itemIndex++>0) console.log(",");
      console.log(JSON.stringify(item,null,4));
    }
}

function updateItem(key,val) {
    if (!item) return console.error("Error: Skip updateItem because item is undefined: ",key,val);
    var value = val.trim();
    if (key=="guid") key="GUID"; //always write GUID in uppercase
    
    if (key==item.aet && val) item.code = val;
    else if (item && val) {
        if (!item[key]) item[key] = value; //store single item
        else {
          if (!Array.isArray(item[key])) item[key] = [ item[key] ]; //convert to array when key already exists
          item[key].push(value);
        } 
    }
    prevKey = key;
}

function die(a,b,c,d,e) {
    console.error(a,b,c,d,e);
    process.exit(1);
}


#!/usr/bin/env node
//usage: $ ./index.js INPUT.txt
const fs = require('fs');
const readline = require('readline');
const csv = require('csv-parse/lib/sync')
const filename = process.argv[2];
if (!filename) return console.error('usage: ./index.js input_file.txt');
if (!fs.existsSync(filename)) return console.error('File not found: ' + filename);

var item,itemIndex=0,items=[],prevKey;
var separator = "(1) = ";
var soorten = csv(fs.readFileSync(__dirname + "/archiefeenheidsoorten.csv"))

var lineReader = readline.createInterface({
  input: fs.createReadStream(filename, {encoding: "latin1"})
});

console.log('[');
lineReader.on('line', function (str) {
    
    var r,key,val,aetID,aetCode,code;

    //extract key and value
    r = /^(.*)\(1\)\s=\s(.*)/.exec(str);
    key = r ? r[1] : null;
    val = r ? r[2] : null;

    //get aet
    r = /\s\[aet_id=(\d+)\]/.exec(val);
    aetID = r ? r[1] :  null;
    aetCode = aetID ? soorten.find(o => o[2] == aetID)[0].toLowerCase() : null;

    
    //detect empty line to solve issue #3
    if (str=="") { 
      console.warn("Warning: empty line, creating new empty item"); //mogelijk een VABK (verzameltoegang)
      nextItem();
    }

    //use aetCode or default to abk
    else if (key=="%0") {
      key = aetCode ? aetCode : "abk";
      nextItem(key,val);
    }

    //found extra (not the same) GUID -> create new item as fix
    else if (item && item["GUID"] && key && key.toUpperCase()=="GUID" && item["GUID"]!=val) {
      console.warn("Warning: found extra and different GUID in same item. Creating new item",val);
      nextItem();
      updateItem("GUID",val);
    }

    //skip items with unkown type at the top
    else if (!item && key && !soorten.find(o => o[0].toLowerCase() == key)) return console.warn("Warning: Skip unknown type at start",str);

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
  if (item) saveItem(); //save if there's currently an item being parsed (not header)
  item = {}; //create a new item
  if (key) item.aet = key; //don't add empty aet's caused by issue #3
  updateItem(key,val); //add identifier such as ft=123 or krt=5
}

function saveItem() {
    /// check here for unexpected results: for example two GUIDS

    //soms zit dezelfde GUID 2x in de uitvoer van een record: ontdubbel
    //deze check kan nu weg aangezien in updateItem dubbele key=value pairs worden ontdubbelt.
    // if (Array.isArray(item["GUID"]) && item["GUID"].length==2 && item["GUID"][0]==item["GUID"][1]) {
    //   item["GUID"] = item["GUID"][0];
    // }

    if (!item) console.error("Error: Skip saveItem because item is undefined");
    else if (Array.isArray(item["GUID"])) console.error("Error: Skip saveItem because item has multiple GUIDs. This might indicate an unknown aetCode - ",item,Object.keys(item));
    else {
      if (itemIndex++>0) console.log(",");
      console.log(JSON.stringify(item,null,4));
    }
}

function updateItem(key,val) {
  if (key==undefined) return console.error("Error: Skip updateItem: key undefined");
  if (val==undefined) return console.error("Error: Skip updateItem: value undefined")
  if (item==undefined) return console.error("Error: Skip updateItem: item is undefined: ",key,val);

  // var value = val.trim();
  if (key=="guid") key="GUID"; //always write GUID in uppercase
  
  if (key==item.aet && val) item.code = val;
  else if (item && val) {
      if (!item[key]) item[key] = val; //store single item
      else if (item[key]==val) console.warn("Warning: ignoring second occurence of",key,"=",val); // ignore second occurence of key value pair. issue #9
      else {
        if (!Array.isArray(item[key])) item[key] = [ item[key] ]; //convert to array when key already exists
        item[key].push(val);
      } 
  }
  prevKey = key;
}

function die(a,b,c,d,e) {
    console.error(a,b,c,d,e);
    process.exit(1);
}


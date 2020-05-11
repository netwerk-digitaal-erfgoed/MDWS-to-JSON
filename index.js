#!/usr/bin/env node
//usage: $ ./index.js INPUT.txt

const fs = require('fs');
const iconv = require('iconv-lite');
const readline = require('readline');
const csv = require('csv-parse/lib/sync')
const filename = process.argv[2];
if (!filename) return console.error('usage: ./index.js input_file.txt');
if (!fs.existsSync(filename)) return console.error('File not found: ' + filename);

var GUIDsById = []; //lookup table for parents
var item,itemIndex=0,items=[],prevKey,prevItem;
var separator = "(1) = ";
var soorten = csv(fs.readFileSync(__dirname + "/archiefeenheidsoorten.csv"))

//detect character encoding
const detectCharacterEncoding = require('detect-character-encoding');
var encoding = detectCharacterEncoding(fs.readFileSync(filename)).encoding;
// if (encoding=="windows-1252") encoding = "win1251";
// else if (encoding=="ISO-8859-1") encoding = "iso-8859-1";
// else return console.error("Unsupported character encoding",encoding);

var lineReader = readline.createInterface({ 
  input: fs.createReadStream(filename)
    .pipe(iconv.decodeStream(encoding))
    .pipe(iconv.encodeStream('utf-8'))
});


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
    else {
      updateItem(key,val);
    }

});

lineReader.on('close', function (line) {
  if (item) saveItem();
  if (itemIndex>0) console.log(']');
});

function nextItem(key,val) {
  if (item) saveItem(); //save if there's currently an item being parsed (not header)
  item = {}; //create a new item
  if (key) item.aet = key; //don't add empty aet's caused by issue #3
  updateItem(key,val); //add identifier such as ft=123 or krt=5
}

function saveItem() {
  if (!item) return console.error("Error: Skip saveItem because item is undefined");
  if (!item.GUID) return console.error("Error: Skip saveItem because item has no GUID",item); //item.id ? "(id="+item.id+")" : item);

  // else if (Array.isArray(item["GUID"])) return console.error("Error: Skip saveItem because item has multiple (different) GUIDs. This might indicate an unknown aetCode - ",item,Object.keys(item));

  GUIDsById[item.id] = item.GUID; //save this item's GUID in a lookup table for matching with child items

  if (item.ahd_id) {
    if (GUIDsById[item.ahd_id]) item.parentItem = GUIDsById[item.ahd_id];
    else console.warn("Warning: Unknown parent for item",item.GUID,"ahd_id",item.ahd_id,"not found");
  }

  delete item["id"];
  delete item["ahd_id"];
  delete item["FNC_DTM"];
  delete item["Moveup"];
  delete item["MoveEventTo"];
  delete item["Eventdate"];
  delete item["Eventlocation"];

  if (prevItem && item.parentItem && prevItem.parentItem  == item.parentItem && prevItem.GUID && !item["previousItem"]) {
    updateItem("previousItem", prevItem.GUID);
  }

  console.log(itemIndex++>0 ? "," : "[");
  console.log(JSON.stringify(item,null,4));

  prevItem = item;
}

function updateItem(key,val) {
  if (key==undefined) return console.error("Error: Skip updateItem: key undefined, value="+val);
  if (val==undefined) return console.error("Error: Skip updateItem: value undefined, key="+key);
  if (item==undefined) return console.error("Error: Skip updateItem: item is undefined: ",key,val);

  // var value = val.trim(); //check if this is safe to remove.
  if (key=="guid") key="GUID"; //always write GUID in uppercase
  
  if (key==item.aet && val) item.code = val.replace(/\[FASTUPLOAD\]\s|\[MODE=UPDATE2\]|\s\[aet_id=\d*\]/g,""); 
  else if (item && val) {
      if (!item[key]) item[key] = val; //store single item
      else if (item[key]==val || (Array.isArray(item[key]) && item[key].indexOf(val)>-1)) console.warn("Warning: ignoring second occurence of",key,"=",val,"for",item.GUID || item.id); // ignore second occurence of key value pair. issue #9
      else {
        if (!Array.isArray(item[key])) item[key] = [ item[key] ]; //convert to array when key already exists
        item[key].push(val);
      } 
  }
  prevKey = key;
}

#!/usr/bin/env node
//usage: $ ./index.js INPUT.txt
const fs = require('fs');
const readline = require('readline')
const filename = process.argv[2];
if (!filename) return console.log('usage: ./index.js input_file.txt');
if (!fs.existsSync(filename)) return console.log('File not found: ' + filename);

var item,items=[],line,i=0,prevKey;
var separator = "(1) = ";
var allTypes = ["%0","vafb","winverl","adrs","aff","afk","afkb","avit","ambr","abk2","ads","abk","avrf","avr","avrp","aov","art","boekart","tsart","semtattr","aud","adab","audittr","bkt","bgin","bhmd","behtyp","bstk","bstpln","bcs","bidp","bm","bozk","boek","boekf","bdpn","bbrf","bd","btek","bouwverg","brf","brfh","bvg","cdev","categ","cm","col","rfco","dagb","db","digibest","digidoc","digimap","digiontv","dpm","dpin","dos","doss","dummy","aktve","ebr","ecpd","eb","akterk","fwpn","film","ff","fmat","ft","fotom","fncr","fob","geb","gdt","gelband","gf","gdop","genbr","grak","grvak","scnni","grsl","hwv","hsk","huw","ib","ill","ipob","ipot","inio","iiral","iirvo","inis","intvw","inv","krt","km","kdart","kdeig","kdad","kvg","krant","krtp","lic","insldmt","lst","lici","lozverg","mvs","meta","mf","milverg","mnmnt","mnt","nwg","nt","ntni","notakt","not","objt","obja","objafb","octv","ogvg","otreg","ozgs","ozgbes","ozgozt","ozghsk","ozglnk","ozgops","ozgth","ozgtr","ozgtst","digiarch","digiontvls","ordon","ove","ovevk","pgblr","pibr","pmz","pin","pgpsr","pgpr","pipr","pgpb","pft","pap","pgf","vw_prm","vwdef_par","vwmdl_prm","pglst","pen","perc","pdos","psa","pbelr","pbr","piib","piit","psms","psm","pnna","pior","pspsr","pspr","pepr","pspb","psnpd","piral","pirvo","piwm","psv","psafb","poib","pb","pskrt","pzgl","prent","pbk","pd","proj","prac","prbt","prps","rks","reg","rvwm","rmp","rub","scn","scnt","scat","smld","shsrt","bhst","btgn","sa","selreg","semtag","srafb","sboek","stijd","siso","esjb","sloopdos","vw_stp","vwmdl_stp","strn","skz","tbstr","ttek","tng","tst","ts","semtatval","trck","twin","udc","c_uitvrm","verg","vdr","vwk","vwdef_stp","vwmdl","vwkarch","zie","vb","vdb","vid","vngrub","von","vw","wrkst","wksttm","wnkrt","zgl","inl"]

var lineReader = readline.createInterface({
  input: fs.createReadStream(filename, {encoding: "latin1"})
});

console.log('[');
lineReader.on('line', function (str) {
    const key = str.substr(0,str.indexOf(separator));
    const val = str.substr(str.indexOf(separator)+separator.length);

    if (key=="") updateItem(prevKey,str); //multi-line
    else if (allTypes.indexOf(key)>-1) nextItem(key,val);
    else updateItem(key,val);
});

lineReader.on('close', function (line) {
  console.log(']');
});

function nextItem(key,val) {
    if (item) saveItem(); //save if there's currently an item being parsed (not header)
    item = { recordType: key } //, recordID: parseInt(val) }; //create a new item
    updateItem(key,val); //add identifier such as ft=123 or krt=5
}

function saveItem() {
    /// check here for strange results: for example two GUIDS
    /// which indicates an unknown AET (this was the case for 'vafb' for example)
    if (!item["GUID"]) {
        console.error("Error: Item has no GUID",item);
    }

    if (Array.isArray(item["GUID"])) {
        console.error("Error: Item has multiple GUIDs. This indicates an unknown AET (archiefeenheidsoort)",item);
        process.exit();
    }

    if (i++>0) console.log(",");
    if (item) console.log(JSON.stringify(item,null,4));
}

function updateItem(key,val) {
    var value = val.trim();
    if (key=="guid") key="GUID"; //always write GUID in uppercase
    if (item) {
        if (!item[key]) item[key] = value; //store single item
        else {
          if (!Array.isArray(item[key])) item[key] = [ item[key] ]; //convert to array when key already exists
          item[key].push(value);
        } 
    }
    prevKey = key;
}


var old = require('./wk_vocab.json').requested_information;
var data = require('./vocab_pos.json');
var out = [];

console.log(Object.keys(data).length);
console.log(old.length);

for (var i = 0; i < old.length; i++) {
    var obj = {};
    obj.character = old[i].character;
    obj.level = old[i].level;
    obj.pos = data[obj.character];
    out.push(obj);
}

console.log(out.length);
console.log("Saving...");
var json = JSON.stringify(out);
var fs = require('fs');
fs.writeFile('vocab_data.json', json, 'utf8', (err, data)=>{
    if (err) console.log(err);
    else {
        console.log("Saved to file.");
    }
});

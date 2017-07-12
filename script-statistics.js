var data = require('./vocab_data.json');

var partsOfSpeech = {};
var iter = 0;
var pos_count = 0;
for (var i = 0; i < data.length; i++) {
    data[i].pos.forEach((pos)=>{
        if (!partsOfSpeech.hasOwnProperty(pos)) partsOfSpeech[pos] = { count: 1, items: [data[i].character] };
        else {
            partsOfSpeech[pos].count++;
            partsOfSpeech[pos].items.push(data[i].character);
        }
        pos_count++;
    });
    iter++;
}
console.log("Finished parsing " + iter + " items and " + pos_count + " parts of speech.");
console.log(partsOfSpeech);

console.log("Count\tPart of Speech\t\t\tSample");
var keys = Object.keys(partsOfSpeech);
keys.sort();
keys.forEach((key)=>{
    var sample = "";
    for (var i = 0; i < partsOfSpeech[key].count; i++) {
        sample += partsOfSpeech[key].items[i] + ", ";
        if (i == 10) break;
    }
    console.log(partsOfSpeech[key].count + "\t" + key + "\t\t" + sample);
});

//Save output to a file
console.log("Saving...");
var json = JSON.stringify(partsOfSpeech);
var fs = require('fs');
fs.writeFile('pos_data.json', json, 'utf8', (err, data)=>{
    if (err) console.log(err);
    else {
        console.log("Saved to file.");
    }
});
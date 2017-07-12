/**
 * This is an off the cuff script I hacked together to parse data saved off of the public API
 * and combine with related data I needed to scrape off the site (the public API is centered on user data).
 * 
 * The file will be messy and not work out of the gate. Just use it for a rough guideline on the process
 * of gathering data off of the WK items pages.
 * 
 * Depending on your use case you will probably need to utilize a proper HTML parser to read the content
 * body. I just used regular expressions since my situation was very specific and simple.
 */

var data = (require("./wk_vocab.json")).requested_information; //My user API/vocab data stored in JSON, not in repo, get your own
var cookie = (require("./wk_vocab.json")).cookie; //Pull this out of your browser, format "_wanikani_session=#####"
console.log(data.length);
console.log(cookie);
var progress = require("./vocab_pos.json");


var https = require('https');

var errors = [];
var output = progress;
var count = Object.keys(progress).length;
console.log("Resetting progress to: " + count);
var limit = data.length;

getPoS();


function getPoS(callback) {
    var options = {
        host: 'www.wanikani.com',
        path: '/vocabulary/' + encodeURIComponent(data[count].character),
        headers: { 'cookie': cookie }
    };
    console.log("Request to: " + options.host + options.path);
    var wk = https.get(options, (res)=>{
        //console.log("status code: ", res.statusCode);
        //console.log("headers: ", res.headers);

        if (res.statusCode != 200) { console.log("Uh oh, status code: " + res.statusCode); return; }
        
        var body ='';
        res.on('data', (d)=>{
            body += d;
        });
        res.on('end', ()=>{
            //Parse the page for parts of speech
            //console.log(body);
            var regex = /<h2>Part of Speech<\/h2>[\s]*<p>[^<]*/i; //partially narrow down the html body
            var partialParse = body.match(regex);
            //console.log(partialParse);
            partialParse = partialParse[0];
            var pos = getPartsOfSpeech(partialParse);
            output[data[count].character] = pos;
            console.log(count + "\t" + data[count].character + " " + pos);
            if (count < limit) { count++; getPoS(); }
            else printResults();
        });
        res.on('error', (e)=>{
            console.log("error: " + e);
            errors.push(data[count].character);
            if (count < limit) { count++; getPoS(); }
            else printResults();
        });
    });

    wk.on('socket', (socket)=>{
        socket.setTimeout(5000);
        socket.on('timeout', ()=>{
            printResults(true);
            console.log('Socket timeout. Quitting.');
        });
    })
}

process.on('uncaughtException', (err)=>{
    console.log('Caught: ' + err);
    printResults();
})

function printResults(forceQuit) {
    //console.log(output);
    var json = JSON.stringify(output);
    var fs = require('fs');
    fs.writeFile('vocab_pos.json', json, 'utf8', (err, data)=>{
        if (err) console.log(err);
        else {
            console.log("Saved to file.");
        }
        if (forceQuit) process.exit(1);
    });
}

function getPartsOfSpeech(unparsed) {
    var regex = /<p>.*/i; //narrow down the body further
    var pos = (unparsed.match(regex))[0];
    //console.log("PoS match: " + pos);
    pos = pos.replace("<p>", ""); //remove the last html tag
    pos = pos.trim(); //remove any other surrounding whitespace
    //console.log(pos);

    var out = [];
    var tokens = pos.split(','); //tokenize the parts of speech
    for (var i = 0; i < tokens.length; i++) {
        out.push(tokens[i].trim());
    }

    return out;
}

/**
 * 
 * Source: https://web.archive.org/web/20160712094308/http://www.mang.canterbury.ac.nz/writing_guide/writing/flesch.shtml
 */

const
    fs = require('fs'),
    debug = false // debug modus on/off
    ;
let
    sentences = [] // Array of sentences
    ;
exports.sentences = sentences;

/**
 * Preprocessing 
 * TODO/Flesh requirements: Test only the running text of your piece of writing. Skip titles, headings, subheads, section and paragraph numbers, captions, date lines and signature lines.
 * @param {String} text
 * @param {String} file
 */
exports.analyse = function (text, file) {
    // strip tags
    text = text.replace(/(<([^>]+)>)/ig, "");
    // split sentences
    text = text.replace(/\\n/g, "\r");
    var re = /\b(\w\.\ \w\.|\w\.\w\.|bzw\.|bspw\.|[0-9]+\.)|([.?!])\s+(?=[A-Za-z])/g;
    var result = text.replace(re, function (m, g1, g2) {
        return g1 ? g1 : g2 + "\r";
    });
    sentences = result.split("\r");
    calculateFleshIndex(file);
    //fs.writeFile('output/full-text.txt', text, err => {});
};


/**
 * Calculates the Flesh index per sentence for a given long (xml/html) text
 */
var calculateFleshIndex = function (file) {
    var
        words = [],
        total_syllables = 0,
        total_words = 0
        ;
    // calculate Flesh index per sentence
    var
        sum = 0,
        csv = 'id,words,flesh\n',
        json = []
        ;
    for (var i = 0; i < sentences.length; i++) {
        words = sentences[i].split(/\ /g);
        total_words = words.length;
        total_syllables = 0;
        for (var j = 0; j < total_words; j++) {
            total_syllables += countSyllables(words[j]);
        }
        // https://de.wikipedia.org/wiki/Lesbarkeitsindex
        // total_words / sentences.length
        //EN:  206.835 - 1.015 * (total_words / sentences.length) - 84.6 * (total_syllables / total_words);
        var flesh_de = 180 - (1) - 58.5 * (total_syllables / total_words);
        //console.log(flesh_de, total_syllables, sentences[i]);
        csv += i + ',' + ',' + total_words + ',' + flesh_de + '\n';
        json.push({ id: i, words: total_words, flesh: flesh_de, text: sentences[i] });
        sum += flesh_de;
        // debug
        if (flesh_de < 0 && debug) {
            console.log(flesh_de + ' ' + ' ' + sentences[i] + '\n\n');
        }
    }
    // print output
    console.log('Flesh readability index (DE-de) of ' + file + ' ' + (sum / sentences.length).toFixed(2));
    fs.writeFile('output/text-analysis-' + file + '.csv', csv, err => { });

    // Get example sentences for certain pecentils
    getPercentils(json, [0.10, 0.5, 0.9]);
};


/**
 * 
 * @param {Array} Array of json objects
 * @param {Array} Array of percentils to given out
 */
var getPercentils = function(json, percentils){
    // sort by flesh
    var sentences = json.sort(function (obj1, obj2) {
        return obj1.flesh - obj2.flesh;
    });
    // print percentils
    var l = sentences.length;
    for(var i = 0; i < percentils.length;i++){
        if (percentils[i] < 1 && percentils[i] > 0){
            console.log((percentils[i] * 100) + '% Percentil: ' + sentences[Math.ceil(l * percentils[i])].text);    
        }
    }
};


/**
 * Counts syllables for a given German word.
 * @param {String} word 
 */
var countSyllables = function (word) {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ü', 'ö'];
    var
        currentWord = word.toLowerCase().split(''),
        numVowels = 0,
        lastWasVowel = false
        ;
    for (var j = 0; j < currentWord.length; j++) {
        var
            wc = currentWord[j],
            foundVowel = false,
            v = ''
            ;
        for (var i = 0; i < vowels.length; i++) {
            v = vowels[i];
            //don't count diphthongs
            if ((v == wc) && lastWasVowel) {
                foundVowel = true;
                lastWasVowel = true;
                break;
            } else if (v == wc && !lastWasVowel) {
                numVowels++;
                foundVowel = true;
                lastWasVowel = true;
                break;
            }
        }
        //If full cycle and no vowel found, set lastWasVowel to false;
        if (!foundVowel) {
            lastWasVowel = false;
        }
    }
    return numVowels;
};
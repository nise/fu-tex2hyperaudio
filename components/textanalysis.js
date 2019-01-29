/**
 * 
 * author: niels.seidel@fernuni-hagen.de
 * Source: https://web.archive.org/web/20160712094308/http://www.mang.canterbury.ac.nz/writing_guide/writing/flesch.shtml
 */

const
    fs = require('fs'),
    debug = false, // debug modus on/off
    echo = false
    ;
let
    sentences = [],
    ssml = ''
    ;

/**
 * Preprocessing 
 * TODO/Flesh requirements: Test only the running text of your piece of writing. Skip titles, headings, subheads, section and paragraph numbers, captions, date lines and signature lines.
 * @param {String} text
 * @param {String} document
 */
exports.analyse = function (text, document) {
    if (text === null) {
        return;
    }
    ssml = text;
    text_id = document;
    // strip tags
    text = text.replace(/(<([^>]+)>)/ig, "");
    // split sentences
    text = text.replace(/\\n/g, "\r");
    var re = /\b(\w\.\ \w\.|\w\.\w\.|vgl\.|bzw\.|bspw\.|[0-9]+\.)|([.?!])\s+(?=[A-Za-z])/g;
    var result = text.replace(re, function (m, g1, g2) {
        return g1 ? g1 : g2 + "\r";
    });
    sentences = result.split("\r");
    //fs.writeFile('output/full-text.txt', text, err => {});
    return calculateFleshIndex(document);
};


/**
 * Calculates the Flesh index per sentence for a given long (xml/html) text
 */
var calculateFleshIndex = function (document) {
    var
        words = [],
        total_syllables = 0,
        total_sentence_words = 0,
        total_words = 0
        ;
    // determin total number of word in the text
    var count_words = function (sentences) {
        var len = 0;
        for (var i = 0; i < sentences.length; i++) {
            len += sentences[i].split(/\ /g).length;
        }
        return len;
    };
    total_words = count_words(sentences);
    // calculate Flesh index per sentence
    var
        sum = 0,
        json = []
        ;
    for (var i = 0; i < sentences.length; i++) {
        words = sentences[i].split(/\ /g);
        total_sentence_words = words.length;
        total_syllables = 0;
        for (var j = 0; j < total_sentence_words; j++) {
            total_syllables += countSyllables(words[j]);
        }
        // https://de.wikipedia.org/wiki/Lesbarkeitsindex
        // total_words / sentences.length
        //EN:  206.835 - 1.015 * (total_words / sentences.length) - 84.6 * (total_syllables / total_words);
        // DE: 180 - 1() ...
        var flesh_de = 180 - (total_words / sentences.length) - 58.5 * (total_syllables / total_sentence_words);
        if (total_sentence_words > 3) {
            json.push({ document: document, id: i, words: total_sentence_words, flesh: flesh_de, text: sentences[i], selected: false });
            sum += flesh_de;
            // debug
            if (flesh_de < 0 && debug) {
                console.log(flesh_de + ' ' + ' ' + sentences[i] + '\n\n');
            }
            if (total_sentence_words > 100 && debug) {
                console.log('# Long Sentence in ' + document + ':  ' + sentences[i] + '\n\n');
            }
        }
    }

    // print output
    if (echo) {
        console.log('Flesh readability index (DE-de) of ' + document + ' ' + (sum / sentences.length).toFixed(2));
    }
    fs.appendFile('output/text-analysis-all.csv', json2csv(json), err => { });

    return json;
};


/**
 * Counts syllables for a given German word.
 * @param {String} word 
 */
var countSyllables = function (word) {
    if (word === undefined) {
        console.error('Syllable of undefined word'); return;
    }
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


/**
 * Util function to convert a given json structure in static csv data
 * @param {*} json 
 * @param {*} percentils 
 */
var json2csv = function (json) {
    var csv = '';//'document,id,words,flesh,selectd\n';
    for (var i = 0; i < json.length; i++) {
        csv += json[i].document + ',' + json[i].id + ',' + json[i].words + ',' + json[i].flesh + ',' + json[i].selected + '\n';
    }
    return csv;
};
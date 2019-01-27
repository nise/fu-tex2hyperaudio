const
    fs = require('fs')
    ;


exports.analyse = function (text, file) {

    // strip tags
    text = text.replace(/(<([^>]+)>)/ig, "");
    // split sentences
    text = text.replace(/\\n/g, "\r");
    var re = /\b(\w\.\ \w\.|\w\.\w\.|bzw\.)|([.?!])\s+(?=[A-Za-z])/g;
    var result = text.replace(re, function (m, g1, g2) {
        return g1 ? g1 : g2 + "\r";
    });
    var
        sentences = result.split("\r"),
        words = [],
        total_syllables = 0,
        total_words = 0
        ;

    //fs.writeFile('output/full-text.txt', text, err => {});
    var
        sum = 0,
        csv = 'id,words,flesh\n'
        ;
    for (var i = 0; i < sentences.length; i++) {
        words = sentences[i].split(/\ /g)
        total_words = words.length;
        total_syllables = 0;
        for (var j = 0; j < total_words; j++) {
            total_syllables += countSyllables(words[j]);
            //console.log(countSyllables(words[j]), words[j]);
        }

        // https://de.wikipedia.org/wiki/Lesbarkeitsindex
        // total_words / sentences.length
        //EN:  206.835 - 1.015 * (total_words / sentences.length) - 84.6 * (total_syllables / total_words);
        var flesh_de = 180 - (1) - 58.5 * (total_syllables / total_words);
        //console.log(flesh_de, total_syllables, sentences[i]);
        csv += i + ',' + ',' + total_words + ',' + flesh_de + '\n';
        sum += flesh_de;
        if (flesh_de < 0) {
            console.log(flesh_de + ' ' + ' ' + sentences[i] + '\n\n');
        }
    }
    console.log('Flesh readability index (DE-de) ' + (sum / sentences.length).toFixed(2));
    fs.writeFile('output/text-analysis-' + file + '.csv', csv, err => { });
};



var countSyllables = function (word) {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ü', 'ö'];
    var currentWord = word.toLowerCase().split('');
    var numVowels = 0;
    var lastWasVowel = false;
    for (var j = 0; j < currentWord.length; j++) {
        var wc = currentWord[j];
        var foundVowel = false;
        for (var i = 0; i < vowels.length; i++) {
            var v = vowels[i];
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
        if (!foundVowel)
            lastWasVowel = false;
    }
    return numVowels;
};
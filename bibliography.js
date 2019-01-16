/**
 * name: bibliography
 * description: BibTeX interface and wrapper
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 */

const
    fs = require('fs')
path = require('path'),
    file_bib = '/home/abb/Documents/library.bib'
    ;

// use existing file rather than importing one
var contents = fs.readFileSync('./mybibfile.json');
var mybib = JSON.parse(contents);

/**
 * Imports a BibTex bibliografy, re-structure it, and stores it localy as a json file.
 */
exports.importBibliografy = function () {
    var mybib = {};
    fs.readFile(file_bib, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            const biblatex = require('biblatex-csl-converter');
            const bib = biblatex.parse(data, {
                processUnexpected: true,
                processUnknown: { comment: 'f_verbatim' },
                processInvalidURIs: true,
            });
            // reorganize entries
            for (const [key, entry] of Object.entries(bib.entries)) {
                mybib[entry.entry_key] = entry.fields;
                mybib[entry.entry_key].type = entry.bib_type;
            }
            var fs = require('fs');
            fs.writeFile('mybibfile.json', JSON.stringify(mybib), 'utf8');
        }
    });
};


/**
 * 
 * @param {*} key 
 * @param {*} citation_type 
 * xxx: fix bug if author has multiple family names
 */
exports.getAuthorNames = function (key, citation_type = 'passive') {
    if (mybib.length === 0) {
        return;
    }
    if (mybib[key] === undefined) {
        return;
    }

    var out = '';

    switch (mybib[key].author.length) {
        case 1: //console.log(mybib[key].author[0])
            out = mybib[key].author[0].family ? mybib[key].author[0].family[0].text : mybib[key].author[0].literal[0].text;
            break;
        case 2:
            if (mybib[key].author[1].family[0] && mybib[key].author[1].family[0]) {
                out = mybib[key].author[0].family[0].text + ' und ' + mybib[key].author[1].family[0].text;
            } else { 
                //console.log(key, mybib[key].author[1]); 
            }
            break;
        default:
            out = mybib[key].author[0].family[0].text + ' und Kollegen';
    }
    var date = '<say-as interpret-as="date" format="y">' + mybib[key].date.substring(0, 4) + '</say-as>';
    
    if (citation_type === 'active') {
        return out + ' (' + date + ')';
    } else {
        return '(' + out + ', ' + date + ')';
    }
};

/**
 * Returns plain formated citation for a given key
 * todo: xxx
 */
exports.getPlainCitation = function(key){
    return this.getAuthorNames(key);
}
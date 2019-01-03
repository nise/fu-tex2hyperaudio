/**
 * name: polly
 * description: Interface to Amazon AWS Polly web services
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 * 
 * todo: 
 * - Support Google Text2Speeck SSML.
 * - testing
 */

const
    fs = require('fs'),
    bibliography = require('./bibliography')
    ;

/**
 * 
 */
exports.tex2SSML = function (file) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        }

        var
            language = 'de-DE',
            preamble = '<?xml version="1.0"?><speak version="1.1"  xmlns="http://www.w3.org/2001/10/synthesis" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.w3.org/2001/10/synthesis http://www.w3.org/TR/speech-synthesis11/synthesis.xsd" xml:lang="' + language + '">',
            closing = '</speak>'
            ;
        data = data.split("\\section[Selbsttest]")[0]; // cut off a certain section
        

        // prepare special character for easier substition later on
        data = data.replace(/\u0008egin/g, 'XXXXXXX');
        data = data.replace(/\\begin/g, 'XXXXXXX');
        data = data.replace(/\\end/g, 'YYYYYYY');
        data = data.replace(/XXXXXXX\{comment\}([^\0]*?)YYYYYYY\{comment\}/gm, '');


        data = data.replace("\\\\", '\n');// remove double
        data = data.replace("\n\n", '');// remove double
        data = processParagraphs(data);
        data = replaceHeadings(data);
        data = replaceTags(data);
        data = eliminateFullTags(data);
        data = removeComments(data);
        data = data.replace(/(^[ \t]*\n)/gm, ""); // remove blank lines
        // Validation
        validateOutput(data);


        // finalize xml file
        data = preamble + '\n' + data + '\n' + closing;

        //var test = "<speak>Hallo liebe <mark name='leute' />Leute</speak>";
        //test = "Hallo liebe Leute";
        //data = preamble + '\n' + test + '\n' + closing;
        //data = test;

        fs.writeFile('output.xml', data, err => {
            if (err) {
                console.error('ERROR:', err);
                return;
            }
            console.log('text content written to file: output.xml');
            //polly.speechSynthesis(data);
            //polly.speechSynthesis(data, true); // marks
        });
        // The text to synthesize
        //t2s(data);

    });
};

/**
 * Validation
 * @param {*} data 
 */
var validateOutput = function (data) {
    console.log('................................................');
    
    if (data.match(/\\([^\0]*?)\ /gm) === null){
        data = data.replace(/\{/g,'');
        data = data.replace(/\}/g, '');
    }else{
        console.log('WARNING: Unhandled LaTeX expressions found :::::');
        console.log('................................................');
        console.log(data.match(/\\([^\0]*?)\ /gm));
    }

    var
        astring = data.split('\n'),
        match1 = /\{/,
        match2 = /\}/,
        f1 = [],
        f2 = []
        ;
    astring.forEach(function (line, number) {
        if (match1.exec(line)) { f1.push(number); }
        if (match2.exec(line)) { f2.push(number); }
    });
    if(f1.length > 0 || f2.length > 0){
        console.log('Symbol "{" found on lines ' + f1.toString());
        console.log('Symbol "}" found on lines ' + f2.toString());
    }else{
        console.log("No more LaTeX expressions found.")
    }

    
    var libxmljs = require("libxmljs");
    var xml = function (text) {
        try {
            libxmljs.parseXml(text);
        } catch (e) {
            return false;
        }

        return true;
    };
    console.log('XML is valid? ' + xml(data));
    console.log('................................................');
};


/**
 * process paragraphs and sentences
 * @param {object} data 
 */
var processParagraphs = function (data) {
    var
        paragraphs = data.split('\n'),
        sentences = []
        ;
    for (var i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].trim !== '\n' && paragraphs[i].length > 0) {
            // process sentences
            // sentences
            sentences = paragraphs[i].match(/[^\.!\?]\s+[\.!\?]\s+/g); //console.log(result)
            if (sentences) {
                for (var j = 0; j < sentences.length; j++) {
                    sentences[j] = '<s>' + sentences[j] + '</s>';
                }
                paragraphs[i] = sentences.join('\n');
                paragraphs[i] = '<p>\n' + paragraphs[i] + '\n</p>';
            }

        } else {
            paragraphs[i] = '';
        }
    }
    return paragraphs.join('\n');
};


/**
 * 
 */
var correctPhonetics = function () {
    /*
            data = data.replace(/kooperativ/g, 'koperativ');
            data = data.replace(/Interaktions-Design/g, '<emphasis level="strong">Interaktionsdesign</emphasis>');
            data = data.replace(/Designer/g, '<emphasis level="reduced">Designer</emphasis>');
            data = data.replace(/Nutzer/g, '<emphasis level="strong">Nutzer</emphasis>');
            data = data.replace(/Menschen/g, '<emphasis level="strong">Menschen</emphasis>');
            data = data.replace(/Sie/g, '<emphasis level="strong">Sie</emphasis>');
            */
}


/**
 * 
 */
var replaceHeadings = function (str) {
    return str
        .replace(/\\chap\{([^\0]*?)\}\{([^\0]*?)\}/g, '<mark name="chapter-$1"/><prosody rate="slow" pitch="low">$1</prosody><break strength="x-strong" />')
        .replace(/\\chapter\{([^\0]*?)\}/g, '<mark name="chapter-$1"/><prosody rate="slow" pitch="low">$1</prosody><break strength="x-strong" />')
        .replace(/\\section\{([^\0]*?)\}/g, '<mark name="section-$1"/><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\section\*\{([^\0]*?)\}/g, '<mark name="section-$1"/><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\subsection\{([^\0]*?)\}/g, '<mark name="subsection-$1"/><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\subsection\*\{([^\0]*?)\}/g, '<mark name="subsection-$1"/><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\subsubsection\{([^\0]*?)\}/g, '<mark name="subsubsection-$1"/>$1<break strength="medium" />')
        .replace(/\\paragraph\{([^\0]*?)\}/g, '<mark name="paragraph-$1"/>$1<break strength="medium" />')
        ;
};


/**
 * 
 */
var replaceTags = function (str) {
    var
        item = 0,
        quote_start = '<break strength="medium" />Zitat<break strength="medium" />',
        quote_end = '<break strength="medium" />Zitatende<break strength="medium" />'
        ;

    return str
        // special words
        .replace(/\\patternName\{([^\0]*?)\}/gm, '<mark name="pattern-$1" /><break strength="medium" />$1<break strength="medium" />')
        .replace(/\\mpattern\{([^\0]*?)\}\{([^\0]*?)\}/gm, '<mark name="pattern-$1" /><break strength="medium" />$1: $2<break strength="medium" />')
        .replace(/\\pattern\{([^\0]*?)\}\{([^\0]*?)\}\{([^\0]*?)\}/gm, '<mark name="pattern-desc-$1" /><break strength="medium" />$1: $3<break strength="medium" />')
        .replace(/\\today/g, 'heute')
        .replace(/\$([^\0]*?)\$/g, '$1') // xxx, no math support
        //todo: check language for quotes var franc = require('franc') franc('Alle menslike wesens word vry') 
        // quotes
        .replace(/\\enquote\{([^\0]*?)\}/g, quote_start + '$1' + quote_end)
        .replace(/\\textquote\{([^\0]*?)\}/g, quote_start + '$1' + quote_end)
        .replace(/\x60\x60/g, quote_start) //  `
        .replace(/``/g, quote_start) //  `
        .replace(/\'\'/g, quote_end)
        .replace(/\\glqq /g, quote_start)
        .replace(/\\grqq\~/g, quote_end)
        .replace(/\\grqq/g, quote_end)
        .replace(/\\guillemotleft/g, quote_end)
        .replace(/\\guillemotright\{([^\0]*?)\}/g, quote_start + '$1')
        .replace(/XXXXXXX{quote}/g, quote_start)
        .replace(/YYYYYYY{quote}/g, quote_end)
        .replace(/XXXXXXX{quotation}/g, quote_start)
        .replace(/YYYYYYY{quotation}/g, quote_end)
        .replace(/\{\\frq\}([^\0]*?){\\flq\}/gm, '$1')
        // text styles
        .replace(/\\emph\{([^\0]*?)\}/gm, '$1')
        .replace(/\\textit\{([^\0]*?)\}/gm, '$1')
        .replace(/\\textsf\{([^\0]*?)\}/gm, '$1')
        .replace(/\\textbf\{([^\0]*?)\}/gm, '$1') // could be more pronounced
        .replace(/\\textsc\{([^\0]*?)\}/gm, "$1")
        .replace(/--/g, '-')
        .replace(/~/g, "")
        .replace(/\&/g, "und")

        // citation
        .replace(/\\cite\{([^\0]*?)\}/g, function (match, capture) {
            return '<mark name="citation-' + capture + '" />' + bibliography.getAuthorNames(capture);
        })
        .replace(/\\citep\{([^\0]*?)\}/g, function (match, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key);
        })
        .replace(/\\citep\[([^\0]*?)\]\{([^\0]*?)\}/g, function (match, page, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key);
        })
        .replace(/\\citeN\{([^\0]*?)\}/g, function (match, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key, 'active');
        })
        .replace(/\\citet\{([^\0]*?)\}/g, function (match, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key, 'active');
        })
        .replace(/\\citeN\[([^\0]*?)\]\{([^\0]*?)\}/g, function (match, page, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key, 'active');
        })
        .replace(/\\citet\[([^\0]*?)\]\{([^\0]*?)\}/g, function (match, page, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key, 'active');
        })

        // sepcial sections
        .replace(/XXXXXXX\{discussion\}/g, '<mark name="discussion"/><prosody rate="slow" pitch="low">Diskussion</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{discussion\}/g, '<break strength="strong" />')
        .replace(/XXXXXXX\{discussionInList\}/g, '<mark name="discussion"/><prosody rate="slow" pitch="low">Diskussion</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{discussionInList\}/g, '<break strength="strong" />')
        .replace(/XXXXXXX\{example\}/g, '<mark name="example"/><prosody rate="slow" pitch="low">Beispiel</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{example\}/g, '<break strength="strong" />')
        .replace(/XXXXXXX\{exampleInList\}/g, '<mark name="example"/><prosody rate="slow" pitch="low">Beispiel</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{exampleInList\}/g, '<break strength="strong" />')

        // lists 
        .replace(/XXXXXXX{enumerate}/g, '')
        .replace(/XXXXXXX{enumerate}\[label=\\alph\*\]/g, '')
        .replace(/YYYYYYY{enumerate}/g, '')//'</seq></speak>') //<speak><say-as interpret-as="ordinal">1</say-as></speak>
        .replace(/XXXXXXX{itemize}/g, '')
        .replace(/YYYYYYY{itemize}/g, '')
        .replace(/XXXXXXX{description}/g, '')
        .replace(/YYYYYYY{description}/g, '')
        .replace(/\\itemb/g, function (v, i) {
            item++;
            return '<mark name="item-' + (item % 2) + '" />';
        })
        .replace(/\\igoal/g, function (v, i) {
            item++;
            return '<mark name="icon-goal" /><mark name="item-' + (item % 2) + '" />';
        })
        .replace(/\\item/g, function (v, i) {
            item++;
            return '<mark name="item-' + (item % 2) + '" />';
        })

        // sounds
        .replace(/\\url\{([^\0]*?)\}/g, '<mark name="url-$1" />')
        .replace(/\\href\{([^\0]*?)\}\{([^\0]*?)\}/g, '<mark name="url-$2" />')
        .replace(/\\link\{([^\0]*?)\}/gm, '<mark name="link-$1" />')
        .replace(/\\book/g, '<mark name="book" />')
        .replace(/\\video/g, '<mark name="video" />')
        .replace(/\\video\{([^\0]*?)\}/g, '<mark name="video-$1" />')
        .replace(/\\videolink\{([^\0]*?)\}/g, '<mark name="video-$1" />')
        .replace(/\\goal/g, '<mark name="icon-goal" />')
        .replace(/\\paper/g, '<mark name="icon-paper" />')
        .replace(/\\quiz/g, '<mark name="icon-quiz" />')
        .replace(/\\discuss/g, '<mark name="icon-discussion" />')

        // todo: handle tables, xxx
        .replace(/XXXXXXX\{figure\}\[H\]([^\0]*?)YYYYYYY\{figure\}/gm, '$1')
        .replace(/XXXXXXX\{figure\}([^\0]*?)YYYYYYY\{figure\}/gm, '$1')
        .replace(/XXXXXXX\{flushleft\}([^\0]*?)YYYYYYY\{flushleft\}/g, '')
        .replace(/XXXXXXX\{flushright\}([^\0]*?)YYYYYYY\{flushright\}/g, '$1')
        .replace(/XXXXXXX\{tabular\}([^\0]*?)YYYYYYY\{tabular\}/g, '')
        .replace(/XXXXXXX\{tabularx\}([^\0]*?)YYYYYYY\{tabularx\}/g, '')
        .replace(/XXXXXXX\{leftbar\}([^\0]*?)YYYYYYY\{leftbar\}/g, '')
        .replace(/\\includegraphics\[([^\0]*?)\]\{([^\0]*?)\}/gm, '<mark name="image-$2" />')
        .replace(/\\captionof\{figure\}\{([^\0]*?)\}/gm, '<mark name="imagecaption" />$1')
        .replace(/\\captionof\{figure\}/gm, '')
        .replace(/\\captionof\{table\}\{([^\0]*?)\}/gm, '<mark name="tablecaption" />$1')
        .replace(/\\caption\{([^\0]*?)\}/gm, '<mark name="caption" />$1')
        .replace(/\\caption\[([^\0]*?)\]\{([^\0]*?)\}/gm, '<mark name="caption" />$2')
        .replace(/\\lstinputlisting\[([^\0]*?)\]\{([^\0]*?)\}/gm, '<mark name="listing" />')

        .replace(/\\blfootnote\{([^\0]*?)\}/g, '<mark name="footnote" />') // todo: strip footnote content
        .replace(/\\footnote\{([^\0]*?)\}/g, '<mark name="footnote" />') // todo: strip footnote content

        // todo: handle margin texts, xxx
        .replace(/\\mbox\{([^\0]*?)\}/g, '')
        .replace(/\\randhervor\{([^\0]*?)\}/g, '')
        .replace(/\\randnotiz\{([^\0]*?)\}/g, '')
        .replace(/\\marginpar\{([^\0]*?)\}/g, "")
        .replace(/\[label\=\\alph\*\]/g,'')
        ;

    /*
       
    xxx bugs
    KE6
       \lstinputlisting[caption = { Server: server.js }, label = { server-code }, language = Javascript, firstnumber = 1]{ code / 1884 - awareness / server.js }
       \lstinputlisting[caption = { index.html }, label = { client-code }, language = Javascript, firstnumber = 1]{ code / 1884 - awareness / index.html }

*/
};


/**
 * 
 */
var eliminateFullTags = function (str) {
    return str
        //		.replace(/~/g, "")
        .replace(/\\-/g, '')
        .replace(/\\%/g, ' Prozent')
        .replace(/\\\\/gm, '')
        .replace(/\\vfill/g, '')
        .replace(/\\footnotesize/g, '')
        .replace(/\\minitoc/g, '')
        .replace(/\\vspace\{([^\0]*?)\}/g, "")
        .replace(/\\label\{(.*?)\}/g, "")
        .replace(/\\newpage/g, "")
        .replace(/\\noindent/g, "")
        .replace(/\\-/g, "")
        .replace(/\\linebreak/g, "")
        .replace(/\\pagebreak/g, "")
        .replace(/\\cleardoublepage/g, "")
        .replace(/\\index\{p\}\{([^\0]*?)\}/g, "") // remove person index
        .replace(/\\index\{o\}\{([^\0]*?)\}/g, "") // remove place index
        .replace(/\\ref\{([^\0]*?)\}/g, "")
        .replace(/\[\\dots\]/g, '')
        .replace(/\\cdot/g, '')
        .replace(/\\,/g, ',')
        .replace(/XXXXXXX\{shaded\}/g, '')
        .replace(/YYYYYYY\{shaded\}/g, '')
        .replace(/XXXXXXX\{shaded\*\}/g, '')
        .replace(/YYYYYYY\{shaded\*\}/g, '')
        .replace(/XXXXXXX\{center\}/g, '')
        .replace(/YYYYYYY\{center\}/g, '')
        .replace(/XXXXXXX\{table\}\[H\]/g, '')
        .replace(/XXXXXXX\{table\}/g, '')
        .replace(/YYYYYYY\{table\}/g, '')

        .replace(/\\renewcommand\{\\arraystretch\}\{([^\0]*?)\}/g,'')
        .replace(/\\subtitle\{([^\0]*?)\}/g, "")
        .replace(/\\ifsplit/g, "")
        .replace(/\\setcounter\{([^\0]*?)\}\{([^\0]*?)\}/g, "")
        .replace(/\\TitelBlatt\{([^\0]*?)\}/g, "")
        .replace(/\\tableofcontents/g, "")
        .replace(/\\thispagestyle\{([^\0]*?)\}/g, "")
        .replace(/\\hspace\{([^\0]*?)\}/g, "")
        .replace(/\\colorbox\{([^\0]*?)\}\{([^\0]*?)\}/gm, "")
        .replace(/\\fi/g, "")
        .replace(/\\dots/g, "...")
        .replace(/\\footnotesize/g, '')
        .replace(/\\clearpage/g, "")
        .replace(/\\definecolor\{([^\0]*?)\}\{([^\0]*?)\}\{([^\0]*?)\}/g, "")
        .replace(/\\protect/g, "")
        .replace(/\\newline/g, "")
        .replace(/\\small/g, "")
        .replace(/\\large/g, "")
        .replace(/\\color\{white\}/g, "")
        .replace(/\\tiny/g, "")
        .replace(/\\centering/g, "")
        .replace(/\\center/g, "")
        .replace(/\\\_/g, "-")

        // eleminate french axioms
        .replace(/\\\^\{i\}/g, "i")
        .replace(/\\\'\{e\}/g, "e")

        .replace(/\\faThumbsOUplikes/g, "")
        .replace(/\\faThumbsUplike/g, "")
        .replace(/\\faBars/g, "")
        .replace(/\\faHeartOfavorites/g, "")
        .replace(/\\faHeart/g, "")
        .replace(/\\selectfont/g, "")
        .replace(/\\fontsize\{([^\0]*?)\}\{([^\0]*?)\}/g, "")

        // eleminta epolish
        .replace(/\\l\{\}/g, "l")
        
        ;
};



/**
 * Substitute  abbrevations
 * todo: not used yet, xxx
 */
var abbrevasions = [
    { term: 'W3C', full: 'World Wide Web Consortium' }
];

var substituteAbrevations = function (str) {
    for (var i = 0, len = abbrevasions.length; i < len; i++) {
        str.replace(abbrevasions[i].term, '<sub alias="' + abbrevasions[i].full + '">' + abbrevasions[i].term + '</sub>');
    }
    return str;
};


/**
 * Handle Questions
 * todo: not used yet, xxx
 */
var substituteQuestions = function (str) {
    // xxx extract questions
    str.replace(
        abbrevasions[i].term,
        '<media xml:id="question" begin="0.5s"><speak>Who invented the Internet?</speak></media>'
    );

    return str;
};


/** 
 * Cleans inline comments
 */
var removeComments = function (str) {
    if (str == undefined) { return; }
    str = str.replace(/XXXXXXX\{comment\}([^\0]*?)\\end\{comment\}/g, '');
    var arr = str.split(/\n/);
    for (var a = 0; a < arr.length; a++) {
        var matches = arr[a].match(/^(%)/gi);
        if (matches != null) {
            arr.splice(a, 1);
        }
        arr[a] = arr[a].split('%')[0].replace(/\t/gi, '');
    }
    return arr.join("\n");
};

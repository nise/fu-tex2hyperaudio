/**
 * name: polly
 * description: Interface to Amazon AWS Polly web services
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 * 
 * todo: 
 * - Support Google Text2Speeck SSML.
 * - testing
 * 
 * bugs
 * -ke3:480 => not as englisch detected
 */

const
    echo = false,
    fs = require('fs'),
    bibliography = require('./bibliography'),
    franc = require('franc')
    ;

/**
 * 
 */
exports.tex2SSML = function (file, path) {
    fs.readFile(path + file, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            return;
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
        data = data.replace(/\\%/g, 'Prozent')
        data = removeComments(data);
        
        data = data.replace("\\\\", '');// remove double
        data = data.replace("\n\n", '\n');// remove double
        data = data.replace("\n", ' ');// remove double
        
        data = processParagraphs(data);

        data = replaceHeadings(data);
        data = replaceTags(data);
        data = eliminateFullTags(data);

        data = data.replace(/(^[ \t]*\n)/gm, ""); // remove blank lines
        // Validation
        validateOutput(data);

        // clean empty lines
        data = data
            .replace(/\<p\>\<s\>\<\/s\>\<\/p\>/g,'')
            .replace(/\<p\>\ \<\/p\>/g, '')
            ;
        
        
        // finalize xml file
        data = preamble + '\n' + data + '\n' + closing;

        fs.writeFile('output/ssml-' + file.replace('.tex', '') + '.xml', data, err => {
            if (err) {
                console.error('ERROR:', err);
                return;
            }
            
            if(echo){
                console.log('text content written to ' + 'output/ssml-' + file.replace('.tex', '') + '.xml');
            }
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
    if(echo){
        console.log('................................................');
    }
    
    if (data.match(/\\([^\0]*?)\ /gm) === null) {
        data = data.replace(/\{/g, '');
        data = data.replace(/\}/g, '');
    } else {
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
    if (f1.length > 0 || f2.length > 0) {
        console.log('Symbol "{" found on lines ' + f1.toString());
        console.log('Symbol "}" found on lines ' + f2.toString());
    } else if(echo){
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
    if(echo){
        console.log('................................................');
    }
    
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
            var re = /\b(\w\.\ \w\.|\w\.\w\.|vgl\.|bzw\.|bspw\.|[0-9]+\.)|([.?!])\s+(?=[A-Za-z])/g;
            var result = paragraphs[i].replace(re, function (m, g1, g2) {
                return g1 ? g1 : g2 + "\r";
            });
            sentences = result.split("\r");

            if (sentences) {
                //console.log('----------',sentences);
                for (var j = 0; j < sentences.length; j++) {
                    if (sentences[j].length > 2) {
                        sentences[j] = '<s>' + sentences[j] + '</s>';
                    }
                }
                paragraphs[i] = sentences.join('\n');
                paragraphs[i] = '<p>' + paragraphs[i] + '</p>';
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
        .replace(/\\chap\{([^\0]*?)\}\{([^\0]*?)\}/g, '<mark name="chapter-$1"/><break strength="strong" /><prosody rate="slow" pitch="low">$1</prosody><break strength="x-strong" />')
        .replace(/\\chapter\{([^\0]*?)\}/g, '<mark name="chapter-$1"/><break strength="strong" /><prosody rate="slow" pitch="low">$1</prosody><break strength="x-strong" />')
        .replace(/\\section\{([^\0]*?)\}/g, '<mark name="section-$1"/><break strength="strong" /><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\section\*\{([^\0]*?)\}/g, '<mark name="section-$1"/><break strength="strong" /><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\subsection\{([^\0]*?)\}/g, '<mark name="subsection-$1"/><break strength="strong" /><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\subsection\*\{([^\0]*?)\}/g, '<mark name="subsection-$1"/><break strength="strong" /><prosody rate="slow" pitch="low">$1</prosody><break strength="strong" />')
        .replace(/\\subsubsection\{([^\0]*?)\}/g, '<mark name="subsubsection-$1"/><break strength="strong" />$1<break strength="medium" />')
        .replace(/\\paragraph\{([^\0]*?)\}/g, '<mark name="paragraph-$1"/><break strength="strong" />$1<break strength="medium" />')
        ;
};


/**
 * 
 * @param {*} str 
 */
var handleQuote = function (match, capture) {
    capture.replace(/\\textit\{([^\0]*?)\}/g, '$1');
    //console.log(capture);
    capture.replace(/{([^\0]*?)}/g, function (m, e) {
        //console.log('--', e);
        return e;
    });
    if (franc(capture) === 'eng') {
        //console.log(capture, '-- ', franc(capture));
        return '<lang xml:lang="en-GB">' + capture + '</lang>';
    } else {
        return capture;
    }
};


/**
 * 
 * @param {*} str 
 * todo: replaces cite key with author names without any mark-tags
 */
var replaceCitations = function (str, plain=false) {
    return str
        .replace(/\\cite\{([^\0]*?)\}/g, function (match, capture) {
            return bibliography.getAuthorNames(capture, 'passive', plain);
        })
        .replace(/\\citep\{([^\0]*?)\}/g, function (match, key) {
            return bibliography.getAuthorNames(key, 'passive', plain);
        })
        .replace(/\\citep\[([^\0]*?)\]\{([^\0]*?)\}/g, function (match, page, key) {
            return bibliography.getAuthorNames(key, 'passive', plain);
        })
        .replace(/\\citeN\{([^\0]*?)\}/g, function (match, key) {
            return bibliography.getAuthorNames(key, 'active', plain);
        })
        .replace(/\\citet\{([^\0]*?)\}/g, function (match, key) {
            return bibliography.getAuthorNames(key, 'active', plain);
        })
        .replace(/\\citeN\[([^\0]*?)\]\{([^\0]*?)\}/g, function (match, page, key) {
            return bibliography.getAuthorNames(key, 'active', plain);
        })
        .replace(/\\citet\[([^\0]*?)\]\{([^\0]*?)\}/g, function (match, page, key) {
            return '<mark name="citation-' + key + '" />' + bibliography.getAuthorNames(key, 'active', plain);
        });
};



var references = {};
references.table = [0];
references.figure = [0];
references.text = [0];

/**
 * 
 * @param {RegEx} match 
 * @param {String} p1 
 */
var handleReferences = function (match, p1) { 
    var output = '';
    if (references.table.indexOf(p1) !== -1){
        output += '<mark name"tableref-' + p1 + '" />';
        output += 'Tabelle <say-as interpret-as="ordinal">' + references.table.indexOf(p1) +'</say-as>';
    } else if (references.figure.indexOf(p1) !== -1) {
        output += '<mark name"figureref-' + p1 + '" />';
        output += 'Abbildung <say-as interpret-as="ordinal">' + references.figure.indexOf(p1) + '</say-as>';
    } else if (references.text.indexOf(p1) !== -1) {
        output += '<mark name"textref-' + p1 + '" />';
        output += '<say-as interpret-as="ordinal">' + references.table.indexOf(p1) + '</say-as>';
    }
    //console.log(match, p1, output)
    return output;
};


/**
 * Throughs the figures away, but return its captions and stores its labels
 * @param {*} str 
 */
var handleFigure = function (match, p1, p2) {
    var res = typeof (p2) === 'number' ? p1 : p2;

    var mark = String(res.match(/label\{(.*?)\}/g)).replace(/label\{/, '').replace(/\}/, '');
    // store label as reference
    if (mark !== undefined && mark.length > 0) {
        references.figure.push(mark);
    }
    res = res.replace("\label{" + mark + "}", '');
    var marklabel = '<mark name"figurelabel-' + mark + '" />';

    var caption = String(res.match(/caption\{(.*?)\}/gm))
        .replace(/caption\{/, '')
        
        ;
    caption = caption.replace(/\\protect/g,'');    
    caption = replaceCitations(caption, true);
    caption = caption.replace(/\\/g, '').replace(/\}/g, '');
    caption = '<mark name"figurecaption-' + caption + '" />';
    return marklabel + caption;
};


/**
 * Throughs the tables away, but return its captions and stores its labels
 * @param {*} str 
 */
var handleTable = function (match, p1, p2) {
    var res = typeof (p2) === 'number' ? p1 : p2;

    var mark = String(res.match(/label\{(.*?)\}/g)).replace(/label\{/, '').replace(/\}/, '');
    // store label as reference
    if(mark !== undefined && mark.length > 0){
        references.table.push(mark);
    }
    res = res.replace("\label{" + mark + "}", '');
    var labelmark = '<mark name"tablelabel-' + mark + '" />';

    var caption = String(res.match(/caption\{(.*?)\}/gm))
        .replace(/caption\{/, '')
        .replace(/\}/g, '')
        .replace(/\\/g, '');
    caption = replaceCitations(caption, true);
    caption = '<mark name"tablecaption-' + caption + '" />';

    return labelmark + caption;
};



/**
 * 
 */
var replaceTags = function (str) {
    var
        item = 0,
        maskQuote = function (match, key, page) {
            return '<break strength="medium" />Zitat<break strength="medium" />' + key + '<break strength="medium" />Zitatende<break strength="medium" />';
        }
        ;


    return str
        // special words
        .replace(/\\patternName\{([^\0]*?)\}/gm, '<mark name="pattern-$1" /><break strength="medium" />$1<break strength="medium" />')
        .replace(/\\mpattern\{([^\0]*?)\}\{([^\0]*?)\}/gm, '<mark name="pattern-$1" /><break strength="medium" />$1: $2<break strength="medium" />')
        .replace(/\\pattern\{([^\0]*?)\}\{([^\0]*?)\}\{([^\0]*?)\}/gm, '<mark name="pattern-desc-$1" /><break strength="medium" />$1: $3<break strength="medium" />')
        .replace(/\\today/g, 'heute')
        .replace(/\$([^\0]*?)\$/g, '$1') // xxx, no math support



        // text styles
        .replace(/\\emph\{([^\0]*?)\}/g, '$1')
        .replace(/\\SS/g, 'Paragraph ')
        .replace(/\\textit\{([^\0]*?)\}/gm, '$1')
        .replace(/\\textsf\{([^\0]*?)\}/gm, '$1')
        .replace(/\\textbf\{([^\0]*?)\}/gm, '$1') // could be more pronounced
        .replace(/\\textsc\{([^\0]*?)\}/gm, "$1")

        // special characters
        .replace(/--/g, '-')
        .replace(/~/g, "")
        .replace(/\\&/g, "und")
        .replace(/\\pm/g, "plus minus")

        // do figures, tables, and labels before the citations and refs.
        .replace(/XXXXXXX\{figure\}([^\0]*?)YYYYYYY\{figure\}/gm, handleFigure)
        .replace(/XXXXXXX\{table\}([^\0]*?)YYYYYYY\{table\}/g, handleTable) // \[([^\0]*?)\]
        .replace(/\\label\{(.*?)\}/g, '<mark name"textlabel-$1" />')

        // References in the text referring on tables, figures and text sections
       
        .replace(/Tab\.\ \\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Tabelle\ \\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Tab\.?\\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Tabelle~\\ref\{([^\0]*?)\}/g, handleReferences)
        //.replace(/Abb\.\ \\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Abb\.?\\ref\{([^\0]*?)\}/gm, handleReferences)
        .replace(/Abbildung?\\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Kapitel\ \\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Kapitel?\\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Abschnitt \\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Abschnitt?\\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Teilabschnitt\ \\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/Teilabschnitt?\\ref\{([^\0]*?)\}/g, handleReferences)
        .replace(/\\ref\{([^\0]*?)\}/g, handleReferences)

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

        // quotes
        .replace(/\x60\x60/g, '') //  `
        .replace(/``/g, '') //  `
        .replace(/\'\'/g, '')
        .replace(/\\glqq /g, '')
        .replace(/\\grqq\~/g, '')
        .replace(/\\grqq/g, '')
        .replace(/\{\\frq\}([^\0]*?){\\flq\}/gm, '$1') // used for nested quotes only
        //.replace(/\{\\\\frq\}([^\0]*?)\{\\\\flq\}/g, '$1')
        //.replace(/\{\\flq\}/g, '') 
        .replace(/\\guillemotleft/g, '')
        .replace(/\\guillemotright\{([^\0]*?)\}/g, '$1')

        .replace(/\\enquote\{([^\0]*?)\}/gm, handleQuote)
        .replace(/\\textquote\{([^\0]*?)\}/g, handleQuote)

        .replace(/XXXXXXX{quote}([^\0]*?)YYYYYYY{quote}/gm, maskQuote) // used for quoted text
        .replace(/XXXXXXX{quotation}([^\0]*?)YYYYYYY{quotation}/gm, '$1') // used for indented paragraphs


        // sepcial sections
        .replace(/XXXXXXX\{discussion\}/g, '<mark name="discussion"/><break strength="strong" /><prosody rate="slow" pitch="low">Diskussion</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{discussion\}/g, '<break strength="strong" />')
        .replace(/XXXXXXX\{discussionInList\}/g, '<mark name="discussion"/><prosody rate="slow" pitch="low">Diskussion</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{discussionInList\}/g, '<break strength="strong" />')
        .replace(/XXXXXXX\{example\}/g, '<mark name="example"/><break strength="strong" /><prosody rate="slow" pitch="low">Beispiel</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{example\}/g, '<break strength="strong" />')
        .replace(/XXXXXXX\{exampleInList\}/g, '<mark name="example"/><prosody rate="slow" pitch="low">Beispiel</prosody><break strength="strong" />')
        .replace(/YYYYYYY\{exampleInList\}/g, '<break strength="strong" />')

        // lists 
        .replace(/XXXXXXX{enumerate}/g, '<break strength="medium" />')
        .replace(/XXXXXXX{enumerate}\[label=\\alph\*\]/g, '')
        .replace(/YYYYYYY{enumerate}/g, '')//'</seq></speak>') //<speak><say-as interpret-as="ordinal">1</say-as></speak>
        .replace(/XXXXXXX{itemize}/g, '<break strength="medium" />')
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
        .replace(/\\url\{([^\0]*?)\}/g, '<mark name="url-$1" />URL')
        .replace(/\\href\{([^\0]*?)\}\{([^\0]*?)\}/g, '<mark name="url-$2" />')
        .replace(/\\link\{([^\0]*?)\}/gm, '<mark name="link-$1" />')
        .replace(/\\link/g, '')
        .replace(/\\book/g, '<mark name="book" />')
        .replace(/\\video\{([^\0]*?)\}/g, '<mark name="video-$1" />')
        .replace(/\\video/g, '<mark name="video" />')
        .replace(/\\videolink\{([^\0]*?)\}/g, '<mark name="video-$1" />')
        .replace(/\\goal/g, '<mark name="icon-goal" />')
        .replace(/\\paper/g, '<mark name="icon-paper" />')
        .replace(/\\quiz/g, '<mark name="icon-quiz" />')
        .replace(/\\discuss/g, '<mark name="icon-discussion" />')

        .replace(/\\includegraphics\[([^\0]*?)\]\{([^\0]*?)\}/gm, '<mark name="image-$2" />')
        .replace(/\\captionof\{figure\}\{([^\0]*?)\}/gm, '<mark name="imagecaption" />$1')
        .replace(/\\captionof\{figure\}/gm, '')
        .replace(/\\captionof\{table\}\{([^\0]*?)\}/gm, '<mark name="tablecaption" />$1')
        .replace(/\\lstinputlisting\[([^\0]*?)\]\{([^\0]*?)\}/gm, '<mark name="listing" />')

        .replace(/XXXXXXX\{flushleft\}([^\0]*?)YYYYYYY\{flushleft\}/g, '')
        .replace(/XXXXXXX\{flushright\}([^\0]*?)YYYYYYY\{flushright\}/g, '$1')
        .replace(/XXXXXXX\{leftbar\}([^\0]*?)YYYYYYY\{leftbar\}/g, '')

        .replace(/\\blfootnote\{([^\0]*?)\}/g, '<mark name="footnote" />') // todo: strip footnote content
        .replace(/\\footnote\{([^\0]*?)\}/g, '<mark name="footnote" />') // todo: strip footnote content

        // todo: handle margin texts, xxx
        .replace(/\\mbox\{([^\0]*?)\}/g, '')
        .replace(/\\randhervor\{([^\0]*?)\}/g, '$1')
        .replace(/\\randnotiz\{([^\0]*?)\}/g, '')
        .replace(/\\marginpar\{([^\0]*?)\}/g, "")
        .replace(/\[label\=\\alph\*\]/g, '')
        .replace(/\]/g, '')
        .replace(/\[/g, '')
        ;
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

        // handle table fragments and listings
        .replace(/XXXXXXX\{tabular\}([^\0]*?)YYYYYYY\{tabular\}/g, '')
        .replace(/XXXXXXX\{lstlisting\}([^\0]*?)YYYYYYY\{lstlisting\}/g, '')

        .replace(/\\newpage/g, "")
        .replace(/\\noindent/g, "")
        .replace(/\\-/g, "")
        .replace(/\\linebreak/g, "")
        .replace(/\\pagebreak/g, "")
        .replace(/\\cleardoublepage/g, "")
        .replace(/\\index\{p\}\{([^\0]*?)\}/g, "") // remove person index
        .replace(/\\index\{o\}\{([^\0]*?)\}/g, "") // remove place index
        .replace(/\\dots/g, '')
        .replace(/\[\\dots\]/g, '')
        .replace(/\.\.\./g, '')
        .replace(/\\cdot/g, '')
        .replace(/\\,/g, ' ')
        .replace(/XXXXXXX\{shaded\}/g, '')
        .replace(/YYYYYYY\{shaded\}/g, '')
        .replace(/XXXXXXX\{shaded\*\}/g, '')
        .replace(/YYYYYYY\{shaded\*\}/g, '')
        .replace(/XXXXXXX\{center\}/g, '')
        .replace(/YYYYYYY\{center\}/g, '')

        .replace(/\\renewcommand\{\\arraystretch\}\{([^\0]*?)\}/g, '')
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

/**
 * name: tex2image
 * description: Generates an image for a given snippet of LaTeX code.
 * author: niels seidel (niels.seidel@fernuni-hagen.de)
 * license: MIT
 * 
 * Note: The latex package has been extended by the option "-shell-escape" at the pdflatex call in order to run convert tex to png images. See texwrapper line 114.
 */

const
    fs = require('fs'),
    preamble = './templates/latex-preamble.tex',
    postamble = '\\end{document}'
    ;

/**
 * 
 */
exports.makeImage = function (tex, filename) {
    // preprocess the input, remove xml tags and substitute placeholders.
    tex = tex
        .replace(/(<([^>]+)>)/ig, '')
        .replace(/XXXXXXX/g, '\\begin')
        .replace(/YYYYYYY/g, '\\end')
        ;  //.replace('<s>', '').replace('<\/s>', '').replace('<p>', '').replace('<\/p>', ''); // 
        latex(tex, filename);
};


/**
 * Generates png files for a give piece of tex code.
 */
var latex = function (latex, filename) {
    var temp = [];

    fs.readFile(preamble, 'utf8', function (err, data) {
        if (err) throw err;
        temp.push(data);
        temp.push(latex);
        temp.push(postamble);
        var options = { command: 'pdflatex', format: 'png' };
        require('latex')(temp, options).pipe(fs.createWriteStream('./output/'+filename));
    });
};

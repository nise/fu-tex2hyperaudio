/**
 * name: index
 * description: hyperaudio authoring environment
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 */

/**
 * http://donsnotes.com/tech/charsets/ascii.html
 */

const
    p = require('./components/tex2SSML'),
    path = '/home/abb/Documents/proj_001_doc/teaching-courses/2017-Gestaltung-kooperativer-Systeme/cvs/Kurs1884/Kurstext/polly/',
    path2 = 'tex/'
    ;
//p.tex2SSML('ke7.tex', path);

//for (var i = 1; i < 8; i++) { p.tex2SSML('ke'+i+'.tex', path); }

//require('./components/experiment').init();


var fs = require('fs');

var input = ;
var output = 'test.pdf'//process.argv[3];
var temp = [];

fs.readFile(input, 'utf8', function (err, data) {
    if (err) throw err;
    console.log('>>> Tex file imported.');
    temp.push(data);
    var options = { 'command': 'pdflatex' };
    require('latex')(temp, options).pipe(fs.createWriteStream(output));
    console.log('>>> Tex file built.');
});


/**
 * name: index
 * description: hyperaudio authoring environment
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 */

/**
 * http://donsnotes.com/tech/charsets/ascii.html
 */

const
    p = require('./tex2SSML'),
    path = '/home/abb/Documents/proj_001_doc/teaching-courses/2017-Gestaltung-kooperativer-Systeme/cvs/Kurs1884/Kurstext/polly/',
    path2 = 'tex/'
    ;
//p.tex2SSML('ke6', path);

//for (var i = 1; i < 8; i++) { p.tex2SSML('ke'+i+'.tex', path); }

require('./experiment').init();


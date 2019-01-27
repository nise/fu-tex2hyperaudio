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
    path2 = 'tex/',
    file = 'ke7.tex'//ke6-utf8.tex
    ;
//p.tex2SSML(file, path);

for (var i = 1; i < 8; i++) { p.tex2SSML('ke'+i+'.tex', path); }

/*
var re = /\b(\w\.\ \w\.|\w\.\w\.)|([.?!])\s+(?=[A-Za-z])/g;
var str = 'Do you know Mrs N. B. from foo e.g. bar? She ist from New York. No! You are wrong.';
var result = str.replace(re, function (m, g1, g2) {
    return g1 ? g1 : g2 + "\r";
});
var arr = result.split("\r");
console.log(arr);
*/
//var d = ' in Abb.~\ref{1-3K} zu  in Abb.~\ref{1-3K} zu  in Abb.~\ref{1-3K} zu  in Abb.~\ref{1-3K} zu ';
//console.log(d.replace(/Abb\.\~\ref\{([^\0]*?)\}/g, '$1'));

//for (var i = 1; i < 8; i++) { p.tex2SSML('ke'+i+'.tex', path2+'1801/'); }
//for (var i = 1; i < 8; i++) { p.tex2SSML('kurseinheit' + i + '.tex', path2 + '1801/'); }

/*var t = 'bst aus, wobei nicht immer explizit in Form ein er Ich - Botschaft gesprochen werden muss.\textquote{ In jeder Nachricht steckt ein Stück Selbstoffenbarung des Senders.Ich wähle den Begriff der Selbstoffenbarung, um damit sowohl die gewollte \emph{ Selbstdarstellung } als auch die unfreiwillige \emph{ Selbstenthüllung } einzuschließen } (ebd.).Beim Lesen dieser Kurseinheit erfahren Sie-- wie schon bei den vorangegangenen Kurseinheiten-- eine Menge über den Autor dieses Kurses.Zwischen den Zeilen lesen Sie vielleicht heraus, dass der Autor das Thema der kooperativen Systeme gerade nicht nur aus technischer Perspektive betrach'
var handleQuote = function (match, capture) {
    return capture;
}*/
//console.log(t  .replace(/emph\{([^\0]*?)\}/g, '$1').replace(/extquote\{([^\0]*?)\}/g, handleQuote));

/**
 *  Performs the Google Text-to-Speech request
 *  todo: cleanup
 */
function t2s(text) {
    // Imports the Google Cloud client library
    const textToSpeech = require('@google-cloud/text-to-speech');

    // Creates a client
    const client = new textToSpeech.TextToSpeechClient();

    // Construct the request
    const request = {
        //input: { text: text },
        input: { ssml: text },
        voice: {
            languageCode: 'de-DE',
            //'name': ' de-DE-Wavenet-B', // gut: de-DE-Wavenet-B
            ssmlGender: 'MALE'
        }, // 
        audioConfig: { audioEncoding: 'MP3' },
    };
    /**
     * German 	Standard 	de-DE 	de-DE-Standard-A 	FEMALE
        German 	Standard 	de-DE 	de-DE-Standard-B 	MALE
        German 	WaveNet 	de-DE 	de-DE-Wavenet-A 	FEMALE
        German 	WaveNet 	de-DE 	de-DE-Wavenet-B 	MALE
        German 	WaveNet 	de-DE 	de-DE-Wavenet-C 	FEMALE
        German 	WaveNet 	de-DE 	de-DE-Wavenet-D 	MALE
     */

    client.synthesizeSpeech(request, (err, response) => {
        if (err) {
            console.error('ERROR:', err);
            return;
        }

        // Write the binary audio content to a local file
        fs.writeFile('output33.mp3', response.audioContent, 'binary', err => {
            if (err) {
                console.error('ERROR:', err);
                return;
            }
            console.log('Audio content written to file: output.mp3');
        });
    });
}

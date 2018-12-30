/**
 * name: index
 * description: hyperaudio authoring environment
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 */


/**
 * http://donsnotes.com/tech/charsets/ascii.html
 */

const
    p = require('./tex2SSML')
    ;

p.tex2SSML();




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

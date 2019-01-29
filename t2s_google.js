/**
 * name: ts2_google
 * description: Interface to Google text-to-speech service
 * author: niels seidel (niels.seidel@fernuni-hagen.de)
 * lisence: MIT
 */
const
    fs = require('fs'),
    GoogleTextToSpeech = require('@google-cloud/text-to-speech'),
    GoogleTextToSpeechClient = new GoogleTextToSpeech.TextToSpeechClient()
    ;


/**
 * Synthesizes short text (less then 3000 characters) into mp3 file
 * @param {Object} params Paramters
 * @param {String} filename Name of the output audio file
 */
exports.synthesizeShortText = function(params, filename) {
    if (params.input.ssml.length > 3000) {
        console.log('Text too large');
        return;
    }
    GoogleTextToSpeechClient.synthesizeSpeech(params, function (err, data) {
        if (err) {
            console.error(err);
        } else if (data) {
            fs.writeFile(filename, data.audioContent, 'binary', err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Saved ' + filename);
            });
        }
    });
};
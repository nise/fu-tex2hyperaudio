/**
 * name: ts2_azure
 * description: Interface to Microsoft TTS services
 * author: niels seidel (niels.seidel@fernuni-hagen.de)
 * lisence: MIT
 * 
 * var t = [
    { lang: 'de-AT', voice:'Michael', gender: 'male'},
    { lang: 'de-CH', voice: 'Karsten', gender: 'male'},
    { lang: 'de-DE', voice: 'Hedda', gender: 'female'},
    { lang: 'de-DE', voice: 'HeddaRUS', gender: 'female'},
    { lang: 'de-DE', voice: 'Stefan', gender: 'male' } //, Apollo
];
 */

const xmlbuilder = require('xmlbuilder');
const request = require('request');
const fs = require('fs');


/* Make sure to update User-Agent with the name of your resource.
   You can also change the voice and output formats. See:
   https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech */
var saveAudio = function (accessToken, params, filename) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', String(params.lang).toLowerCase())
        .ele('voice')
        .att('xml:lang', String(params.lang).toLowerCase())
        .att('name', 'Microsoft Server Speech Text to Speech Voice (' + params.lang +', '+params.voice+')')
        .txt(params.text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();



    //Endpoint: https://westus.api.cognitive.microsoft.com/sts/v1.0

    //Key 1: 39a58cdafdc5442a920d8bf846001bdc

    //Key 2: ba4b966eb1b64d54858f3eb74dd0b2b8

    /* This sample assumes your resource was created in the WEST US region. If you
       are using a different region, please update the uri. */
    let options = {
        method: 'POST',
        baseUrl: 'https://westus.api.cognitive.microsoft.com',//'https://westus.tts.speech.microsoft.com/',
        url: 'sts/v1.0',//'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'hyperaudio recorder', // custome name of the application
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',// ssml-16khz-16bit-mono-tts //'riff-24khz-16bit-mono-pcm', 
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    };
    console.log('get options')
    /* This function makes the request to convert speech to text.
       The speech is returned as the response. */
    function convertText(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log("Converting text-to-speech. Please hold...\n")
        }
        else {
            console.log(response)
            throw new Error(error);
        }
        console.log("Saved file "+ filename)
    }
    // Pipe the response to file.
    request(options, convertText).pipe(fs.createWriteStream(filename));
};


/* This sample assumes your resource was created in the WEST US region. If you
   are using a different region, please update the uri. */
exports.synthesizeShortText = function (params, filename) {
    const subscriptionKey = process.env.AZURE_KEY;
    if (!subscriptionKey) {
        throw new Error('Environment variable for your subscription key is not set.')
    }

    let options = {
        method: 'POST',
        uri: 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    };
    
    function getToken(error, response, body) {
        console.log("Getting your token...\n")
        if (!error && response.statusCode == 200) {
            saveAudio(body, params, filename);
        }
        else {
            throw new Error(error);
        }
    }
    request(options, getToken);
};

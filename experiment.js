/**
 * 
 */

const
    fs = require('fs'),
    AWS = require('aws-sdk'),
    polly = new AWS.Polly({ 'region': 'eu-central-1' }),
    GoogleTextToSpeech = require('@google-cloud/text-to-speech'),
    GoogleTextToSpeechClient = new GoogleTextToSpeech.TextToSpeechClient(),
    textanalysis = require('./textanalysis')
debug = false, // debug modus on/off
    echo = false,
    percentils = [0.10, 0.5, 0.9]
    ;


let
    ssml = '', // Array of sentences
    text_id = '' // document name    
    ;


/**
 * 
 */
exports.init = function () {

    // reset analysis file
    fs.writeFile('./output/text-analysis-all.csv', 'document,id,words,flesh,selected\n', err => { });
    text_id = 'ssml-ke1';
    selectSentencesFromFile(text_id);
};


/**
 * 
 * @param {*} file 
 */
var selectSentencesFromFile = function (file) {
    fs.readFile('./output/' + file + '.xml', 'utf-8', function read(err, data) {
        if (err) {
            throw err;
        }
        ssml = data;
        var fleshIndexPerSentence = textanalysis.analyse(data, file);
        // Get example sentences for certain pecentils
        var selectedSentences = getPercentils(fleshIndexPerSentence, percentils);
        console.log(selectedSentences.selected);
        syntesizeTestFiles(selectedSentences.selected);
    });
};


/**
 * 
 * @param {*} selected 
 */
var syntesizeTestFiles = function (selected) {
    var params = {
        OutputFormat: 'mp3',
        LanguageCode: 'de-DE',
        TextType: 'ssml'
    };
    // speech syntesis with polly
    var voices = ['Hans', 'Marlene', 'Vicki'];
    for (var j = 0; j < voices.length; j++) {
        for (var i = 0; i < selected.length; i++) {
            var m = selected[i];
            params.Text = m.ssml;
            params.VoiceId = voices[j];
            doPolly(params, 'polly-' + voices[j] + '-' + m.ke + '-' + (m.percentil * 100) + '.mp3');
        }
    }

    // speech synthesis with Google, //'name': ' de-DE-Wavenet-B', // gut: de-DE-Wavenet-B
    params = {
        voice: {
            languageCode: 'de-DE'
        }, 
        audioConfig: { audioEncoding: 'MP3' },
    };
    // speech syntesis with polly
    var g_voices = [
        {name: 'de-DE-Standard-A', gender: 'FEMALE'},
        { name: 'de-DE-Wavenet-A', gender: 'FEMALE' },
        { name: 'de-DE-Wavenet-C', gender: 'FEMALE' },
        { name: 'de-DE-Standard-B', gender: 'MALE' },
        { name: 'de-DE-Wavenet-B', gender: 'MALE' },
        { name: 'de-DE-Wavenet-D', gender: 'MALE' }
    ];
    for (var jj = 0; jj < voices.length; jj++) {
        for (var ii = 0; ii < selected.length; ii++) {
            var m = selected[ii];
            params.input = { ssml: m.ssml }; 
            params.voice.name = g_voices[jj].name;
            params.voice.ssmlGender = g_voices[jj].gender;
            doGoogle(params, 'google-' + g_voices[jj] + '-' + m.ke + '-' + (m.percentil * 100) + '.mp3');
        }
    }
};


/**
 * 
 * @param {*} params 
 * @param {*} filename 
 */
var doPolly = function (params, filename) {
    if (params.Text.length > 3000) {
        console.log('Text too large');
        return;
    }
    polly.synthesizeSpeech(params, function (err, data) {
        if (err) {
            console.error(err);
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {
                fs.writeFile("./output/" + filename, data.AudioStream, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("Saved " + filename);
                });
            }
        }
    });
};


/**
 *  Performs the Google Text-to-Speech request
 *  todo: cleanup
 */
function doGoogle(params, filename) {
    if (params.input.ssml.length > 3000) {
        console.log('Text too large');
        return;
    }
    GoogleTextToSpeechClient.synthesizeSpeech(params, function(err, data) {
        if (err) {
            console.error(err);
        } else if (data){
            fs.writeFile('./output/' + filename, data.audioContent, 'binary', err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Saved ' + filename);
            });
        }
    });
}


/**
 * 
 * @param {Array} Array of json objects
 * @param {Array} Array of percentils to given out
 */
var getPercentils = function (json, percentils) {
    var res = [];
    // sort by flesh
    var sentences = json.sort(function (obj1, obj2) {
        return obj1.flesh - obj2.flesh;
    });
    // print percentils
    var l = sentences.length;
    for (var i = 0; i < percentils.length; i++) {
        if (percentils[i] < 1 && percentils[i] > 0) {
            var text = sentences[Math.ceil(l * percentils[i])].text.replace("\n", ' ');
            // set sentence as selected
            sentences[Math.ceil(l * percentils[i])].selected = true;

            if (echo) {
                console.log((percentils[i] * 100) + '% Percentil: ' + text);
            }
            res.push({ ke: text_id, percentil: percentils[i], ssml: getSSMLofString(text) });
            if (getSSMLofString(text) === '') {
                console.log('!!!!!!!!!!!!!!!!!!!', text_id, text);
            }
        }
    }
    return { selected: res, all: sentences };
};


//
/**
 * 
 * @param {Array} word 
 */
var getSSMLofString = function (str) {
    // strip mark tags from ssml
    var ssml_cleaned = ssml.replace(/(<mark([^>]+)>)/ig, "");

    var
        arr = ssml_cleaned.split("<s>"),
        res = ''
        ;
    for (var i = 0; i < arr.length; i++) {
        // strip tags for better comparison
        var text = arr[i].replace(/(<([^>]+)>)/ig, "");
        if (text.substring(str.substring(0, 10))) {
            if (text.includes(str.substring(0, 20))) {
                if (text.includes(str.substring(0, 30))) {
                    res = '<s>' + arr[i].replace("</p>", '').replace("<p>", '').replace("\n", '');
                } else {
                    res = '<s>' + arr[i].replace("</p>", '').replace("<p>", '').replace("\n", '');
                }
            } else {

            }
        }
    }
    return res;
};
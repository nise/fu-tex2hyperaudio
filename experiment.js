/**
 * name: experiement
 * description: Script to prepare data for an text to speech evaluation
 * author: niels seidel (niels.seidel@fernuni-hagen.de)
 * lisence: MIT
 */

const
    fs = require('fs'),
    t2s_google = require('./t2s_google'),
    t2s_aws_polly = require('./t2s_aws_polly'),
    textanalysis = require('./textanalysis'),
    debug = false, // debug modus on/off
    echo = false,
    percentils = [0.10] // , 0.5, 0.9
    ;

let
    ssml = '', // Array of sentences
    text_id = '', // document name  
    testsets = []  
    ;


/**
 * 
 */
exports.init = function () {
    // reset analysis file
    fs.writeFile('./output/text-analysis-all.csv', 'document,id,words,flesh,selected\n', err => { });
    text_id = 'ssml-ke1';
    //selectSentencesFromFile(text_id);
    for (var i = 1; i < 8; i++) { selectSentencesFromFile('ssml-ke' + i, prepareMushraConfig); }
};


/**
 * 
 * @param {*} file 
 */
var selectSentencesFromFile = function (file, callback) {
    fs.readFile('./output/' + file + '.xml', 'utf-8', function read(err, data) {
        if (err) {
            throw err;
        }
        ssml = data;
        var fleshIndexPerSentence = textanalysis.analyse(data, file);
        // Get example sentences for certain pecentils
        var selectedSentences = getPercentils(fleshIndexPerSentence, percentils);
        //console.log(selectedSentences.selected);
        var generatedFiles = syntesizeTestFiles(selectedSentences.selected);

        var testset = {
            "Name": "Set "+file,
            "TestID": "id-"+file,
            "Files": {
                "Reference": "audio/schubert_ref.wav"/*,
                "1": "audio/schubert_1.wav",
                "2": "audio/schubert_2.wav",
                "3": "audio/schubert_3.wav",
                "4": "audio/schubert_anch.wav",*/
            }
        };
        for (var i = 0; i < generatedFiles.length; i++){
            testset.Files['file' + i] = generatedFiles[i];
        }
        testsets.push(testset);
        callback();
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
    var 
        filename = 'trash.mp3'
        output_filename_list = [];
    // speech syntesis with polly
    var voices = ['Hans', 'Marlene', 'Vicki'];
    for (var j = 0; j < voices.length; j++) {
        for (var i = 0; i < selected.length; i++) {
            var m = selected[i];
            params.Text = m.ssml;
            params.VoiceId = voices[j];
            filename = './output/polly-' + voices[j] + '-' + m.ke + '-' + (m.percentil * 100) + '.mp3';
            output_filename_list.push(filename);
            //t2s_aws_polly.synthesizeShortText(params, filename);
        }
    }

    // speech synthesis with Google, //'name': ' de-DE-Wavenet-B', // gut: de-DE-Wavenet-B
    params = {
        'voice': {
            'languageCode': 'de-DE'
        },
        'audioConfig': { 'audioEncoding': 'MP3' },
    };
    // speech syntesis with polly
    var g_voices = [
        { name: 'de-DE-Standard-A', gender: 'FEMALE' },
        { name: 'de-DE-Wavenet-A', gender: 'FEMALE' },
        { name: 'de-DE-Wavenet-C', gender: 'FEMALE' },
        { name: 'de-DE-Standard-B', gender: 'MALE' },
        { name: 'de-DE-Wavenet-B', gender: 'MALE' },
        { name: 'de-DE-Wavenet-D', gender: 'MALE' }
    ];
    for (var jj = 0; jj < g_voices.length; jj++) {
        for (var ii = 0; ii < selected.length; ii++) {
            var m = selected[ii];
            params.input = { 'ssml': '<speak>'+m.ssml+'</speak>' };
            params.voice.name = g_voices[jj].name;
            params.voice.ssmlGender = g_voices[jj].gender;
            filename = './output/google-' + g_voices[jj].name + '-' + m.ke + '-' + (m.percentil * 100) + '.mp3';
            output_filename_list.push(filename);
            //t2s_google.synthesizeShortText(params, filename);
            //console.log(params)
        }
    }
    return output_filename_list;
};


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


/**
 * 
 * @param {String} str 
 */
var getSSMLofString = function (str) {
    var 
        ssml_cleaned = ssml.replace(/(<mark([^>]+)>)/ig, ""), // strip mark tags from ssml
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


/**
 * 
 */
var prepareMushraConfig = function(){
    // prepare mashra config
    var config = require('./output/mushra-config-sample');
    if(testsets.length === 7){
        config.TestConfig.Testsets = testsets;
        console.log(config.TestConfig);
        fs.writeFile('./output/mushra-experiment-config.json', JSON.stringify(config.TestConfig, null, "\t"), function(){});
    }
};
/**
 * name: experiement
 * description: Script to prepare data for an text to speech evaluation
 * author: niels seidel (niels.seidel@fernuni-hagen.de)
 * lisence: MIT
 * 
 * todo: 
 * - synthesized file have different durations: find ./ -type f -exec exiftool {} \; | grep -E "(Duration|Name)"
 */

const
    fs = require('fs'),
    t2s_google = require('./t2s_google'),
    t2s_aws_polly = require('./t2s_aws_polly'),
    textanalysis = require('./textanalysis'),
    debug = false, // debug modus on/off
    echo = false,
    path = './output/audio/',
    percentils = [0.10] // , 0.5, 0.9
    ;

let
    ssml = '', // Array of sentences
    text_id = '', // document name  
    testsets = [],
    testsetLength = 42
    ;


/**
 * 
 */
exports.init = function () {
    // reset analysis file
    fs.writeFile('./output/text-analysis-all.csv', 'document,id,words,flesh,selected\n', err => { });
    text_id = 'ssml-ke1';
    //selectSentencesFromFile(text_id, prepareMushraConfig);
    var promises = [];
    for (var i = 1; i < 8; i++) {
        promises.push(selectSentencesFromFile('ssml-ke' + i, prepareMushraConfig));
    }
    Promise.all(promises)
        .then(function (data) {  })
        .catch(function (err) { /* error handling */ });
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
        var selectedSentences = getPercentils(fleshIndexPerSentence, percentils, file);
        //console.log(selectedSentences.selected);
        var generatedFilenames = syntesizeTestFiles(selectedSentences.selected);
        // ab-test
        
        // generate all possible pairs of files
        var pairs = generatePairs(generatedFilenames);
       
        for (var j = 0; j < pairs.length; j++) {
            var testset = {
                "Name": "Set " + file,
                "TestID": "id-" + file,
                "Files": {}
            };
            //testset.Files = {};
            testset.Files.A = pairs[j][0];
            testset.Files.B = pairs[j][1];
            testsets.push(testset);
        }
        callback();
    });
};


/**
 * Generates all permutations of a give size for a given array
 * @param {Array} a Array of objects
 * @param {Number} min Minimum number
  */
var generatePairs = function (a) {
    var tmp = [];
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < a.length; j++) {
            if (a[i] !== a[j]) {
                if (tmp[a[i] + '---' + a[j]] === undefined && tmp[a[j] + '---' + a[i]] === undefined) {
                    tmp[a[i] + '---' + a[j]] = [a[i], a[j]];
                }
            }
        }
    }
    return Object.values(tmp);
};


/**
 * 
 * @param {*} selected 
 */
var syntesizeTestFiles = function (selected) {
    if (echo) {
        console.log(selected);
    }
    var params = {
        OutputFormat: 'mp3',
        LanguageCode: 'de-DE',
        TextType: 'ssml'
    };
    var
        filename = 'trash.mp3',
        output_filename_list = []
        ;
    // speech syntesis with polly
    var voices = ['Hans', 'Marlene']; // , 'Vicki'
    for (var j = 0; j < voices.length; j++) {
        for (var i = 0; i < selected.length; i++) {
            var m = selected[i];
            params.Text = m.ssml;
            params.VoiceId = voices[j];
            filename = path + 'polly-' + voices[j] + '-' + m.ke + '-' + (m.percentil * 100) + '.mp3';
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
        { name: 'de-DE-Standard-B', gender: 'MALE' },
        { name: 'de-DE-Standard-A', gender: 'FEMALE' } /*,
        { name: 'de-DE-Wavenet-A', gender: 'FEMALE' },
        { name: 'de-DE-Wavenet-C', gender: 'FEMALE' },
        
        { name: 'de-DE-Wavenet-B', gender: 'MALE' },
        { name: 'de-DE-Wavenet-D', gender: 'MALE' }*/
    ];
    for (var jj = 0; jj < g_voices.length; jj++) {
        for (var ii = 0; ii < selected.length; ii++) {
            var m = selected[ii];
            params.input = { 'ssml': '<speak>' + m.ssml + '</speak>' };
            params.voice.name = g_voices[jj].name;
            params.voice.ssmlGender = g_voices[jj].gender;
            filename = path + 'google-' + g_voices[jj].name + '-' + m.ke + '-' + (m.percentil * 100) + '.mp3';
            output_filename_list.push(filename);
            //t2s_google.synthesizeShortText(params, filename);
        }
    } 
    return output_filename_list;
};


/**
 * 
 * @param {Array} Array of json objects
 * @param {Array} Array of percentils to given out
 */
var getPercentils = function (json, percentils, document) {
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
            res.push({ ke: document, percentil: percentils[i], ssml: getSSMLofString(text) });
            if (getSSMLofString(text) === '') {
                console.log('!!!!!!!!!!!!!!!!!!!', document, text);
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
 * Stores a beaqle-node config file
 */
var prepareMushraConfig = function () {
    console.log(testsets)
    // prepare mashra config
    var config = require('../templates/beaqle-ab-config-sample.json');
    if (testsets.length === 42) {
        config.Testsets = testsets;
        fs.writeFile('./output/ab-experiment-config.json', JSON.stringify(config, null, "\t"), function (e, r) {});
    }
};
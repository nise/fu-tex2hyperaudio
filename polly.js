/**
 * name: polly
 * description: Interface to Amazon AWS Polly web services
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 */

var AWS = require('aws-sdk');
var polly = new AWS.Polly({ 'region': config.region });

var config = {
    s3bucket: 'fu-hyperaudio',
    region: 'eu-central-1',
    voice: 'Hans',
    language: 'de-DE'
};


/**
 * Interface to Amazon Polly API
 */
exports.speechSynthesis = function(text, marks = false) {

    var params = {
        OutputFormat: marks ? "json" : "mp3",
        OutputS3BucketName: config.s3bucket,
        Text: text,
        VoiceId: config.voice,
        LanguageCode: config.language,
        /* LexiconNames: [
             'STRING_VALUE',
         ],
         OutputS3KeyPrefix: 'STRING_VALUE',
         SampleRate: 'STRING_VALUE',
         SnsTopicArn: 'STRING_VALUE',*/
        TextType: "ssml"
    };

    if (marks) {
        params.SpeechMarkTypes = ["sentence", "ssml", "word"];
    }
    // listSpeechSynthesisTasks, getSpeechSynthesisTask

    polly.startSpeechSynthesisTask(params, function (err, data) {
        if (err) { console.log(err); }
        else {
            console.log(data.SynthesisTask);
            console.log('https://s3.' + config.region + '.amazonaws.com/' + config.s3bucket + '/' + data.SynthesisTask.TaskId + '.' + (!marks ? "mp3" : "marks"));
            /*polly.getSpeechSynthesisTask({ TaskId: data.TaskId }, function (err, d) { 
                console.log(d); 
            });*/
        }
    });
};
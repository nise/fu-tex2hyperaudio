/**
 * name: ts2_aws_polly
 * description: Interface to Amazon AWS Polly web services
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 * lisence: MIT
 * 
 * **For less than 3000 characters**
    aws polly synthesize-speech \
     --text-type ssml \
     --text file://output.xml \
     --output-format mp3 \
     --voice-id Hans \
     --speech-mark-types='["sentence", "word", "ssml"]' \
    speech.mp3

**large files: sythesize mp3**
aws polly start-speech-synthesis-task \
   --region eu-central-1 \
   --language-code "de-DE" \
   --endpoint-url "https://polly.eu-central-1.amazonaws.com/" \
   --output-format "mp3" \
   --output-s3-bucket-name 'XXXXXXXX' \
   --voice-id "Hans" \
   --text-type "ssml" \
   --text "file://output.xml" \
  
  **large files: create mark file (~ JSON)**
  aws polly start-speech-synthesis-task \
   --region eu-central-1 \
   --language-code "de-DE" \
   --endpoint-url "https://polly.eu-central-1.amazonaws.com/" \
   --output-format "json" \
   --output-s3-bucket-name 'XXXXXXXX' \
   --voice-id "Hans" \
   --text-type "ssml" \
   --text "file://output.xml" \
   --speech-mark-types='["sentence", "word", "ssml"]' \
 */

const
    fs = require('fs'),
    AWS = require('aws-sdk'),
    polly = new AWS.Polly({ 'region': 'eu-central-1' })
    ;


var config = {
    s3bucket: 'fu-hyperaudio',
    region: 'eu-central-1',
    voice: 'Hans',
    language: 'de-DE'
};


/**
 * Synthesizes short text (less then 3000 characters) into mp3 file
 * @param {Object} params Paramters
 * @param {String} filename Name of the output audio file
 */
exports.synthesizeShortText = function (params, filename) {
    if (params.Text.length > 3000) {
        console.log('Text too large');
        return;
    }
    polly.synthesizeSpeech(params, function (err, data) {
        if (err) {
            console.error(err);
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {
                fs.writeFile(filename, data.AudioStream, function (err) {
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
 * Interface to Amazon Polly API
 * @param text {String} The SSML text string to be synthesized.
 * @param marks {Boolean} Flag that indicates creation of a mark file. If true a JSON file with marks will be creaded instead of an audio file.
 */
exports.synthesizeText = function (text, marks = false) {

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
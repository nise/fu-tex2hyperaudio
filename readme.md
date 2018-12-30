

## ToDo
- handle tables: extract from pdf
- handle listing: extract from pdf
- put all files in a container with relative links

# Installation

sudo apt-get install awscli

aws --version

get AWS Access Key ID and Secret Access Key 

aws configure

# Documentation

## Getting started

1. run `npm install`
2. configure the file config.json
3. run `node index`

## Using aws CLI
German voice IDs: Hans, Marlene, Vicki

**For less than 3000 characters**
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
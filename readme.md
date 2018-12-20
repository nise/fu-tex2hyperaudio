

## ToDo
- rename and push repository
- handle tables: extract from pdf
- handle listing: extract from pdf
- convert *.mark to valid hypervideo-JSON format
- put all files in a container with relative links

# Installation

sudo apt-get install awscli

aws --version

get AWS Access Key ID and Secret Access Key 

aws configure

# Run
Voice IDs: Hans, Marlene, Vicki

**For less than 3000 characters**
aws polly synthesize-speech \
--text-type ssml \
--text file://output.xml \
--output-format mp3 \
--voice-id Hans \
--speech-mark-types='["sentence", "word", "ssml"]' \
speech.mp3

**large files**
aws polly start-speech-synthesis-task \
  --region eu-central-1 \
  --language-code "de-DE" \
  --endpoint-url "https://polly.eu-central-1.amazonaws.com/" \
  --output-format "mp3" \
  --output-s3-key-prefix "audio" \
  --voice-id "Hans" \
  --text-type "ssml" \
  --text "file://output.xml" \
  --speech-mark-types='["sentence", "word", "ssml"]' \


    --output-s3-bucket-name 'fu-hyperaudio' \



    /*
    --region eu-central-1 \
      --language-code "de-DE" \
      --endpoint-url "https://polly.eu-central-1.amazonaws.com/" \
      --output-format "mp3" \
      --output-s3-key-prefix "audio" \
      --voice-id "Hans" \
      --text-type "ssml" \
      --text "file://output.xml" \
      --speech-mark-types='["sentence", "word", "ssml"]' \
    
    */
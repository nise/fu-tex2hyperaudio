
tex2hyperaudio is a companion tool for converting LaTex to SSML, SSML into Speech, and Speech into Hyperaudio. 

# Features

* **tex2ssml:** Converts LaTeX (including BibTeX) into the *Speech Synthesis Markup Language* (SSML)
* **Text to Speech Interfaces:** Provides interfaces to text to speech systems like the Amazon Web Service *polly* and Google TTS.
* **textanalysis:** Come with a textanalyis tool to determine the Flesh Readability score for long texts and per sentence.
* **experiment:** Helps to prepare comparative audio experiments for [https://github.com/nise/beaqle-node](beaqle-node) using different voices from the TTS systems mentioned above

## tex2ssml

* headings
* figures
* tables
* references
* citations
* 


# Getting started

1. run `npm install`
2. configure the file config.json
3. run `node index`


# Installation

* Install Amazone webservice client: `sudo apt-get install awscli`

* Test installation: `aws --version`

* get AWS Access Key ID and Secret Access Key 

* Type `aws configure` and enter your Access Key ID and Secret Access Key 


# Roadmap

## ToDo
- handle tables: extract from pdf
- handle listing: extract from pdf
- extract and link images

## nth
- clean linebreaks in Tex-Sources
- correct mistakes in Tex-Sources
- handle math expressions
- put all output files in a container with relative links
- bug: flesh index analysis includes headlines and listings
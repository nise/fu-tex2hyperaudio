/**
 * name: polly
 * description: Interface to Amazon AWS Polly web services
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 * license: MIT
 */

let 
    fs = require('fs'),
    bibliography = require('./bibliography')
    ;

loadMarks('./output/1a88fda7-5abe-42d0-b960-9add69e63250.marks');

let template = {
    "AppName": "hear and learn",
    "AppBeschreibung": "Herzlich Willkommen zu listen and learn, der App zum Lernen via Hyperaudio! Im unteren Bereich finden Sie alle Kurse die zur Verfügung stehen. Sie können entweder auf dieser Seite direkt Kurse auswählen, oder über das Menü zu den einzelnen Kurseinheiten gelangen... Viel Spaß",
    "BingSoundPath": "https://www.myinstants.com/media/sounds/ding-sound-effect_2.mp3",
    "Kurs": [
        {
            "Nummer": "01844",
            "Bezeichnung": "Gestaltung Kooperativer Systeme",
            "Kursbeschreibung": "Online-Communities, gemeinsame Informationsräume, mobile Kooperationswerkzeuge auf SmartPhones oder Anwendungen zur Unterstützung einer gemeinsamen Arbeitsgruppe sind nur einige Beispiele für das breite Feld der kooperativen Systeme. Sie alle haben gemeinsam, dass Menschen unabhängig von Raum und Zeit miteinander computervermittelt interagieren. In diesem Kurs werden Gestaltungskonzepte Kooperativer Systeme anhand von Entwurfsmustern vermittelt. Die Teilnehmenden erlernen, wie in einem partizipativen Entwurfsprozess Interaktionskonzepte und Technologien für Online-Communities entstehen, wie diese auf unterschiedliche technische Rahmenbedingungen (mobil vs. stationär) abgebildet werden können und ein Anwendungskonzept realisiert und eingeführt werden kann. Neben den technischen Aspekten geht es unter anderem auch um Aspekte der Motivation, um Gruppen- und Wissenswahrnehmung in sozialen Informationsräumen und um Aspekte des Vertrauens in gemeinsamen Informationsräumen.",
            "KursID": 0,
            "KEs": [
                {
                    "KEnr": "KE1: Grundlagen und Entwurfstechniken",
                    "VideoID": 0,
                    "Dauer": 1341,
                    "Kurzbeschreibung": "In dieser Kurseinheit widmen wir uns dem Interaktions-Design und lernen zentrale Begriffe und Klassifikationsschemata von kooperativen Systemen kennen. Sie lernen das Konzept des Entwurfsmusters kennen und entwickeln Strategien zur partizipativen Systemgestaltung mit Entwurfsmustern und papierbasierten Prototypen. Abschließend werden wir in einem dritten Teil auf die ethische Verantwortung bei der Gestaltung eines kooperativen Systems eingehen. ",
                    "img": "/static/img/pic-ke1.png",
                    "Pfad": "/static/media/ke1-1_cut_low.mp3",
                    "Inhalt": [
                        {
                            "Name": "1 Einleitung",
                            "StartSecond": 0
                        },
                        {
                            "Name": "1.1. Eine begriffliche Annäherung an den Begriff des Interaktions-Designs",
                            "StartSecond": 373
                        }
                    ]
                }
            ],
            "Abbildungen": [],
            "Audiolinks": [],
            "ExterneLinks": [],
            "Icons": [],
            "Aufzählungen": [],
            "RahmenAufzählungen": [],
            "Beispiele": [],
            "Lernziele": [],
            "Wissen_Artikel": [],
            "Diskussionen": [],
            "Zitate": [],
            "Stichworte": []
        }
    ]
};

/**
 * Loads a *.mark file
 * @param {*} file filename including path
 */
function loadMarks(file){
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.error('ERROR:', err);
        }
        
            var 
                lines = data.split(/xxxx/)
                marks = []
                ;
        
            for(var i=0; i<lines.length-1; i++){
                if(lines[i].length > 0){
                    //lines[i] = lines[i].replace(/\"value\":\"([^\0]*?)\"/g, function(a,b){
                      //  return '"value":"' + encodeURI(b) +'"';
                      //  return '"value":"' + b.replace(/\{/g, '').replace(/\}/g, '') + '"';
                    //});
                    lines[i] = lines[i].replace(/\\n/g, '');
                    lines[i] = lines[i].replace(/\n/g, '');
                    lines[i] = lines[i].replace(/\(/g, '');
                    lines[i] = lines[i].replace(/\)/g, '');
                    lines[i] = lines[i].replace(/\[/g, '');
                    lines[i] = lines[i].replace(/\]/g, '');

                    //console.log(lines[i])
                    try {
                        marks.push(JSON.parse(''+lines[i]));
                    } catch (objError) {
                        if (objError instanceof SyntaxError) {
                            console.error(objError.message);
                            console.log(lines[i])
                        } else {
                            console.error(objError.message);
                        }
                    }
                }
            }
            /*data = JSON.stringify(data);
            data = data.replace(/\\/g, '');
            data = data.replace(/\"(.*?),(.*?)\"/g, '$1 $2');
            data = data.replace(/\}\\n/g, '},\\n');
            data = data.replace(/\t/g, '');
            
            data = data.replace(/\]/g, '');
            data = data.replace(/\[/g, '');
            data = data.replace(/\}n\{/g, '},{');
            //console.log(data)
            data = data.substring(0, data.length - 1);
            data = JSON.parse( '['+ data +']'); //
            console.log(data)
            */
            preprocessMarks(marks);
        
        
    });
}

var 
    word_buffer = [],
    sentence_buffer = [],
    ssml_buffer = []
;

/**
 * Converts Amazon AWS mark data to json
 */
function preprocessMarks(marks){
    // split marks by type and custome subtype
    for (var entry in marks) {
        //console.log(marks[entry])
        switch (marks[entry].type) { 
            case "ssml":
                ssml_buffer.push({ time: marks[entry].time, value: marks[entry].value });
                break;
            case "word":
                word_buffer.push({ time: marks[entry].time, value: marks[entry].value});
                break;
            case "sentence":
                sentence_buffer.push({ time: marks[entry].time, value: marks[entry].value })
                break;
        }
    }
    ssml2hyperaudio(ssml_buffer);
}

/**
 * 
 */
function ssml2hyperaudio(data){ 
    var 
     el, 
     toc = [],
     citations = []
     ;
    for (var entry in data) {
        // toc
        if (data[entry].value.substring(0, 8) === 'chapter-') { 
            toc.push({ name: data[entry].value.substring(8), StartSecond: data[entry].time, level: 1});
        } else if (data[entry].value.substring(0, 8) === 'section-') {
            toc.push({ name: data[entry].value.substring(8), StartSecond: data[entry].time, level: 2 });
        }

        // images

        // citation
        if (data[entry].value.substring(0, 9) === 'citation-') {
            citations.push({ 
                name: data[entry].value.substring(9), 
                StartSecond: data[entry].time, 
                value: bibliography.getPlainCitation(data[entry].value.substring(9)) 
            });
        }
    }
    console.log(citations);
    template.Kurs[0].KEs[0].Inhalt = toc;
    template.Kurs[0].KEs[0].bibliography = citations;
    //console.log(template.Kurs[0].KEs[0]);

    writeHyperaudio(template, './Kurseinheiten.json');
}


/**
 * Writes hypervideo json to disk
 */
function writeHyperaudio(data, filename){
    filename = '/home/abb/Documents/www2/hyperaudioApp/json/Kurseinheiten.json';
    try{
        data = JSON.stringify(data, null, "\t");
        fs.writeFile(filename, data, err => {
            if (err) {
                console.error('ERROR:', err);
                return;
            }
            console.log('Hyperaudio written to file ' + filename);
        });
    }catch(e){

    }
    
}
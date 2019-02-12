/**
 * name: index
 * description: hyperaudio authoring environment
 * author: niels seidel (niels.seidel@fernuni-hagen.de) 
 */

/**
 * http://donsnotes.com/tech/charsets/ascii.html
 */

const
    p = require('./components/tex2SSML'),
    path = '/home/abb/Documents/proj_001_doc/teaching-courses/2017-Gestaltung-kooperativer-Systeme/cvs/Kurs1884/Kurstext/polly/',
    path2 = 'tex/'
    ;
//p.tex2SSML('ke7.tex', path);

/*
var promises =[]; 
for (var i = 1; i < 8; i++) { 
    //promises.push(new Promise(resolve => p.tex2SSML('ke'+i+'.tex', path))); 
    //promises.push(new Promise(resolve => timmer(i))); 
}
Promise.all(promises).then(function (data) { }).catch(function (err) { });

function timmer(i){
    
}


new Promise(
    resolve => function(){
        console.log('resolved')
        setTimeout(console.log(2), 5000);
    },
    reject => function(){
        console.log('failed')
    });
*/


//require('./components/experiment').init();

// // simulate promisses
// function ajax(options) {
//     return new Promise(function (resolve, reject) {
//         console.log('innen').
//         done(resolve);//.fail(reject);
//     });
// }

// ajax({ url: '/' }).then(function (result) {
//     console.log(result);
// });



Endpoint: https://westus.api.cognitive.microsoft.com/sts/v1.0

//Key 1: 39a58cdafdc5442a920d8bf846001bdc

//Key 2: ba4b966eb1b64d54858f3eb74dd0b2b8


require('./components/t2s_azure').synthesizeShortText({ text: 'Hallo schöne Frau.', lang: 'de-AT', voice: 'Michael', gender: 'male' }, 'test-azure.mp3');





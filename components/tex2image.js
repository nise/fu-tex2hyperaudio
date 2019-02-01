
const
    fs = require('fs')
    preamble = '',
    postamble = ''
    ;


exports.makeImage = function(tex, filename){
    tex = tex
        .replace(/(<([^>]+)>)/ig, '')
        .replace(/XXXXXXX/g, '\\begin')
        .replace(/YYYYYYY/g, '\\end')
        ;  //.replace('<s>', '').replace('<\/s>', '').replace('<p>', '').replace('<\/p>', ''); // 
    console.log(tex);
    //fs.writeFile(filenname, data, function(err){});
};

// const vinylfs = require('vinyl-fs');
//
// const sources = vinylfs.src(['**/*.js']);
//
// console.log(sources);
//
// sources.on('data', (d) => console.log(d));

const acorn = require('acorn');
const escodegen = require('escodegen');
var comments = [],
    tokens = [];

const source = `
    import a from 'b';
        const c = require('d');
                console.log('hello world');
function stuff() {
    function k(){
        // hello
    }
    // world
        for(var i = 0; i < 10; i++) {

    }
    var a = 10;
}`;

console.log(source);

const value = acorn.parse(source, {
    sourceType: 'module',
    ranges: true,
    // collect comments in Esprima's format
    onComment: comments,
    // collect token ranges
    onToken: tokens
});
console.log(value);
console.log(comments);
console.log(tokens);
escodegen.attachComments(value, comments, tokens);

const text = escodegen.generate(value, { comment: true });
console.log(text);

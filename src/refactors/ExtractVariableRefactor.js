const AbstractRefactor = require('../AbstractRefactor');

class ExtractVariableRefactor extends AbstractRefactor {
    getEdit(project) {
        const selection = project.getOptions().getSelection();
        console.log(selection.filePath);
        const parse = this.getParsedFile(selection.filePath);
        console.log(parse.ast);
    }
}

module.exports = ExtractVariableRefactor;

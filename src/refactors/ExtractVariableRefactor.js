const AbstractRefactor = require('../AbstractRefactor');
const AstTools = require('../AstTools');

class ExtractVariableRefactor extends AbstractRefactor {
    getEdit(project) {
        const selection = project.getOptions().getSelection();
        console.log(selection);
        const parse = this.getParsedFile(project, selection.filePath);
        console.log(parse.ast);
        this.recurse(parse.ast, selection);
    }

    recurse(node, selection) {
        const children = AstTools.getNodeChildren(node, 'CHILDREN');
        const values = children.map(n => AstTools.nodeContainsSelection(n, selection));
        console.log(node)
        console.log(values)
        children.forEach(n => this.recurse(n, selection));
    }
}

module.exports = ExtractVariableRefactor;

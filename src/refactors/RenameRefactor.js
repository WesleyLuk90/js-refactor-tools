const AbstractRefactor = require('../AbstractRefactor');
const AstTools = require('../AstTools');

class RenameRefactor extends AbstractRefactor {
    apply() {
        const selection = this.project.getOptions().getSelection();
        const parsedFile = this.getParsedFile(selection.filePath, { buildScope: true });
        const node = this.findSelection(parsedFile);

        const variableScope = parsedFile.programScope.getVariableScope(node);
        const uses = variableScope.getVariableUses(node);
        console.log(uses);
    }

    findSelection(parsedFile) {
        const selection = this.project.getOptions().getSelection();

        function recurse(node) {
            let childNodes = node.body;
            if (!childNodes) {
                childNodes = node.declarations;
            }
            if (!childNodes && node.id) {
                childNodes = [node.id];
            }
            if (!childNodes && node.init) {
                childNodes = [node.init];
            }
            if (!childNodes) {
                return node;
            }
            for (let i = 0; i < childNodes.length; i++) {
                if (AstTools.nodeContainsSelection(childNodes[i], selection)) {
                    return recurse(childNodes[i]);
                }
                if (!AstTools.nodeBeforeSelection(childNodes[i], selection)) {
                    throw new Error('Failure');
                }
            }
            throw new Error('Failure');
        }
        return recurse(parsedFile.ast);
    }
}

module.exports = RenameRefactor;

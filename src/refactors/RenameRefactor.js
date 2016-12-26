const AbstractRefactor = require('../AbstractRefactor');
const AstTools = require('../AstTools');
const EditList = require('../edits/EditList');
const Edit = require('../edits/Edit');

class RenameRefactor extends AbstractRefactor {
    getEdit(project) {
        const options = project.getOptions();
        const selection = options.getSelection();
        const parsedFile = this.getParsedFile(project, selection.filePath, { buildScope: true });
        const node = this.findSelection(project, parsedFile);

        const variableScope = parsedFile.programScope.getNodeScope(node);
        const uses = variableScope.getVariableUses(node);

        const editList = new EditList();
        uses.forEach((use) => {
            editList.addEdit(Edit.replace(selection.filePath, use.start, use.end, options.get('newName')));
        });
        return editList;
    }

    findSelection(project, parsedFile) {
        const selection = project.getOptions().getSelection();

        function recurse(node) {
            const childNodes = AstTools.getNodeChildren(node, 'CHILDREN');
            for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                if (AstTools.nodeEqualsSelection(childNode, selection) && childNode.type === 'Identifier') {
                    return childNode;
                }
                if (AstTools.nodeContainsSelection(childNode, selection)) {
                    return recurse(childNode);
                }
            }
            throw new Error(`Failed to find selection ${JSON.stringify(selection)}`);
        }
        return recurse(parsedFile.ast);
    }
}

module.exports = RenameRefactor;

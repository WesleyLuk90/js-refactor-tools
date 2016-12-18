const AbstractRefactor = require('../AbstractRefactor');
const AstTools = require('../AstTools');
const EditList = require('../edits/EditList');
const Edit = require('../edits/Edit');

class RenameRefactor extends AbstractRefactor {
    apply(inputProject) {
        const project = inputProject.clone();
        const options = project.getOptions();
        const selection = options.getSelection();
        const parsedFile = this.getParsedFile(project, selection.filePath, { buildScope: true });
        const node = this.findSelection(project, parsedFile);

        const variableScope = parsedFile.programScope.getVariableScope(node);
        const uses = variableScope.getVariableUses(node);

        const editList = new EditList();
        uses.forEach((use) => {
            editList.addEdit(Edit.replace(selection.filePath, use.start, use.end, options.get('newName')));
        });
        editList.apply(project);

        return project;
    }

    findSelection(project, parsedFile) {
        const selection = project.getOptions().getSelection();

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

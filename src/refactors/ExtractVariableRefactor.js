const AbstractRefactor = require('../AbstractRefactor');
const AstTools = require('../AstTools');
const EditList = require('../edits/EditList');
const escodegen = require('escodegen');
const Edit = require('../edits/Edit');
const Check = require('../Check');

class ExpressionReplacer {
    constructor(rootNode, selection, variableName) {
        this.variableName = Check.isString(variableName);
        this.rootNode = rootNode;
        this.selection = selection;
        this.nodeParents = AstTools.createNodeParents(rootNode);
    }

    getEdits() {
        this.edits = [];
        this.recurse(this.rootNode, this.selection);
        return this.edits;
    }

    replaceExpressionNode(node, value) {
        const sel = this.selection;
        this.edits.push(Edit.replace(sel.filePath, node.start, node.end, value));
    }

    createAssignmentNode(variableName, expression) {
        const assignment = escodegen.generate({
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: variableName },
                init: expression,
            }],
        });
        const insertionPoint = this.getInsertionPoint(expression);
        this.edits.push(
            Edit.replace(this.selection.filePath, insertionPoint, insertionPoint, assignment));
    }

    getInsertionPoint(expression) {
        let parentNode = this.nodeParents.getParent(expression);
        let bodyNode = expression;
        while (parentNode != null && !parentNode.body) {
            bodyNode = parentNode;
            parentNode = this.nodeParents.getParent(parentNode);
        }
        Check.notNull(parentNode);
        return bodyNode.start;
    }

    recurse(node, selection) {
        if (AstTools.nodeEqualsSelection(node, selection)) {
            this.createAssignmentNode(this.variableName, node);
            this.replaceExpressionNode(node, this.variableName);
            return;
        }
        const children = AstTools.getNodeChildren(node, 'CHILDREN');
        children.forEach(n => this.recurse(n, selection));
    }
}

class ExtractVariableRefactor extends AbstractRefactor {
    getEdit(project) {
        const selection = project.getOptions().getSelection();
        const parse = this.getParsedFile(project, selection.filePath);
        const edits = new ExpressionReplacer(parse.ast, selection, project.getOptions().get('variableName')).getEdits();
        return new EditList().addEdits(edits);
    }
}

module.exports = ExtractVariableRefactor;

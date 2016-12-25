const AbstractRefactor = require('../AbstractRefactor');
const EditList = require('../edits/EditList');
const AstTools = require('../AstTools');
const _ = require('lodash');
const Check = require('../Check');
const escodegen = require('escodegen');
const Edit = require('../edits/Edit');

class FunctionReplacer {
    constructor(rootNode, selection, functionName, filePath) {
        this.rootNode = Check.notNull(rootNode);
        this.selection = Check.notNull(selection);
        this.functionName = Check.isString(functionName);
        this.filePath = Check.isString(filePath);
        this.parentNodes = AstTools.createNodeParents(rootNode);
    }

    recurse(node) {
        const children = AstTools.getNodeChildren(node, 'CHILDREN');
        const start = this.getStartNode(children);
        const end = this.getEndNode(children);
        if (start && end) {
            const childrenSlice = this.getChildrenSlice(children, start, end);
            this.replaceNodes(node, childrenSlice);
            return;
        }
        children.forEach(child => this.recurse(child));
    }

    getChildrenSlice(children, start, end) {
        const startIndex = children.indexOf(start);
        Check.that(startIndex > -1);
        const endIndex = children.indexOf(end);
        Check.that(endIndex > -1);
        Check.that(endIndex > startIndex);
        const childrenSlice = children.slice(startIndex, endIndex + 1);
        return childrenSlice;
    }

    replaceNodes(parentNode, childrenSlice) {
        const content = this.generateFunctionDeclaration(childrenSlice);
        let a = parentNode;
        let childNode = childrenSlice[0];
        while (!AstTools.hasStatements(a)) {
            childNode = a;
            a = this.parentNodes.getParent(a);
        }

        this.edits.push(this.generateReplaceCode(childrenSlice));
        this.edits.push(Edit.insert(this.filePath, childNode.start, content));
    }

    generateReplaceCode(childrenSlice) {
        const callExpression = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: this.functionName },
                arguments: [],
            },
        };
        const content = escodegen.generate(callExpression);
        return Edit.replace(this.filePath, _(childrenSlice).first().start,
            _(childrenSlice).last().end, content);
    }

    generateFunctionDeclaration(bodyNodes) {
        const body = {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: this.functionName },
            params: [],
            body: {
                type: 'BlockStatement',
                body: bodyNodes,
            },
        };
        const content = escodegen.generate(body);
        return content;
    }

    getStartNode(nodes) {
        return _(nodes)
            .filter(n => n.start === this.selection.start)
            .first();
    }


    getEndNode(nodes) {
        return _(nodes)
            .filter(n => n.end === this.selection.end)
            .first();
    }

    getEdits() {
        this.edits = [];
        this.recurse(this.rootNode);
        return this.edits;
    }
}

class ExtractFunctionRefactor extends AbstractRefactor {
    getEdit(project) {
        const selection = project.getOptions().getSelection();
        const file = this.getParsedFile(project, selection.filePath);
        const functionName = project.getOptions().get('functionName');
        const functionReplacer = new FunctionReplacer(file.ast, selection,
            functionName, selection.filePath);
        return new EditList().addEdits(functionReplacer.getEdits());
    }
}

module.exports = ExtractFunctionRefactor;

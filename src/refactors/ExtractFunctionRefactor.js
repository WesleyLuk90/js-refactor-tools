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

    replaceNodes(parentNode, functionBody) {
        let insertableParent = parentNode.type === 'Program' ? parentNode : this.parentNodes.getParent(parentNode);
        let childNode = parentNode.type === 'Program' ? functionBody[0] : parentNode;
        while (!AstTools.canInsertFunction(insertableParent)) {
            childNode = insertableParent;
            insertableParent = this.parentNodes.getParent(insertableParent);
        }
        const functionDeclarationType = this.getFunctionDeclarationType(insertableParent);
        this.edits.push(this.generateFunctionCallEdit(functionBody, functionDeclarationType));
        this.edits.push(this.generateFunctionDeclarationEdit(childNode.start,
            functionBody, functionDeclarationType));
    }

    generateFunctionDeclarationEdit(insertionPoint, functionBody, functionDeclarationType) {
        const content = this.generateFunctionDeclaration(functionBody, functionDeclarationType);
        return Edit.insert(this.filePath, insertionPoint, content);
    }

    getFunctionDeclarationType(parentNode) {
        if (parentNode.type === 'ClassBody') {
            return 'MethodDefinition';
        }
        return 'FunctionDeclaration';
    }

    generateFunctionCallExpression(functionBody, type) {
        let callee;
        if (type === 'MethodDefinition') {
            callee = {
                type: 'MemberExpression',
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: this.functionName },
            };
        } else {
            callee = { type: 'Identifier', name: this.functionName };
        }
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee,
                arguments: [],
            },
        };
    }

    generateFunctionCallEdit(functionBody, type) {
        const content = escodegen.generate(this.generateFunctionCallExpression(functionBody, type));
        return Edit.replace(this.filePath, _(functionBody).first().start,
            _(functionBody).last().end, content);
    }

    generateFunctionDeclaration(bodyNodes, type) {
        if (type === 'MethodDefinition') {
            const body = {
                type: 'MethodDefinition',
                key: { type: 'Identifier', name: this.functionName },
                params: [],
                kind: 'method',
                value: {
                    type: 'functionExpression',
                    body: {
                        type: 'BlockStatement',
                        body: bodyNodes,
                    },
                    params: [],
                },
            };
            const content = escodegen.generate(body);
            return content;
        } else {
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

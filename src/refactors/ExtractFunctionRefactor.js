const AbstractRefactor = require('../AbstractRefactor');
const EditList = require('../edits/EditList');
const AstTools = require('../AstTools');
const _ = require('lodash');
const Check = require('../Check');
const escodegen = require('escodegen');
const Edit = require('../edits/Edit');
const ProgramScope = require('../scope/ProgramScope');

class FunctionReplacer {
    constructor(rootNode, selection, programScope, functionName, filePath) {
        this.rootNode = Check.notNull(rootNode);
        this.selection = Check.notNull(selection);
        this.functionName = Check.isString(functionName);
        this.filePath = Check.isString(filePath);
        this.parentNodes = AstTools.createNodeParents(rootNode);
        this.programScope = Check.isInstanceOf(programScope, ProgramScope);
    }

    recurse(node) {
        const children = AstTools.getNodeChildren(node, 'CHILDREN');
        const start = this.getStartNode(children);
        const end = this.getEndNode(children);
        if (start && end) {
            const childrenSlice = this.getChildrenSlice(children, start, end);
            const parameters = this.findRequiredVariables(node, childrenSlice);
            const returnValues = this.findReturnValues(node, childrenSlice);
            this.replaceNodes(node, childrenSlice, parameters);
            return;
        }
        children.forEach(child => this.recurse(child));
    }

    findRequiredVariables(parentNode, nodeList) {
        const targetScope = this.programScope.getNodeScope(
            this.getInsertBeforeNode(parentNode, nodeList));
        const variables = [];
        const recurse = (node) => {
            if (AstTools.isVariableReference(node)) {
                const nodeScope = this.programScope.getNodeScope(node);
                const variable = nodeScope.getVariableByName(node.name);
                if (variable.hasDeclaration()) {
                    const variableScope = this.programScope.getNodeScope(variable.getDeclaration());
                    if (variableScope.isDescendantOf(targetScope) &&
                        !this.variableIsDeclaredIn(variable.getDeclaration(), nodeList)) {
                        variables.push(node);
                    }
                }
            }
            const children = AstTools.getNodeChildren(node, 'CHILDREN');
            children.forEach(c => recurse(c));
        };

        nodeList.forEach(n => recurse(n));
        return variables;
    }

    findReturnValues(node, childrenSlice) {
        const nodeChildren = _(AstTools.getNodeChildren(node, 'CHILDREN'));
        const nodeChildrenIndex = nodeChildren.indexOf(_(childrenSlice).last());
        Check.that(nodeChildrenIndex > -1);
        const afterChildren = nodeChildren.slice(nodeChildrenIndex + 1).value();
        console.log(afterChildren);
    }

    variableIsDeclaredIn(variable, nodeList) {
        const declaredIn = node =>
            node === variable ||
            AstTools.getNodeChildren(node, 'CHILDREN').some(n => declaredIn(n));
        return nodeList.some(n => declaredIn(n));
    }

    getChildrenSlice(children, start, end) {
        const startIndex = children.indexOf(start);
        Check.that(startIndex > -1);
        const endIndex = children.indexOf(end);
        Check.that(endIndex > -1);
        Check.that(endIndex >= startIndex);
        const childrenSlice = children.slice(startIndex, endIndex + 1);
        return childrenSlice;
    }

    getInsertBeforeNode(parentNode, functionBody) {
        let insertableParent = parentNode.type === 'Program' ? parentNode : this.parentNodes.getParent(parentNode);
        let childNode = parentNode.type === 'Program' ? functionBody[0] : parentNode;
        while (!AstTools.canInsertFunction(insertableParent)) {
            childNode = insertableParent;
            insertableParent = this.parentNodes.getParent(insertableParent);
        }
        return childNode;
    }

    replaceNodes(parentNode, functionBody, parameters) {
        const insertBefore = this.getInsertBeforeNode(parentNode, functionBody);
        const insertableParent = this.parentNodes.getParent(insertBefore);
        const functionDeclarationType = this.getFunctionDeclarationType(insertableParent);
        this.edits.push(this.generateFunctionCallEdit(functionBody, parameters,
            functionDeclarationType));
        this.edits.push(this.generateFunctionDeclarationEdit(insertBefore.start,
            functionBody, parameters, functionDeclarationType));
    }

    generateFunctionDeclarationEdit(insertionPoint, functionBody, parameters,
        functionDeclarationType) {
        const content = this.generateFunctionDeclaration(functionBody, parameters,
            functionDeclarationType);
        return Edit.insert(this.filePath, insertionPoint, content);
    }

    getFunctionDeclarationType(parentNode) {
        if (parentNode.type === 'ClassBody') {
            return 'MethodDefinition';
        }
        return 'FunctionDeclaration';
    }

    generateFunctionCallExpression(functionBody, parameters, type) {
        Check.isString(type);
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
                arguments: parameters,
            },
        };
    }

    generateFunctionCallEdit(functionBody, parameters, type) {
        const content = escodegen.generate(
            this.generateFunctionCallExpression(functionBody, parameters, type));
        return Edit.replace(this.filePath, _(functionBody).first().start,
            _(functionBody).last().end, content);
    }

    generateFunctionDeclaration(bodyNodes, parameters, type) {
        Check.isString(type);
        if (type === 'MethodDefinition') {
            const body = {
                type: 'MethodDefinition',
                key: { type: 'Identifier', name: this.functionName },
                params: parameters,
                kind: 'method',
                value: {
                    type: 'FunctionExpression',
                    body: {
                        type: 'BlockStatement',
                        body: bodyNodes,
                    },
                    params: parameters,
                },
            };
            const content = escodegen.generate(body);
            return content;
        } else {
            const body = {
                type: 'FunctionDeclaration',
                id: { type: 'Identifier', name: this.functionName },
                params: parameters,
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
        const file = this.getParsedFile(project, selection.filePath, { buildScope: true });
        const functionName = project.getOptions().get('functionName');
        const functionReplacer = new FunctionReplacer(file.ast, selection, file.programScope,
            functionName, selection.filePath);
        return new EditList().addEdits(functionReplacer.getEdits());
    }
}

module.exports = ExtractFunctionRefactor;

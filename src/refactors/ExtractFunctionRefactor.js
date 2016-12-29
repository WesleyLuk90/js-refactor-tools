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
            const assignedVariables = this.findAssignedToVariables(childrenSlice);
            const accessedVariables = this.filterAccessedVariables(node, childrenSlice, assignedVariables);
            if (accessedVariables.length > 1) {
                throw new Error('More than one variable is assigned to');
            }
            this.replaceNodes(node, childrenSlice, parameters, accessedVariables[0]);
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

    findAssignedToVariables(nodeSlice) {
        const variables = [];
        AstTools.walkNodeChildren(nodeSlice, (n) => {
            console.log(n);
            if (AstTools.isVariableAssignment(n)) {
                variables.push(Check.notNull(n.id));
            }
        });
        return variables;
    }

    filterAccessedVariables(node, childrenSlice, assignedVariables) {
        const nodeChildren = _(AstTools.getNodeChildren(node, 'CHILDREN'));
        const nodeChildrenIndex = nodeChildren.indexOf(_(childrenSlice).last());
        Check.that(nodeChildrenIndex > -1);
        const afterChildren = nodeChildren.slice(nodeChildrenIndex + 1).value();
        const accessedChildren = new Set();
        AstTools.walkNodeChildren(afterChildren, (n) => {
            if (n.type === 'Identifier') {
                accessedChildren.add(n);
            }
        });
        return assignedVariables.filter((identifiers) => {
            const scope = this.programScope.getNodeScope(identifiers);
            const variable = scope.getVariableByName(identifiers.name);
            return variable.getUses().some(u => accessedChildren.has(u));
        });
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

    replaceNodes(parentNode, functionBody, parameters, returnVariable) {
        const insertBefore = this.getInsertBeforeNode(parentNode, functionBody);
        const insertableParent = this.parentNodes.getParent(insertBefore);
        const functionDeclarationType = this.getFunctionDeclarationType(insertableParent);
        this.edits.push(this.generateFunctionCallEdit(functionBody, parameters,
            functionDeclarationType, returnVariable));
        this.edits.push(this.generateFunctionDeclarationEdit(insertBefore.start,
            functionBody, parameters, functionDeclarationType, returnVariable));
    }

    generateFunctionDeclarationEdit(insertionPoint, functionBody, parameters,
        functionDeclarationType, returnVariable) {
        const content = this.generateFunctionDeclaration(functionBody, parameters,
            functionDeclarationType, returnVariable);
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
            type: 'CallExpression',
            callee,
            arguments: parameters,
        };
    }

    generateFunctionCallEdit(functionBody, parameters, type, returnVariable) {
        const functionCall = this.generateFunctionCallExpression(functionBody, parameters, type);
        const assignedFunctionCall = this.assignToVariable(functionCall, returnVariable);
        const content = escodegen.generate(assignedFunctionCall);
        return Edit.replace(this.filePath, _(functionBody).first().start,
            _(functionBody).last().end, content);
    }

    assignToVariable(functionCall, variable) {
        if (!variable) {
            return {
                type: 'ExpressionStatement',
                expression: functionCall,
            };
        }
        return {
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                start: 6,
                end: 12,
                id: variable,
                init: functionCall,
            }],
            kind: 'const',
        };
    }

    generateFunctionDeclaration(bodyNodes, parameters, type, returnVariable) {
        Check.isString(type);
        if (returnVariable) {
            bodyNodes.push({
                type: 'ReturnStatement',
                argument: returnVariable,
            });
        }
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

const ProgramScope = require('./ProgramScope');
const AstTools = require('../AstTools');

class ScopeBuilder {
    constructor(ast) {
        this.ast = ast;
    }

    build() {
        const programScope = new ProgramScope();
        const rootScope = programScope.getRootScope();
        this._process(this.ast, rootScope);
        return programScope;
    }

    _process(node, scope, parentNode) {
        if (!this._defineVariables(node, scope, parentNode)) {
            this._loadVariables(node, scope);
        }
        const children = this._getChildren(node);
        children.forEach(child => this._process(child, scope, node));

        const scopedChildren = this._getScopedChildren(node);
        if (scopedChildren.length > 0) {
            const childScope = scope.createChildScope();
            scopedChildren.forEach(child => this._process(child, childScope, node));
        }
    }

    _defineVariables(node, scope, parentNode) {
        switch (node.type) {
            case 'Identifier':
                if (parentNode.type === 'FunctionDeclaration' || parentNode.type === 'VariableDeclarator') {
                    scope.defineVariable(node);
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    _loadVariables(node, scope) {
        switch (node.type) {
            case 'Identifier':
                scope.addVariableUse(node);
                return true;
            default:
                return false;
        }
    }

    _wrapNode(...nodes) {
        const arrayNodes = [];
        nodes.forEach((n) => {
            if (n) {
                if (Array.isArray(n)) {
                    arrayNodes.push(...n);
                } else {
                    arrayNodes.push(n);
                }
            }
        });
        return arrayNodes;
    }

    _getChildren(node) {
        if (node.type === 'FunctionDeclaration') {
            return AstTools.getNodeChildren(node, 'FUNCTION_CHILDREN');
        } else {
            return AstTools.getNodeChildren(node, 'CHILDREN');
        }
    }

    _getScopedChildren(node) {
        if (node.type === 'FunctionDeclaration') {
            return AstTools.getNodeChildren(node, 'FUNCTION_SCOPED_CHILDREN');
        } else {
            return [];
        }
    }
}

module.exports = ScopeBuilder;

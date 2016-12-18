const Check = require('../Check');
const Variable = require('./Variable');

class Scope {
    constructor(programScope, parentScope) {
        this.programScope = programScope;
        this.parentScope = parentScope;

        this.variablesByName = new Map();
        this.variableDeclarations = new Map();
        this.childScopes = [];

        if (parentScope) {
            parentScope.addChildScope(this);
        }
    }

    getVariableByName(name) {
        const variable = this.variablesByName.get(name);
        if (variable) {
            return variable;
        }
        if (!this.parentScope) {
            throw new Error(`Failed to find variable with name '${name}'`);
        }
        return this.parentScope.getVariableByName(name);
    }

    defineVariable(node) {
        const variable = new Variable(node);

        this.variablesByName.set(variable.getName(), variable);
        this.variableDeclarations.set(node, variable);

        this.programScope.setVariableScope(node, this);
    }

    addVariableUse(node) {
        Check.isString(node.name);
        const variable = this.getVariableByName(node.name);
        variable.addUse(node);

        this.programScope.setVariableScope(node, this);
    }

    getVariableUses(node) {
        return this.variableDeclarations.get(node).getUses();
    }

    createChildScope() {
        return new Scope(this.programScope, this);
    }

    addChildScope(child) {
        this.childScopes.push(child);
    }

    getChildScopes() {
        return this.childScopes;
    }
}

module.exports = Scope;

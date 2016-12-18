const Check = require('../Check');
const Variable = require('./Variable');

class Scope {
    constructor(programScope, parentScope) {
        this.programScope = programScope;
        this.parentScope = parentScope;

        this.variablesByName = new Map();
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

    getOrCreateVariable(name) {
        Check.isString(name);
        if (!this.variablesByName.has(name)) {
            this.variablesByName.set(name, new Variable(name));
        }
        return this.variablesByName.set(name);
    }

    defineVariable(node) {
        const variable = this.getOrCreateVariable(Variable.getName(node));

        variable.setDeclaration(node);
        this.variableDeclarations.set(node, variable);

        this.programScope.setVariableScope(node, this);
    }

    addVariableUse(node) {
        const variable = this.getOrCreateVariable(Variable.getName(node));

        variable.addUse(node);

        this.programScope.setVariableScope(node, this);
    }

    getVariableUses(node) {
        throw new Error();
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

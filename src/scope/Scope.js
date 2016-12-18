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
        return variable;
    }

    getOrCreateVariable(name) {
        Check.isString(name);
        if (!this.variablesByName.has(name)) {
            this.variablesByName.set(name, new Variable(name));
        }
        return this.variablesByName.get(name);
    }

    defineVariable(node) {
        const variable = this.getOrCreateVariable(Variable.getName(node));

        variable.setDeclaration(node);

        this.programScope.setVariableScope(node, this);
    }

    addVariableUse(node) {
        const variable = this.getOrCreateVariable(Variable.getName(node));

        variable.addUse(node);

        this.programScope.setVariableScope(node, this);
    }

    declaresVariableWithName(name) {
        const variable = this.getVariableByName(name);
        return !!variable && variable.hasDeclaration();
    }

    getVariableUses(node) {
        const name = Variable.getName(node);
        const variable = this.getVariableByName(name);
        let uses = [];
        if (variable) {
            uses = variable.getUses();
        }
        const childrenUses = this.getChildScopes()
            .filter(s => !s.declaresVariableWithName(name))
            .map(s => s.getVariableUses(node));
        return uses.concat(...childrenUses);
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

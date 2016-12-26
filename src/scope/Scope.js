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
    }

    addVariableUse(node) {
        const variable = this.getOrCreateVariable(Variable.getName(node));

        variable.addUse(node);
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

    addNode(node) {
        this.programScope.setNodeScope(node, this);
    }

    isRoot() {
        return this.parentScope == null;
    }

    getParent() {
        return this.parentScope;
    }

    isAncestorOf(otherScope) {
        Check.isInstanceOf(otherScope, Scope);
        if (otherScope.isRoot()) {
            return false;
        }
        if (otherScope.getParent() === this) {
            return true;
        }
        return this.isAncestorOf(otherScope.getParent());
    }

    isDescendantOf(otherScope) {
        Check.isInstanceOf(otherScope, Scope);
        if (this.isRoot()) {
            return false;
        }
        if (this.getParent() === otherScope) {
            return true;
        }
        return this.getParent().isDescendantOf(otherScope);
    }
}

module.exports = Scope;

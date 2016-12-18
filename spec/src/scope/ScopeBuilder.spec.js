const ScopeBuilder = require('../../../src/scope/ScopeBuilder');
const AstTools = require('../../../src/AstTools');

fdescribe('ScopeBuilder', () => {
    const program = `
function thing(parameter) {
    variable += 1;
    thing(variable2, variable2);
}
var variable = 10;
var variable2 = 10;
variable2 += 10;
`;
    let ast;
    let scopeBuilder;
    let programScope;
    beforeEach(() => {
        ast = AstTools.parse(program);
        scopeBuilder = new ScopeBuilder(ast);
        programScope = scopeBuilder.build();
    });

    function findVariableWithName(name, scope) {
        const currentScope = scope || programScope.getRootScope();
        if (currentScope.getVariableByName(name)) {
            return currentScope.getVariableByName(name);
        }
        const childScopes = currentScope.getChildScopes();
        for (let i = 0; i < childScopes.length; i++) {
            const variable = childScopes[i].findVariableWithName(name);
            if (variable) {
                return variable;
            }
        }
        return null;
    }

    it('should store declared variables', () => {
        const variable = findVariableWithName('variable');
        const variableDeclaration = variable.getDeclaration();
        expect(variableDeclaration.id.name).toBe('variable');
        expect(variableDeclaration.type).toBe('VariableDeclarator');
    });

    it('should find module scoped variables', () => {
        const variable = findVariableWithName('variable');
        const variableDeclaration = variable.getDeclaration();
        const scope = programScope.getVariableScope(variableDeclaration);
        const variableUses = scope.getVariableUses(variableDeclaration);
        expect(variableUses.length).toBe(2);
        expect(variableUses[0]).toBe(variableDeclaration);
        expect(programScope.getVariableScope(variableUses[1])).not.toBe(scope);
    });

    it('should store functions as variables', () => {
        const func = findVariableWithName('thing');
        const funcDeclaration = func.getDeclaration();
        const scope = programScope.getVariableScope(funcDeclaration);
        expect(scope).toBe(programScope.getRootScope());
        const variableUses = scope.getVariableUses(funcDeclaration);
        expect(variableUses.length).toBe(2);
        expect(programScope.getVariableScope(variableUses[1])).not.toBe(scope);
    });

    it('should find variables used as function parameters', () => {
        const variable = findVariableWithName('variable2');
        const variableDeclaration = variable.getDeclaration();
        const scope = programScope.getVariableScope(variableDeclaration);
        expect(scope).toBe(programScope.getRootScope());
        const variableUses = scope.getVariableUses(variableDeclaration);
        expect(variableUses.length).toBe(4);
        expect(programScope.getVariableScope(variableUses[1])).toBe(scope);
        const use2Scope = programScope.getVariableScope(variableUses[2]);
        const use3Scope = programScope.getVariableScope(variableUses[3]);
        expect(use2Scope).not.toBe(scope);
        expect(use2Scope).toBe(use3Scope);
    });
});

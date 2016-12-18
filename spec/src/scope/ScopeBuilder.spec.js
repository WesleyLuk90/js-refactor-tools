const ScopeBuilder = require('../../../src/scope/ScopeBuilder');
const AstTools = require('../../../src/AstTools');

describe('ScopeBuilder', () => {
    let ast;
    let scopeBuilder;
    let programScope;

    function buildWithProgram(program) {
        ast = AstTools.parse(program);
        scopeBuilder = new ScopeBuilder(ast);
        programScope = scopeBuilder.build();
    }

    function findVariableWithName(name, scope) {
        const currentScope = scope || programScope.getRootScope();
        if (currentScope.getVariableByName(name)) {
            return currentScope.getVariableByName(name);
        }
        const childScopes = currentScope.getChildScopes();
        for (let i = 0; i < childScopes.length; i++) {
            const variable = childScopes[i].getVariableByName(name);
            if (variable) {
                return variable;
            }
        }
        return null;
    }

    function getScopeDeclaringVariable(name) {
        const variable = findVariableWithName(name);
        const variableNode = variable.getDeclaration();
        return programScope.getVariableScope(variableNode);
    }

    it('should get declared variables', () => {
        buildWithProgram('var a;');
        const variable = findVariableWithName('a');
        expect(variable.hasDeclaration()).toBe(true);
        const variableDeclaration = variable.getDeclaration();
        expect(variableDeclaration.type).toBe('Identifier');
        expect(variable.getUses()).toEqual([variableDeclaration]);
        expect(programScope.getVariableScope(variableDeclaration))
            .toEqual(programScope.getRootScope());
    });

    it('should store all uses of a variable', () => {
        buildWithProgram('var a; a = 20; function b() { a = 10; }');
        const variable = findVariableWithName('a');
        const variableNode = variable.getDeclaration();
        const variableScope = programScope.getVariableScope(variableNode);
        expect(variableScope.getVariableUses(variableNode).length).toBe(3);
    });

    it('should declare a variable if used as a function parameter in a child scope', () => {
        buildWithProgram('function a(b) {}');
        expect(getScopeDeclaringVariable('b')).not.toEqual(programScope.getRootScope());
    });

    it('should not include redeclared variables', () => {
        buildWithProgram('var a; a + 20; function b(a) { a + 30; }');
        const variable = findVariableWithName('a');
        const variableNode = variable.getDeclaration();
        const variableScope = programScope.getVariableScope(variableNode);
        expect(variableScope.getVariableUses(variableNode).length).toBe(2);
    });

    it('should declare functions in a different scope than the parameters and body', () => {
        buildWithProgram('function a(b) { var c; }');
        expect(getScopeDeclaringVariable('a')).not.toBe(getScopeDeclaringVariable('b'));
        expect(getScopeDeclaringVariable('b')).toBe(getScopeDeclaringVariable('c'));
    });

    it('should find variables used in expressions', () => {
        buildWithProgram('var a; var b = a + 10; function c() { return a;};');
        const variable = findVariableWithName('a');
        const variableNode = variable.getDeclaration();
        const variableScope = programScope.getVariableScope(variableNode);
        expect(variableScope.getVariableUses(variableNode).length).toBe(3);
    });
});

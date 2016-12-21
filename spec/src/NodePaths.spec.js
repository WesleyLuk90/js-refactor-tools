const NodePaths = require('../../src/NodePaths');

describe('NodePaths', () => {
    it('should nodify an import path', () => {
        expect(NodePaths.nodifyPath('./some/where')).toEqual('./some/where');
        expect(NodePaths.nodifyPath('./some/where.js')).toEqual('./some/where');
        expect(NodePaths.nodifyPath('../some/where')).toEqual('../some/where');

        expect(NodePaths.nodifyPath('./some/where.jsx', ['.jsx'])).toEqual('./some/where');

        expect(NodePaths.nodifyPath('some/where')).toEqual('./some/where');

        expect(NodePaths.nodifyPath('some\\where')).toEqual('./some/where');
    });

    it('should generate an import path', () => {
        expect(NodePaths.importPath('/some/file.js', '/other/file/here.js')).toBe('../other/file/here');
        expect(NodePaths.importPath('/file.js', '/other/file/here.js')).toBe('./other/file/here');
    });

    it('should resolve paths', () => {
        expect(NodePaths.resolvePath('/some/file', './relative/place').map(NodePaths.normalizeSlashes))
            .toEqual(['/some/relative/place.js', '/some/relative/place.json', '/some/relative/place']);
        expect(NodePaths.resolvePath('/some/file', './relative/place', ['.a', '.b']).map(NodePaths.normalizeSlashes))
            .toEqual(['/some/relative/place.a', '/some/relative/place.b', '/some/relative/place']);
    });
});

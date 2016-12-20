const path = require('path');

class NodePaths {
    static normalizeSlashes(filePath) {
        return filePath.replace(/\\/g, '/');
    }

    static nodifyPath(filePath, optionalStrippableExtensions) {
        const strippableExtensions = optionalStrippableExtensions ||
            NodePaths.getDefaultStrippableExtensions();
        let nodeifiedPath = this.normalizeSlashes(filePath);
        if (nodeifiedPath.charAt(0) !== '.') {
            nodeifiedPath = `./${nodeifiedPath}`;
        }
        const matchingExtension = strippableExtensions.filter(e => nodeifiedPath.endsWith(e))[0];
        if (matchingExtension) {
            nodeifiedPath = nodeifiedPath
                .substring(0, nodeifiedPath.length - matchingExtension.length);
        }
        return nodeifiedPath;
    }

    static importPath(fromFile, toFile) {
        const fromFileDirectory = path.dirname(fromFile);
        const relativePath = path.relative(fromFileDirectory, toFile);
        return NodePaths.nodifyPath(relativePath);
    }

    static resolvePath(fromFile, importString, optionalStrippableExtensions) {
        const strippableExtensions = (optionalStrippableExtensions ||
            NodePaths.getDefaultStrippableExtensions()).slice();
        strippableExtensions.push('');

        if (importString.charAt(0) !== '.') {
            // Don't know how to resolve node_module imports
            return [];
        }

        return strippableExtensions
            .map(ext => path.join(path.dirname(fromFile), importString) + ext);
    }

    static getDefaultStrippableExtensions() {
        return ['.js', '.json'];
    }
}

module.exports = NodePaths;

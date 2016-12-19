const ReplaceEdit = require('./ReplaceEdit');
const MoveEdit = require('./MoveEdit');

class Edit {
    static replace(filePath, start, end, content) {
        return new ReplaceEdit(filePath, start, end, content);
    }

    static move(sourcePath, targetPath) {
        return new MoveEdit(sourcePath, targetPath);
    }

    static editsOverlap(edit1, edit2) {
        return edit1.overlaps(edit2) || edit2.overlaps(edit1);
    }
}

module.exports = Edit;

const AbstractEdit = require('./AbstractEdit');
const Check = require('../Check');

class ReplaceEdit extends AbstractEdit {
    constructor(filePath, start, end, content) {
        super();
        Check.pathIsRelative(filePath);
        Check.isNumber(start);
        Check.isNumber(end);
        Check.isString(content);
        Check.that(end - start >= 0);
        this.replace = { filePath, start, end, content };
    }

    newContentLength() {
        return Buffer.byteLength(this.replace.content);
    }

    deltaSize() {
        return this.newContentLength() - (this.replace.end - this.replace.start);
    }

    apply(project) {
        const file = project.getFile(this.replace.filePath);
        const newContent = Buffer.alloc(file.contents.length + this.deltaSize());
        file.contents.copy(newContent, 0, 0, this.replace.start);
        newContent.write(this.replace.content, this.replace.start);
        const endOfContent = this.replace.start + this.newContentLength();
        file.contents.copy(newContent, endOfContent, this.replace.end);
        file.contents = newContent;
    }

    overlaps(otherEdit) {
        Check.isInstanceOf(otherEdit, ReplaceEdit);
        return this.replace.filePath === otherEdit.replace.filePath &&
            this.replace.end > otherEdit.replace.start &&
            this.replace.start < otherEdit.replace.end;
    }

    toString() {
        return `${this.replace.filePath} (${this.replace.start},${this.replace.end}) => ${this.replace.content}`;
    }
}

module.exports = ReplaceEdit;

const AbstractEdit = require('./AbstractEdit');
const Check = require('../Check');

class Edit extends AbstractEdit {
    static replace(filePath, start, end, content) {
        Check.isString(filePath);
        Check.isNumber(start);
        Check.isNumber(end);
        Check.isString(content);
        Check.that(end - start >= 0);
        const edit = new Edit();
        edit.replace = { filePath, start, end, content };
        return edit;
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
        Check.isInstanceOf(otherEdit, Edit);
        return this.replace.filePath === otherEdit.replace.filePath &&
            this.replace.end > otherEdit.replace.start &&
            this.replace.start < otherEdit.replace.end;
    }

    toString() {
        return `${this.replace.filePath} (${this.replace.start},${this.replace.end}) => ${this.replace.content}`;
    }
}

module.exports = Edit;

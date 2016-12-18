const Check = require('./Check');

class Options {
    getSelection() {
        return this.selection;
    }
    setSelection(selection) {
        Check.isNumber(selection.start);
        Check.isNumber(selection.end);
        Check.isString(selection.filePath);
        this.selection = selection;
        return this;
    }

    getParseOptions() {
        return {};
    }
}

module.exports = Options;

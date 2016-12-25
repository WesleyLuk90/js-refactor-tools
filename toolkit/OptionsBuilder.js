const Options = require('../src/Options');
const InputFinder = require('./InputFinder');

class OptionsBuilder {
    constructor() {
        this.options = new Map();
        this.input = null;
    }

    inputFromRegex(file, regex) {
        this.input = {
            file,
            regex,
        };
        return this;
    }

    option(key, value) {
        this.options.set(key, value);
        return this;
    }
    hasSelection() {
        return !!this.input;
    }

    getSelection(projectBuilder) {
        const fileContents = projectBuilder.getFileContents(this.input.file);
        return new InputFinder(this.input.file, fileContents, this.input.regex)
            .getSelection();
    }

    createOptions(projectBuilder) {
        const options = new Options();
        if (this.hasSelection()) {
            options.setSelection(this.getSelection(projectBuilder));
        }
        this.options.forEach((value, option) => { options.set(option, value); });
        return options;
    }
}

module.exports = OptionsBuilder;

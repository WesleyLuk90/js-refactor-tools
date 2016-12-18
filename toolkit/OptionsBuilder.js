const Options = require('../src/Options');

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

    _findMatch(projectBuilder) {
        const contents = projectBuilder.getFileContents(this.input.file);
        const match = this.input.regex.exec(contents);
        if (!match) {
            throw new Error(`Failed to find match for ${this.input.regex} in ${contents}`);
        }
        return match;
    }

    _getRegexComponents() {
        const leftParen = '244e5140-465e-435a-afe4-4faf80e045f4';
        const rightParen = '43e8ea21-93a0-481c-9f4d-7131b7939d4f';
        const chunks = this.input.regex.source
            .replace(/\\\(/g, leftParen)
            .replace(/\\\)/g, rightParen)
            .split(/[()]/);
        if (chunks.length !== 3) {
            throw new Error(`Expected 3 chunks but got ${JSON.stringify(chunks)}`);
        }
        return chunks.map(c => c.replace(leftParen, '\\(').replace(rightParen, '\\)'));
    }

    getSelection(projectBuilder) {
        const match = this._findMatch(projectBuilder);
        const matchedString = match[0];
        const regexComponents = this._getRegexComponents();
        const startMatch = new RegExp(`^${regexComponents[0]}`).exec(matchedString);
        const startlength = startMatch[0].length;
        const captureMatch = new RegExp(`^${regexComponents[1]}`).exec(matchedString.substring(startlength));
        const captureLength = captureMatch[0].length;

        return {
            filePath: this.input.file,
            start: match.index + startlength,
            end: match.index + startlength + captureLength,
        };
    }

    createOptions(projectBuilder) {
        return new Options()
            .setSelection(this.getSelection(projectBuilder));
    }
}

module.exports = OptionsBuilder;

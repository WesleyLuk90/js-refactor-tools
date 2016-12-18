module.exports = {
    cmd: 'jasmine',
    functionMatch: function(output) {
        const errors = [];
        let match;
        const regex = /\d+\) ([^\n]+)[\s\S]+?Stack[\s\S]*?at .*?(\w:[^\n]+?):(\d+):(\d+)\)?/g;
        while (match = regex.exec(output)) {
            errors.push({
                file: match[2],
                line: match[3],
                col: match[4],
                message: match[1],
            });
        }
        return errors;
    },
};

const ProjectBuilder = require('./ProjectBuilder');
const OptionsBuilder = require('./OptionsBuilder');

module.exports = {
    newProject() {
        return new ProjectBuilder();
    },

    newOptions() {
        return new OptionsBuilder();
    },
};

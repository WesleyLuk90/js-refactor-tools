const ProjectBuilder = require('./ProjectBuilder');

function newProject() {
    return new ProjectBuilder();
}

module.exports = {
    newProject,
};

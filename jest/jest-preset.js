// Modified from https://github.com/gidztech/jest-puppeteer-docker
const path = require('path');

module.exports = {
    globalSetup: path.join(__dirname, 'setup.js'),
    globalTeardown: path.join(__dirname, 'teardown.js'),
    testEnvironment: 'jest-environment-puppeteer',
    setupFilesAfterEnv: ['expect-puppeteer']
};

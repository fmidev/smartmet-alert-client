// Modified from https://github.com/gidztech/jest-puppeteer-docker
const { setup: setupPuppeteer } = require('jest-environment-puppeteer');
const path = require('path');
const fs = require('fs');
const findNodeModules = require('find-node-modules');
const nodeModulePaths = findNodeModules({ relative: false });
const {
    dockerSetChromiumConfig,
    dockerRunChromium
} = require('docker-chromium');
const { getChromiumRevision } = require('./puppeteer');

process.env.JEST_PUPPETEER_CONFIG = path.join(
    __dirname,
    'jest-puppeteer.config.js'
);

const {
    chromiumFlags,
    downloadHost,
    useClosestUbuntuMirror
} = require(path.resolve(process.env.JEST_PUPPETEER_CONFIG));

// we needed chrome args property from the jest-puppeteer.config.js file but we don't want
// jest-puppeteer to re-use this require from cache because at this point in time, we don't have the web socket written.
delete require.cache[path.resolve(process.env.JEST_PUPPETEER_CONFIG)];

module.exports = async jestConfig => {
    console.log('\n');

    const revision = getChromiumRevision();

    // set the version of Chromium to use based on Puppeteer
    await dockerSetChromiumConfig({
        revision,
        flags: chromiumFlags,
        downloadHost,
        useClosestUbuntuMirror
    });

    // launch Chromium in Docker ready for the first test suite
    const endpointPath = path.join(__dirname, 'wsEndpoint');
    const webSocketUri = await dockerRunChromium();
    fs.writeFileSync(endpointPath, webSocketUri);

    await setupPuppeteer(jestConfig);
};

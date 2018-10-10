'use strict'

const path = require('path');
const fs = require('fs');
const plist = require('plist');

const logPrefix = 'AppConfig: ';
let logger;

function log(...args) {
  logger.info(logPrefix, ...args);
}

function warningError(warning) {
  const err = new Error(logPrefix + warning);
  err.stopExecution = false;
  err.errorAsWarning = true;
  return err;
}

function updateAppNameIOS(plistPath, appName) {
  if (!fs.existsSync(plistPath)) {
    throw new Error('Could not find Info.plist on path: ' + plistPath)
  }

  log(`Setting iOS bundle name to "${appName}"`);

  const plistObj = plist.parse(fs.readFileSync(plistPath, 'utf8'));
  plistObj.CFBundleDisplayName = appName;
  plistObj.CFBundleName = appName;
  fs.writeFileSync(plistPath, plist.build(plistObj));
}

function updateAppNameAndroid(appResourcesPath, appName) {
  log(`Setting Android app_name to "${appName}"`);

  const androidStringsPath = path.join(appResourcesPath, 'Android/src/main/res/values/strings.xml');
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
  <resources>
    <string name="app_name">${appName}</string>
    <string name="title_activity_kimera">${appName}</string>
  </resources>`;

  fs.writeFileSync(androidStringsPath, stringsXml);
}

module.exports = function($logger, $projectData, $usbLiveSyncService, hookArgs) {

  const projectPath = $projectData.projectDir;
  const appPath = $projectData.appDirectoryPath;
  const appResourcesPath = $projectData.appResourcesDirectoryPath;
  const infoPlistPath = $projectData.infoPlistPath;
  const argv = $projectData.$options.argv;

  logger = $logger;

  const configName = argv.env && argv.env.config && argv.env.config[0];

  if (!configName) {
    console.dir($logger);
    console.dir($usbLiveSyncService);
    return Promise.reject(warningError('Missing --env.config argument. Skipping hook.'));
  }

  return new Promise((resolve, reject) => {

    try {
      const configFullPath = path.join(projectPath, 'config', `${configName}.json`);
      log('Using config: '+ configFullPath);
      const config = JSON.parse(fs.readFileSync(configFullPath));

      if (config.app_name) {
        if (hookArgs.platform === 'android') {
          updateAppNameAndroid(appResourcesPath, config.app_name);
        } else {
          updateAppNameIOS(infoPlistPath, config.app_name);
        }
      }

      log('Injecting config.json', JSON.stringify(config));

      fs.copyFileSync(configFullPath, path.join(appPath, 'config.json'));

      resolve();
    } catch (err) {
      reject(err);
    }

  });

};
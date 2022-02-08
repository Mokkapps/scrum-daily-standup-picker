/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import path from 'path';
import { promises as fs, existsSync, mkdirSync, readFileSync } from 'fs';

import { contextBridge } from 'electron';
import { dialog, app, shell } from '@electron/remote';

contextBridge.exposeInMainWorld('electronApi', {
  openExternal(url) {
    shell.openExternal(url);
  },
  openFileDialog: async (title, folder, filters) => {
    const response = await dialog.showOpenDialog({
      title,
      filters,
      properties: ['openFile', 'multiSelections'],
    });
    return response.filePaths;
  },
  writeFile: async (folder, filePath) => {
    const data = await readFile(filePath);
    const fileNameWithExtension = getFileNameWithExtension(filePath);
    const userDataFolder = path.join(app.getPath('userData'), folder);

    createDirectoryIfItDoesNotExist(userDataFolder);

    const writeFilePath = path.join(userDataFolder, fileNameWithExtension);
    await writeFile(writeFilePath, data);
  },
  getFile: async (folder, filePath) => {
    const fileNameWithExtension = getFileNameWithExtension(filePath);
    const userDataPath = path.join(
      app.getPath('userData'),
      folder,
      fileNameWithExtension
    );
    return readFile(userDataPath);
  },
  getSoundAsBase64: async (filePath) => {
    const fileNameWithExtension = getFileNameWithExtension(filePath);
    const userDataPath = path.join(
      app.getPath('userData'),
      'sounds',
      fileNameWithExtension
    );
    return `data:audio/mpeg;base64,${readFileSync(userDataPath, {
      encoding: 'base64',
    })}`;
  },
  getImageAsBase64: async (filePath) => {
    const fileNameWithExtension = getFileNameWithExtension(filePath);
    const userDataPath = path.join(
      app.getPath('userData'),
      'images',
      fileNameWithExtension
    );
    return `data:image/gif;base64,${readFileSync(userDataPath, {
      encoding: 'base64',
    })}`;
  },
  getBase64ImagesFromDirectory: async () => {
    const dirPath = path.join(app.getPath('userData'), 'images');
    if (!existsSync(dirPath)) {
      return Promise.resolve([]);
    }
    const fileNames = await readDirectory(dirPath);
    return fileNames.map((fileName) => {
      const userDataPath = path.join(
        app.getPath('userData'),
        'images',
        fileName
      );
      return {
        src: `data:image/gif;base64,${readFileSync(userDataPath, {
          encoding: 'base64',
        })}`,
        name: fileName,
      };
    });
  },
  getBase64SoundsFromDirectory: async () => {
    const dirPath = path.join(app.getPath('userData'), 'sounds');
    if (!existsSync(dirPath)) {
      return Promise.resolve([]);
    }
    const fileNames = await readDirectory(dirPath);
    return fileNames.map((fileName) => {
      const userDataPath = path.join(
        app.getPath('userData'),
        'sounds',
        fileName
      );
      return {
        src: `data:audio/mpeg;base64,${readFileSync(userDataPath, {
          encoding: 'base64',
        })}`,
        name: fileName,
      };
    });
  },
  deleteFile: async (folder, filePath) => {
    const fileNameWithExtension = getFileNameWithExtension(filePath);
    const userDatafilePath = path.join(
      app.getPath('userData'),
      folder,
      fileNameWithExtension
    );
    return deleteFile(userDatafilePath);
  },
  deleteDirectory: async (folder) => {
    const userDatafilePath = path.join(
      app.getPath('userData'),
      folder,
    );
    if (!existsSync(userDatafilePath)) {
      return Promise.resolve();
    }
    return deleteDirectory(userDatafilePath);
  },
});

function getFileNameWithExtension(path) {
  return (path.toString().match(/[^\\/]+\.[^\\/]+$/) || []).pop();
}

function createDirectoryIfItDoesNotExist(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
}

async function readDirectory(directoryPath) {
  return fs.readdir(directoryPath);
}

async function readFile(path) {
  return fs.readFile(path);
}

async function writeFile(path, data) {
  return fs.writeFile(path, data);
}

async function deleteFile(filePath) {
  return fs.unlink(filePath);
}

async function deleteDirectory(dir) {
  return fs.rmdir(dir, { recursive: true });
}

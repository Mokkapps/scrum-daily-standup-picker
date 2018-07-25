import { Injectable } from '@angular/core';
import * as fs from 'fs';
import { WriteStream } from 'fs';

@Injectable()
export class FileService {
  constructor() {}

  async readFile(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async writeFile(path: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  async readDirectory(directoryPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          reject(err);
        }
        resolve(files);
      });
    });
  }

  async deleteFile(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.access(filePath, error => {
        if (!error) {
          fs.unlink(filePath, err => {
            if (!err) {
              resolve();
            } else {
              console.log(err);
              reject(err);
            }
          });
        } else {
          console.log(error);
          reject(error);
        }
      });
    });
  }

  async deleteDirFiles(dirPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // get all file names in directory
      fs.readdir(dirPath, (err, fileNames) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        // iterate through the found file names
        for (const name of fileNames) {
          fs.unlink(`${dirPath}${name}`, error => {
            if (error) {
              console.log(error);
              reject(error);
            }
            console.log(`Deleted ${name}`);
          });
        }

        resolve();
      });
    });
  }

  createWriteStream(path: string): WriteStream {
    return fs.createWriteStream(path);
  }
}

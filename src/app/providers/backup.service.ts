import { Archiver } from 'archiver';
import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';
import { SettingsService } from './settings.service';
import { FileService } from './file.service';
import { ArchiveService } from './archiver.service';

@Injectable()
export class BackupService {
  constructor(
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private fileService: FileService,
    private archiveService: ArchiveService
  ) {}

  async readBackup(zipPath: string): Promise<void> {
    // Check if backup version is valid
    const regex = new RegExp(/_v(\d).zip$/gi);
    const backupVersion = regex.exec(zipPath);
    if (!backupVersion) {
      return Promise.reject(
        'Cannot read backup. It seems that you did not provide a valid backup file'
      );
    }
    if (this.settingsService.settingsVersion > Number(backupVersion[1])) {
      return Promise.reject(
        'Sorry, your backup is incompatible with current version'
      );
    }

    // Delete existing settings
    try {
      await this.fileService.deleteFile(this.electronService.settingsFilePath);
    } catch (err) {
      console.warn(
        `Could not delete file from ${this.electronService.settingsFilePath}`,
        err
      );
    }
    await this.fileService.deleteDirFiles(this.electronService.imagesPath);
    await this.fileService.deleteDirFiles(this.electronService.soundsPath);

    // Decompress backup to assets folder
    await this.archiveService.decompress(
      zipPath,
      this.electronService.assetsPath
    );

    // Update settings
    const settings = await this.fileService.readFile(
      this.electronService.settingsFilePath
    );
    this.settingsService.updateSettings(JSON.parse(settings));
  }

  createBackup(zipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // create a file to stream archive data to.
      const output = this.fileService.createWriteStream(
        `${zipPath}_StandupPickerBackup_v${
          this.settingsService.settingsVersion
        }.zip`
      );
      const archive: Archiver = this.archiveService.archive();

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', function() {
        resolve();
      });

      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          // log warning
          console.warn(err);
        } else {
          // throw error
          reject(err);
        }
      });

      archive.on('error', function(err) {
        reject(err);
      });

      // pipe archive data to the file
      archive.pipe(output);

      // Write current settings as file
      this.fileService.writeFile(
        this.electronService.settingsFilePath,
        JSON.stringify(this.settingsService.settings)
      );

      // append files from a sub-directory, putting its contents at the root of archive
      archive.directory(this.electronService.assetsPath, false);

      // finalize the archive (ie we are done appending files but streams have to finish yet)
      // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
      archive.finalize();
    });
  }
}

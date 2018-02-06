import { Injectable } from '@angular/core';
import * as AdmZip from 'adm-zip';
import { ElectronService } from 'app/providers/electron.service';

const ZIP_EXTRACT_PATH = '';

@Injectable()
export class ZipService {
  constructor(private electronService: ElectronService) {}

  readArchive(zipPath: string, deleteDirectory: boolean = false) {
    // reading archives
    const zip = new AdmZip(zipPath);
    if (deleteDirectory) {
      // FIXME delete assets folder content
    }
    zip.extractAllTo(/*target path*/ ZIP_EXTRACT_PATH, /*overwrite*/ true);
  }

  createArchive(localPath: string, zipPath: string) {
    const zip = new AdmZip();
    zip.addLocalFolder(localPath);
    zip.writeZip(`${zipPath}StandupPickerBackup_v1.zip`);
  }
}

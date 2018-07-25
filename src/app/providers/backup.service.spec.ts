import { fakeAsync, tick } from '@angular/core/testing';
import { BackupService } from './backup.service';
import {
  createElectronServiceMock,
  createArchiveServiceMock,
  createSettingsServiceMock,
  createFileServiceMock
} from '../../mocks';

describe('BackupService', () => {
  let sut: BackupService;
  let electronService: any;
  let settingsService: any;
  let fileService: any;
  let archiveService: any;

  beforeEach(() => {
    electronService = createElectronServiceMock();
    settingsService = createSettingsServiceMock();
    fileService = createFileServiceMock();
    archiveService = createArchiveServiceMock();

    sut = new BackupService(
      electronService,
      settingsService,
      fileService,
      archiveService
    );
  });

  it(
    'gets initialized correctly',
    fakeAsync(() => {
      tick();
      expect(sut).toBeDefined();
    })
  );
});

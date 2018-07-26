import { BackupService } from './backup.service';
import { TEST_SETTINGS } from '../../mocks';
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

  it('gets initialized correctly', () => {
    expect(sut).toBeDefined();
  });

  it('correctly creates a backup', () => {
    sut.createBackup('anyPath');

    expect(fileService.createWriteStream).toHaveBeenCalledWith(
      'anyPath_StandupPickerBackup_v2.zip'
    );
    expect(fileService.writeFile).toHaveBeenCalledWith(
      'settingsFilePath/',
      JSON.stringify(TEST_SETTINGS)
    );
  });

  it('returns an error if imported backup version is incompatible', done => {
    sut.readBackup('anyPath_v1.zip').catch(e => {
      expect(e).toBe('Sorry, your backup is incompatible with current version');
      done();
    });
  });

  it('returns an error if backup version path is invalid', done => {
    sut.readBackup('anyPath.zip').catch(e => {
      expect(e).toBe(
        'Cannot read backup. It seems that you did not provide a valid backup file'
      );
      done();
    });
  });

  it('correctly imports a valid backup', done => {
    sut.readBackup('anyPath_v2.zip').then(() => {
      expect(fileService.deleteFile).toHaveBeenCalledWith('settingsFilePath/');
      expect(fileService.deleteDirFiles).toHaveBeenCalledTimes(2);
      expect(fileService.deleteDirFiles).toHaveBeenCalledWith('imagesPath/');
      expect(fileService.deleteDirFiles).toHaveBeenCalledWith('soundsPath/');
      expect(archiveService.decompress).toHaveBeenCalledWith(
        'anyPath_v2.zip',
        'assetsPath/'
      );
      expect(settingsService.updateSettings).toHaveBeenCalledWith({
        prop: 'path'
      });
      done();
    });
  });
});

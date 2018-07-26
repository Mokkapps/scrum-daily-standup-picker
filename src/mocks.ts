import { of } from 'rxjs';

export const TEST_SETTINGS = {
  version: 1,
  standupPicker: {
    language: 'en_US',
    background: 'imagesPath/background.jpg',
    standupHour: 9,
    standupMinute: 59,
    standupTimeInMin: 15,
    standupEndReminderAfterMin: 10,
    successSound: 'soundsPath/success.wav',
    standupEndReminderSound: 'soundsPath/tickTock.wav',
    standupMusic: [
      {
        path: 'soundsPath/success.wav',
        name: 'success.wav',
        selected: true
      }
    ],
    teamMembers: [
      {
        name: 'Max Mustermann',
        image: 'imagesPath/placeholder.png',
        disabled: false
      },
      {
        name: 'Erika Mustermann',
        image: 'imagesPath/placeholder.png',
        disabled: false
      }
    ]
  }
};

export function createSettingsServiceMock() {
  const settingsServiceMock = jasmine.createSpyObj('SettingsService', [
    'settings',
    'setting$',
    'settingsVersion',
    'updateSettings'
  ]);
  settingsServiceMock.settings = TEST_SETTINGS;
  settingsServiceMock.setting$ = of(TEST_SETTINGS);
  settingsServiceMock.settingsVersion = 2;
  return settingsServiceMock;
}

export function createLocalStorageServiceMock() {
  const localStorageServiceMock = jasmine.createSpyObj(
    'LocalStorageServiceMock',
    ['get', 'set']
  );
  localStorageServiceMock.get.and.returnValue(false);
  localStorageServiceMock.set.and.returnValue(true);
  return localStorageServiceMock;
}

export function createElectronServiceMock() {
  const electronServiceMock = jasmine.createSpyObj('ElectronService', [
    'isElectron'
  ]);
  electronServiceMock.isElectron.and.returnValue(false);
  electronServiceMock.imagesPath = 'imagesPath/';
  electronServiceMock.soundsPath = 'soundsPath/';
  electronServiceMock.settingsFilePath = 'settingsFilePath/';
  electronServiceMock.assetsPath = 'assetsPath/';
  return electronServiceMock;
}

export function createFileServiceMock() {
  const fileServiceMock = jasmine.createSpyObj('FileService', [
    'readFile',
    'writeFile',
    'deleteDirFiles',
    'deleteFile',
    'createWriteStream'
  ]);
  fileServiceMock.readFile.and.returnValue(
    Promise.resolve(JSON.stringify({ prop: 'path' }))
  );
  fileServiceMock.writeFile.and.returnValue(Promise.resolve());
  fileServiceMock.deleteFile.and.returnValue(Promise.resolve());
  fileServiceMock.deleteDirFiles.and.returnValue(Promise.resolve());
  fileServiceMock.createWriteStream.and.returnValue(new WriteStreamMock());
  return fileServiceMock;
}

export function createNgZoneMock() {
  const ngZoneMock = jasmine.createSpyObj('mockNgZone', [
    'run',
    'runOutsideAngular'
  ]);
  ngZoneMock.run.and.callFake(fn => fn());
  return ngZoneMock;
}

export function createSnackBarMock() {
  const snackBarMock = jasmine.createSpyObj('mockSnackBar', [
    'open',
    'runOutsideAngular'
  ]);
  snackBarMock.open.and.callFake(fn => fn());
  return snackBarMock;
}

export function createArchiveServiceMock() {
  const archiverServiceMock = jasmine.createSpyObj('mockArchiverService', [
    'archive',
    'decompress'
  ]);
  archiverServiceMock.decompress.and.returnValue(Promise.resolve());
  archiverServiceMock.archive.and.returnValue(new ArchiverMock());

  return archiverServiceMock;
}

class WriteStreamMock {
  events: any;

  constructor() {
    this.events = {};
  }

  on(event, func) {
    this.events[event] = func;
    return this;
  }
}

class ArchiverMock {
  events: any;

  constructor() {
    this.events = {};
  }

  on(event, func) {
    this.events[event] = func;
    return this;
  }

  pipe() {
    return this;
  }

  directory() {}

  finalize() {}
}

import { readFile } from 'jsonfile';
export function createElectronServiceMock() {
  const electronServiceMock = jasmine.createSpyObj('ElectronService', [
    'isElectron'
  ]);
  electronServiceMock.isElectron.and.returnValue(false);
  electronServiceMock.imagesPath = 'imagesPath/';
  electronServiceMock.soundsPath = 'soundsPath/';
  return electronServiceMock;
}

export function createFileServiceMock() {
  const fileServiceMock = jasmine.createSpyObj('FileService', ['readFile', 'writeFile']);
  fileServiceMock.readFile.and.returnValue(Promise.resolve('path'));
  fileServiceMock.writeFile.and.returnValue(Promise.resolve());
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

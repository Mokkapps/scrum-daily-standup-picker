import { fakeAsync, tick } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import {
  createElectronServiceMock,
  createFileServiceMock,
  createNgZoneMock,
  createSnackBarMock,
  TEST_SETTINGS
} from '../../mocks';

describe('SettingsService', () => {
  let sut: SettingsService;
  let ngZone: any;
  let snackBar: any;
  let electronService: any;
  let fileService: any;

  beforeEach(() => {
    ngZone = createNgZoneMock();
    snackBar = createSnackBarMock();
    electronService = createElectronServiceMock();
    fileService = createFileServiceMock();

    sut = new SettingsService(snackBar, ngZone, electronService, fileService);
  });

  it('gets initialized correctly', () => {
    expect(sut).toBeDefined();
  });

  it('returns correct settings version', () => {
    expect(sut.settingsVersion).toBe(1);
  });

  it(
    'should inform about new settings',
    fakeAsync(() => {
      const expectedValues = [undefined, TEST_SETTINGS];
      const receivedValues = [];
      sut.settings.subscribe(
        settings => {
          receivedValues.push(settings);
        },
        () => fail('Should not fail')
      );

      sut.updateSettings(TEST_SETTINGS);

      tick(1000);
      expect(receivedValues).toEqual(expectedValues);
    })
  );
});

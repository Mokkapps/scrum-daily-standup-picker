import { fakeAsync, tick } from '@angular/core/testing';
import { SettingsService } from 'app/providers/settings.service';
import {
  createElectronServiceMock,
  createFileServiceMock,
  createNgZoneMock,
  createSnackBarMock
} from 'tests/mocks';

const TEST_SETTINGS = {
  version: 1,
  standupPicker: {
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

  it('gets initialised correctly', () => {
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

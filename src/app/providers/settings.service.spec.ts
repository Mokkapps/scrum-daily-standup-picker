import { fakeAsync, tick } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import {
  createElectronServiceMock,
  TEST_SETTINGS,
  createLocalStorageServiceMock
} from '../../mocks';

describe('SettingsService', () => {
  let sut: SettingsService;
  let electronService: any;
  let localStorageService: any;

  beforeEach(() => {
    electronService = createElectronServiceMock();
    localStorageService = createLocalStorageServiceMock();

    sut = new SettingsService(electronService, localStorageService);
  });

  it('gets initialized correctly', () => {
    expect(sut).toBeDefined();
  });

  it('returns correct settings version', () => {
    expect(sut.settingsVersion).toBe(1);
  });

  it('returns default settings', () => {
    const imagesPath = 'imagesPath/';
    const soundsPath = 'soundsPath/';
    expect(sut.settings).toEqual({
      version: 1,
      standupPicker: {
        language: 'en_US',
        background: `${imagesPath}background.jpg`,
        standupHour: 9,
        standupMinute: 59,
        standupTimeInMin: 15,
        standupEndReminderAfterMin: 10,
        successSound: `${soundsPath}success.wav`,
        standupEndReminderSound: `${soundsPath}tickTock.wav`,
        standupMusic: [
          {
            path: `${soundsPath}success.wav`,
            name: 'success.wav',
            selected: true
          }
        ],
        teamMembers: [
          {
            name: 'Max Mustermann',
            image: `${imagesPath}placeholder.png`,
            disabled: false
          },
          {
            name: 'Erika Mustermann',
            image: `${imagesPath}placeholder.png`,
            disabled: false
          }
        ]
      }
    });
  });

  it(
    'should inform about new settings',
    fakeAsync(() => {
      const expectedValues = [TEST_SETTINGS];
      const receivedValues = [];
      sut.setting$.subscribe(
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

import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import {
  MatCardModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Subject } from 'rxjs';

import { AppSettings } from './../../models/app-settings';
import { createLocalStorageServiceMock, TEST_SETTINGS } from '../../../mocks';
import { BackgroundImageDirective } from '../../directives/background-image.directive';
import { SettingsService } from '../../providers/settings.service';
import { StandupPickerComponent } from './standup-picker.component';

describe('StandupPickerComponent', () => {
  let comp: StandupPickerComponent;
  let fixture: ComponentFixture<StandupPickerComponent>;
  let router: Router;
  let settingsService: any;
  let localStorageService: any;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj('SettingsService', ['settings', 'setting$']);
    settingsService.settings = TEST_SETTINGS;
    settingsService.setting$ = new Subject<AppSettings>();

    localStorageService = createLocalStorageServiceMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: settingsService },
        { provide: LocalStorageService, useValue: localStorageService }
      ],
      declarations: [StandupPickerComponent, BackgroundImageDirective],
      imports: [
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StandupPickerComponent);
    comp = fixture.componentInstance;
    router = TestBed.get(Router);
  });

  it('gets initialized correctly', () => {
    expect(fixture).toBeDefined();
    expect(comp).toBeDefined();
  });

  it('should show default values', () => {
    expect(comp.backgroundImage).toBe('./assets/images/background.jpg');
    expect(comp.title).toBeUndefined();
    expect(comp.isAudioPlaying).toBe(false);
    expect(comp.defaultColor).toBe(true);
    expect(comp.teamMembers.length).toBe(2);
  });

  it(
    'should update values for new settings',
    fakeAsync(() => {
      settingsService.setting$.next({
        ...TEST_SETTINGS,
        standupPicker: {
          ...TEST_SETTINGS.standupPicker,
          background: 'test.png',
          teamMembers: [
            {
              name: 'aaa',
              image: 'imagesPath/aaa.png',
              disabled: false
            },
            {
              name: 'bbb',
              image: 'imagesPath/bbb.png',
              disabled: false
            },
            {
              name: 'ccc',
              image: 'imagesPath/ccc.png',
              disabled: false
            }
          ]
        }
      });
      tick();

      expect(comp.backgroundImage).toBe('./assets/images/test.png');
      expect(comp.teamMembers.length).toBe(3);
    })
  );

  it('should invert text color if triggered', () => {
    comp.invertTextColor();

    expect(comp.defaultColor).toBe(false);
    expect(localStorageService.set).toHaveBeenCalled();
  });

  it('should correctly navigate to settings', () => {
    spyOn(router, 'navigate').and.callFake(() => {});
    comp.goToSettings();
    expect(router.navigate).toHaveBeenCalledWith(['settings']);
  });

  it('should correctly reset', () => {
    comp.reset();

    expect(comp.title).toBe('PAGES.STANDUP_PICKER.CLICK_TO_SELECT_TEAM_MEMBER');
    expect(comp.time).toBe('');
  });
});

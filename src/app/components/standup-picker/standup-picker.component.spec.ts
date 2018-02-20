import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCardModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from 'angular-2-local-storage';

import {
  createLocalStorageServiceMock,
  createSettingsServiceMock
} from 'tests/mocks';
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
    settingsService = createSettingsServiceMock();
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

  it('gets initialised correctly', () => {
    expect(fixture).toBeDefined();
    expect(comp).toBeDefined();
  });

  it('should show default values', () => {
    expect(comp.backgroundImage).toBe('./assets/images/background.jpg');
    expect(comp.title).toBe('');
    expect(comp.defaultColor).toBe(true);
    expect(comp.teamMembers.length).toBe(2);
  });

  it('should invert text color if triggered', () => {
    comp.invertTextColor();

    expect(comp.defaultColor).toBe(false);
    expect(localStorageService.set).toHaveBeenCalled();
  });

  it('should correctly trigger standup', () => {
    comp.triggerPicker();

    expect(comp.title).toBe('PAGES.STANDUP_PICKER.PLEASE_WAIT');
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCardModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { createSettingsServiceMock } from 'tests/mocks';
import { BackgroundImageDirective } from '../../directives/background-image.directive';
import { SettingsService } from '../../providers/settings.service';
import { StandupPickerComponent } from './standup-picker.component';

describe('StandupPickerComponent', () => {
  let comp: StandupPickerComponent;
  let fixture: ComponentFixture<StandupPickerComponent>;

  let settingsService: any;

  beforeEach(() => {
    settingsService = createSettingsServiceMock();

    TestBed.configureTestingModule({
      providers: [{ provide: SettingsService, useValue: settingsService }],
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
  });

  it('gets initialised correctly', () => {
    expect(fixture).toBeDefined();
    expect(comp).toBeDefined();
  });
});

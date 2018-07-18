import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalStorageModule } from 'angular-2-local-storage';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { ElectronService } from './providers/electron.service';
import { SettingsService } from './providers/settings.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        ElectronService,
        SettingsService
      ],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        LocalStorageModule.withConfig({
          prefix: 'StandupPicker',
          storageType: 'localStorage'
        }),
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});

class TranslateServiceStub {
  setDefaultLang(lang: string): void {
  }
}

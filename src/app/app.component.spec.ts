import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ElectronService } from 'app/providers/electron.service';
import { createElectronServiceMock } from 'tests/mocks';
import { AppComponent } from './app.component';

let component: AppComponent;
let fixture: ComponentFixture<AppComponent>;

describe('AppComponent', () => {
  let electronService: any;
  beforeEach(
    async(() => {
      electronService = createElectronServiceMock();

      TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [{ provide: ElectronService, useValue: electronService }],
        imports: [RouterTestingModule, MatIconModule, TranslateModule.forRoot()]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(
    'should create the app',
    async(() => {
      expect(component).toBeTruthy();
    })
  );
});

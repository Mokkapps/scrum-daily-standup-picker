import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ElectronService } from 'app/providers/electron.service';
import { AppComponent } from './app.component';

let component: AppComponent;
let fixture: ComponentFixture<AppComponent>;

describe('AppComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [ElectronService],
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

  it(
    'should show settings button',
    async(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('a')).toBeDefined();
    })
  );
});

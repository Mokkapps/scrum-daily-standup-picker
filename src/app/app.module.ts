import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MAT_LABEL_GLOBAL_OPTIONS
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ExternalPageComponent } from 'app/components/external-page/external-page.component';
import { SettingsComponent } from 'app/components/settings/settings.component';
import { StandupPickerComponent } from 'app/components/standup-picker/standup-picker.component';
import { SettingsService } from 'app/providers/settings.service';
import { SafePipe } from 'app/safe-url.pipe';
import 'polyfills';
import 'reflect-metadata';
import 'zone.js/dist/zone-mix';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideNavComponent } from './components/sidenav/sidenav.component';
import { ElectronService } from './providers/electron.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    StandupPickerComponent,
    ExternalPageComponent,
    SettingsComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // Angular Material Design
    BrowserAnimationsModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatRadioModule,
    MatSelectModule
  ],
  providers: [
    ElectronService,
    SettingsService,
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'always' } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

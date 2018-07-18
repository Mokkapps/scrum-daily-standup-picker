import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocalStorageModule } from 'angular-2-local-storage';
import {
  MAT_LABEL_GLOBAL_OPTIONS,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { BackgroundImageDirective } from './directives/background-image.directive';
import { SettingsComponent } from './components/settings/settings.component';
import { StandupPickerComponent } from './components/standup-picker/standup-picker.component';
import { AppRoutingModule } from './app-routing.module';
import { ElectronService } from './providers/electron.service';
import { ArchiverService } from './providers/archiver.service';
import { SettingsService } from './providers/settings.service';
import { FileService } from './providers/file.service';
import { WebviewDirective } from './directives/webview.directive';
import { AppComponent } from './app.component';
import { ConfirmDialogComponent } from './components/settings/dialog/confirm-dialog.component';
import { AboutDialogComponent } from './components/settings/dialog/about-dialog.component';
import { DeleteFilesDialogComponent } from './components/settings/dialog/delete-files-dialog.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    StandupPickerComponent,
    SettingsComponent,
    ConfirmDialogComponent,
    AboutDialogComponent,
    DeleteFilesDialogComponent,
    BackgroundImageDirective,
    WebviewDirective
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
    LocalStorageModule.withConfig({
      prefix: 'StandupPicker',
      storageType: 'localStorage'
    }),
    // Angular Material Design
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  entryComponents: [
    ConfirmDialogComponent,
    AboutDialogComponent,
    DeleteFilesDialogComponent
  ],
  providers: [
    ElectronService,
    SettingsService,
    ArchiverService,
    FileService,
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'always' } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

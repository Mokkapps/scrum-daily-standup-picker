import { Http, HttpModule } from '@angular/http';
import { SafePipe } from './safe-url.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import {
  MatCardModule,
  MatButtonModule,
  MatSidenavModule,
  MatGridListModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SideNavComponent } from './sidenav/sidenav.component';
import { StandupPickerComponent } from './standup-picker/standup-picker.component';
import { ExternalPageComponent } from './external-page/external-page.component';
import { SettingsComponent } from 'app/settings/settings.component';
import { SettingsService } from 'app/settings/settings.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/standup-picker',
    pathMatch: 'full'
  },
  { path: 'standup-picker', component: StandupPickerComponent },
  { path: 'agile-board', component: ExternalPageComponent },
  { path: 'slideshow', component: ExternalPageComponent },
  { path: 'settings', component: SettingsComponent },
];

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
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule
  ],
  providers: [SettingsService],
  bootstrap: [AppComponent]
})
export class AppModule {}

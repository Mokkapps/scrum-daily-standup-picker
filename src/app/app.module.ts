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

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/standup-picker',
    pathMatch: 'full'
  },
  { path: 'standup-picker', component: StandupPickerComponent },
  { path: 'agile-board', component: ExternalPageComponent },
  { path: 'slideshow', component: ExternalPageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    StandupPickerComponent,
    ExternalPageComponent,
    SafePipe
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

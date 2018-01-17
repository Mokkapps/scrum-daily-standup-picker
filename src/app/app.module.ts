import { StandupPickerComponent } from './standup-picker/standup-picker.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule, MatSidenavModule, MatGridListModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SideNavComponent } from './sidenav/sidenav.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent, SideNavComponent, StandupPickerComponent],
  imports: [BrowserAnimationsModule, BrowserModule, MatSidenavModule, MatButtonModule, MatCardModule, MatGridListModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from 'app/components/settings/settings.component';
import { ExternalPageComponent } from './components/external-page/external-page.component';
import { StandupPickerComponent } from './components/standup-picker/standup-picker.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/standup-picker',
    pathMatch: 'full'
  },
  { path: 'standup-picker', component: StandupPickerComponent },
  { path: 'agile-board', component: ExternalPageComponent },
  { path: 'slideshow', component: ExternalPageComponent },
  { path: 'settings', component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

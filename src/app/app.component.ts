import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(settingsService: SettingsService) {}

  ngOnInit() {}
}

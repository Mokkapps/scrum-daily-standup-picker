import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Subscription, interval, from, timer, zip } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import * as shuffle from 'shuffle-array';

import { AppSettings } from '../../models/app-settings';
import { TeamMember } from '../../models/team-member';
import { SettingsService } from '../../providers/settings.service';

const DEFAULT_COLOR_LOCAL_STORAGE_KEY = 'DEFAULT_COLOR';

@Component({
  selector: 'app-standup-picker',
  templateUrl: './standup-picker.component.html',
  styleUrls: ['./standup-picker.component.scss']
})
export class StandupPickerComponent implements OnInit, OnDestroy {
  title = '';

  time: string;

  teamMembers: Member[] = [];

  // CSS style need a relative path, we also set a default background
  backgroundImage = './assets/images/background.jpg';

  defaultColor = true;

  private audio: HTMLAudioElement;
  private settings: AppSettings;
  private timerSubscription: Subscription;
  private standupSoundTimerSubscription: Subscription;
  private shuffleSubscription: Subscription;

  constructor(
    settingsService: SettingsService,
    private translateService: TranslateService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.audio = new Audio();

    settingsService.settings.subscribe(settings => {
      if (!settings) {
        return;
      }
      this.settings = settings;
      // CSS style need a relative path
      this.backgroundImage = `./assets/images/${this.getFileNameWithExtension(
        this.settings.standupPicker.background
      )}`;
      this.teamMembers = this.shuffleMembers(
        this.settings.standupPicker.teamMembers
      );
    });
  }

  ngOnInit(): void {
    this.translateService
      .get('PAGES.STANDUP_PICKER.CLICK_TO_SELECT_TEAM_MEMBER')
      .pipe(take(1))
      .subscribe(text => {
        this.title = text;
      });

    const storedDefaultColor: boolean = this.localStorageService.get(
      DEFAULT_COLOR_LOCAL_STORAGE_KEY
    );
    if (storedDefaultColor !== undefined && storedDefaultColor !== null) {
      this.defaultColor = storedDefaultColor;
    }

    // Shuffle array initially
    this.teamMembers = this.shuffleMembers();

    // Play standup sound at certain time of day
    this.standupSoundTimerSubscription = interval(60 * 1000)
      .pipe(map(() => new Date()))
      .subscribe(date => {
        if (
          date.getHours() === Number(this.settings.standupPicker.standupHour) &&
          date.getMinutes() ===
            Number(this.settings.standupPicker.standupMinute)
        ) {
          console.log('STANDUP', date);
          const standupMusic = this.settings.standupPicker.standupMusic.filter(
            sound => sound.selected
          );
          this.playAudio(shuffle.pick(standupMusic).path);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.shuffleSubscription) {
      this.shuffleSubscription.unsubscribe();
    }
    if (this.standupSoundTimerSubscription) {
      this.standupSoundTimerSubscription.unsubscribe();
    }
  }

  invertTextColor(): void {
    this.defaultColor = !this.defaultColor;
    this.localStorageService.set(
      DEFAULT_COLOR_LOCAL_STORAGE_KEY,
      this.defaultColor
    );
  }

  triggerPicker(): void {
    if (this.timerSubscription) {
      this.time = '';
      this.timerSubscription.unsubscribe();
    }
    this.title = this.translateService.instant(
      'PAGES.STANDUP_PICKER.PLEASE_WAIT'
    );

    const shuffledMembers = this.shuffleMembers();
    const availableMembers = this.getAvailableMembers();

    this.shuffleSubscription = zip(
      from(availableMembers),
      timer(500, 500),
      (item, i) => {
        return item;
      }
    )
      .pipe(finalize(() => this.onPickComplete()))
      .subscribe((member: TeamMember) => {
        this.teamMembers = this.shuffleMembers();
      });
  }

  goToSettings() {
    this.router.navigate(['settings']);
  }

  reset() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.shuffleSubscription) {
      this.shuffleSubscription.unsubscribe();
    }

    this.teamMembers = this.shuffleMembers();

    this.title = this.translateService.instant(
      'PAGES.STANDUP_PICKER.CLICK_TO_SELECT_TEAM_MEMBER'
    );
    this.time = '';
  }

  private getFileNameWithExtension(path: string): string {
    return (path.toString().match(/[^\\/]+\.[^\\/]+$/) || []).pop();
  }

  private onMemberClick(member: TeamMember): void {
    member.disabled = !member.disabled;
  }

  private onPickComplete(): void {
    this.playAudio(this.settings.standupPicker.successSound);

    const selectedTeamMember = shuffle.pick(this.getAvailableMembers());
    this.teamMembers.forEach(m => {
      m.selected = m.name === selectedTeamMember.name;
    });

    this.title = this.translateService.instant(
      'PAGES.STANDUP_PICKER.STARTS_TODAY',
      { name: selectedTeamMember.name }
    );

    let standupTimeInSec = this.settings.standupPicker.standupTimeInMin * 60;
    let tickSoundPlayed = false;

    this.timerSubscription = timer(0, 1000)
      .pipe(take(standupTimeInSec), map(() => --standupTimeInSec))
      .subscribe((secondsPassed: number) => {
        const remainingMinutes = Math.round(secondsPassed / 60);

        this.time =
          secondsPassed !== 0
            ? this.translateService.instant(
                'PAGES.STANDUP_PICKER.REMAINING_STANDUP_TIME',
                { remainingMinutes }
              )
            : '';

        // Reset labels if standup time is over
        if (secondsPassed === 0) {
          this.title = this.translateService.instant(
            'PAGES.STANDUP_PICKER.CLICK_TO_SELECT_TEAM_MEMBER'
          );
          this.time = '';
          this.teamMembers.map(member => (member.selected = false));
        }

        // Play remind sound at given time
        if (
          remainingMinutes ===
            this.settings.standupPicker.standupTimeInMin -
              this.settings.standupPicker.standupEndReminderAfterMin &&
          !tickSoundPlayed
        ) {
          tickSoundPlayed = true;
          this.playAudio(this.settings.standupPicker.standupEndReminderSound);
        }
      });
  }

  private shuffleMembers(
    teamMembers: TeamMember[] = this.teamMembers
  ): Member[] {
    return shuffle(teamMembers, {
      copy: true
    }).map(m => Object.assign(m, { selected: false }));
  }

  private getAvailableMembers(): TeamMember[] {
    return this.teamMembers.filter((m: TeamMember) => !m.disabled);
  }

  private playAudio(filePath: string): void {
    if (!this.isAudioPlaying()) {
      this.audio.src = filePath;
      this.audio.msAudioCategory = 'BackgroundCapableMedia';
      this.audio.load();
      this.audio.play();
    } else {
      console.log('Cannot play audio', this.audio);
    }
  }

  private isAudioPlaying(): boolean {
    return !this.audio.paused;
  }
}

interface Member extends TeamMember {
  selected: boolean;
}

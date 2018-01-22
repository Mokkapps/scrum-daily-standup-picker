import { Component, OnDestroy, OnInit } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SettingsService } from 'app/settings/settings.service';
import { Observable, Subscription } from 'rxjs/Rx';
import { AppSettings } from './../models/app-settings';
import { TeamMember } from './../models/team-member';

const TRANSLATIONS = {
  CLICK_TO_SELECT_TEAM_MEMBER: 'Hier klicken um Standup Picker zu starten',
  STARTS_TODAY: 'beginnt heute',
  REMAINING_STANDUP_TIME: 'Restliche Standup Zeit:',
  MINUTES: 'Minuten',
  PLEASE_WAIT: 'Bitte warten...'
};

@Component({
  selector: 'app-standup-picker',
  templateUrl: './standup-picker.component.html',
  styleUrls: ['./standup-picker.component.scss']
})
export class StandupPickerComponent implements OnInit, OnDestroy {
  title = TRANSLATIONS.CLICK_TO_SELECT_TEAM_MEMBER;

  time: string;

  teamMembers: Member[] = [];

  private settings: AppSettings;

  private timerSubscription: Subscription;

  private standupSoundTimerSubscription: Subscription;

  private shuffleSubscription: Subscription;

  constructor(settingsService: SettingsService) {
    settingsService.settings.subscribe(settings => {
      console.log('New standup picker settings event', settings);
      if (!settings) {
        return;
      }
      this.settings = settings;
      this.teamMembers = this.shuffle(this.settings.standupPicker.teamMembers);
    });
  }

  ngOnInit(): void {
    // Shuffle array initially
    this.teamMembers = this.shuffle(this.teamMembers);

    // Play standup sound at certain time of day
    this.standupSoundTimerSubscription = Observable.interval(60 * 1000)
      .map(() => new Date())
      .subscribe(date => {
        console.log(
          date,
          this.settings.standupPicker.standupHour,
          this.settings.standupPicker.standupMinute
        );
        if (
          date.getHours() === this.settings.standupPicker.standupHour &&
          date.getMinutes() === this.settings.standupPicker.standupMinute
        ) {
          const standupMusic = this.settings.standupPicker.standupMusic;
          this.playAudio(
            standupMusic[this.getRandomInt(0, standupMusic.length - 1)]
          );
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
  }

  triggerPicker(): void {
    if (this.timerSubscription) {
      this.time = '';
      this.timerSubscription.unsubscribe();
    }
    this.title = TRANSLATIONS.PLEASE_WAIT;
    const shuffledAndAvailableMember = this.shuffle(this.teamMembers).filter(
      (m: TeamMember) => !m.disabled
    );

    this.shuffleSubscription = Observable.zip(
      Observable.from(shuffledAndAvailableMember),
      Observable.timer(500, 500),
      (item, i) => {
        return item;
      }
    )
      .finally(() => this.onPickComplete())
      .subscribe((member: TeamMember) => {
        this.teamMembers = this.shuffle(this.teamMembers);
      });
  }

  private onMemberClick(member: TeamMember): void {
    member.disabled = !member.disabled;
  }

  private onPickComplete(): void {
    this.playAudio(this.settings.standupPicker.successSound);

    const selectedTeamMember = this.pickRandomMember();
    this.teamMembers.forEach((m) => {
      m.selected = m.name === selectedTeamMember.name;
    });

    this.title = `${selectedTeamMember.name} ${TRANSLATIONS.STARTS_TODAY}`;

    let standupTimeInSec = this.settings.standupPicker.standupTimeInMin * 60;

    this.timerSubscription = Observable.timer(0, 1000)
      .take(standupTimeInSec)
      .map(() => --standupTimeInSec)
      .subscribe((secondsPassed: number) => {
        const remainingMinutes = Math.round(secondsPassed / 60);
        this.time =
          secondsPassed !== 0
            ? `${TRANSLATIONS.REMAINING_STANDUP_TIME} ${remainingMinutes}` +
              ` ${TRANSLATIONS.MINUTES}`
            : '';

        // Reset labels if standup time is over
        if (secondsPassed === 0) {
          this.title = TRANSLATIONS.CLICK_TO_SELECT_TEAM_MEMBER;
          this.time = '';
        }

        // Play tick sound some seconds before standup ends
        if (
          secondsPassed ===
          this.settings.standupPicker.standupEndReminderAfterMin * 1000
        ) {
          this.playAudio(this.settings.standupPicker.standupEndReminderSound);
        }
      });
  }

  private pickRandomMember(): Member {
    const filteredArr = this.teamMembers.filter((m: Member) => !m.disabled);
    return filteredArr[Math.floor(Math.random() * filteredArr.length)];
  }

  private playAudio(filePath: string): void {
    const audio = new Audio();
    audio.src = filePath;
    audio.msAudioCategory = 'BackgroundCapableMedia';
    audio.load();
    audio.play();
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffle(input: TeamMember[]): Member[] {
    for (let i = input.length - 1; i >= 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const itemAtIndex = input[randomIndex];

      input[randomIndex] = input[i];
      input[i] = itemAtIndex;
    }
    return input.map(m => Object.assign(m, { selected: false }));
  }
}

interface Member extends TeamMember {
  selected: boolean;
}

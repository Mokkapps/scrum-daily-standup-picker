import { Component, OnDestroy, OnInit } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/settings/settings.service';
import { Observable, Subscription } from 'rxjs/Rx';

const SUCCESS_SOUND_PATH = './assets/sounds/success.wav'; // Sound which is played if team member was randomly selected
const TICK_SOUND_PATH = './assets/sounds/tickTock.wav'; // Sound which is played shortly before standup ends
const STANDUP_MAX_TIME_IN_SEC = 15 * 60; // The time for the daily standup
const TICK_TIME_IN_SEC = 13 * 60; // Play tick sound shortly before standup ends
const STANDUP_SOUND_HOUR = 9; // Hour when the standup sound should play
const STANDUP_SOUND_MINUTE = 59; // Minute when the standup sound should play

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

  teamMembers: TeamMember[] = [];

  private standupMusic: string[];

  private standupTimeInSeconds: number = STANDUP_MAX_TIME_IN_SEC;

  private timerSubscription: Subscription;

  private standupSoundTimerSubscription: Subscription;

  private shuffleSubscription: Subscription;

  private settingsSubscription: Subscription;

  constructor(settingsService: SettingsService) {
    this.settingsSubscription = settingsService.settings.subscribe(settings => {
      if (!settings) {
        return;
      }
      this.teamMembers = settings.standupPicker.teamMembers;
      this.standupMusic = settings.standupPicker.standupMusic;
    });
  }

  ngOnInit() {
    // Shuffle array initially
    this.teamMembers = this.shuffle(this.teamMembers);

    // Play standup sound at certain time of day
    this.standupSoundTimerSubscription = Observable.interval(60 * 1000)
      .map(() => new Date())
      .subscribe(date => {
        if (
          date.getHours() === STANDUP_SOUND_HOUR &&
          date.getMinutes() === STANDUP_SOUND_MINUTE
        ) {
          this.playAudio(
            this.standupMusic[
              this.getRandomInt(0, this.standupMusic.length - 1)
            ]
          );
        }
      });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.standupSoundTimerSubscription) {
      this.standupSoundTimerSubscription.unsubscribe();
    }
    if (this.shuffleSubscription) {
      this.shuffleSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  triggerPicker() {
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
      function(item, i) {
        return item;
      }
    )
      .finally(() => this.onPickComplete())
      .subscribe((member: TeamMember) => {
        this.teamMembers = this.shuffle(this.teamMembers);
      });
  }

  private onMemberClick(member: TeamMember) {
    member.disabled = !member.disabled;
  }

  private onPickComplete() {
    this.playAudio(SUCCESS_SOUND_PATH);

    this.title = `${this.pickRandomMember().name} ${TRANSLATIONS.STARTS_TODAY}`;

    this.timerSubscription = Observable.timer(0, 1000)
      .take(this.standupTimeInSeconds)
      .map(() => --this.standupTimeInSeconds)
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
        if (secondsPassed === TICK_TIME_IN_SEC) {
          this.playAudio(TICK_SOUND_PATH);
        }
      });
  }

  private pickRandomMember(): TeamMember {
    const filteredArr = this.teamMembers.filter((m: TeamMember) => !m.disabled);
    return filteredArr[Math.floor(Math.random() * filteredArr.length)];
  }

  private playAudio(filePath: string) {
    const audio = new Audio();
    audio.src = filePath;
    audio.msAudioCategory = 'BackgroundCapableMedia';
    audio.load();
    audio.play();
  }

  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffle = function(input: TeamMember[]) {
    for (let i = input.length - 1; i >= 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const itemAtIndex = input[randomIndex];

      input[randomIndex] = input[i];
      input[i] = itemAtIndex;
    }
    return input;
  };
}

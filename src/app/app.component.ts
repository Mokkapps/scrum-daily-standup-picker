import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

const TITLE_TEXT = 'Standup Picker';
const SUCCESS_SOUND_PATH = '../../assets/sounds/success.wav';
const TICK_SOUND_PATH = '../../assets/sounds/tickTock.wav';
const STANDUP_MAX_TIME_IN_MIN = 15 * 60;
const TICK_TIME_IN_MIN = 1 * 60;
const STANDUP_SOUND_HOUR = 9;
const STANDUP_SOUND_MINUTE = 59;
const STANDUP_SOUND_PATHS = [
  '../../assets/sounds/cheerful-song.wav'
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  title = TITLE_TEXT;

  standupTimeInMinutes = STANDUP_MAX_TIME_IN_MIN;

  time: string;

  timerObservable;

  standupSoundTimerObservable;

  teamMembers: TeamMember[] = [
    { name: 'Developer 1', disabled: false, image: '../../assets/images/user1.jpeg' },
    { name: 'Scrum Master', disabled: false, image: '../../assets/images/user2.jpeg' },
    { name: 'QA', disabled: false, image: '../../assets/images/user3.jpeg' },
    { name: 'Architect', disabled: false, image: '../../assets/images/user4.jpeg' },
    { name: 'Developer 2', disabled: false, image: '../../assets/images/user5.jpeg' }
  ]

  constructor() {
    // Shuffle array initially
    this.teamMembers = this.shuffle(this.teamMembers);

    // Play standup sound at certain time of day
    this.standupSoundTimerObservable = Observable
      .interval(60 * 1000)
      .map(() => new Date())
      .subscribe((date) => {
        if (date.getHours() === STANDUP_SOUND_HOUR && date.getMinutes() === STANDUP_SOUND_MINUTE) {
          console.log('Standup!');
          this.playAudio(STANDUP_SOUND_PATHS[this.getRandomInt(0, STANDUP_SOUND_PATHS.length - 1)]);
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe "open" subscriptions
    if (this.timerObservable) {
      this.timerObservable.unsubscribe();
    }
    if (this.standupSoundTimerObservable) {
      this.standupSoundTimerObservable.unsubscribe();
    }
  }

  private onMemberClick(member: TeamMember) {
    member.disabled = !member.disabled;
  }

  private onPickComplete() {
    this.playAudio(SUCCESS_SOUND_PATH);

    this.title = this.pickRandomMember().name + ' beginnt heute';

    this.timerObservable = Observable.timer(0, 1000)
      .take(this.standupTimeInMinutes)
      .map(() => --this.standupTimeInMinutes)
      .subscribe(s => {
        const minutes = Math.round((s / 60));
        this.time = s !== 0 ? 'Restliche Standup Zeit: ' + minutes + ' Minuten' : '';

        if (s === TICK_TIME_IN_MIN) {
          // Play tick sound x minutes before max standup time
          this.playAudio(TICK_SOUND_PATH);
        }
      });
  }

  private pickRandomMember(): TeamMember {
    const filteredArr = this.teamMembers.filter(m => !m.disabled);
    return filteredArr[Math.floor(Math.random() * filteredArr.length)];
  }

  private triggerPicker() {
    if (this.timerObservable) {
      this.time = '';
      this.timerObservable.unsubscribe();
    }
    this.title = 'Bitte warten...';
    const shuffledAndAvailableMember = this.shuffle(this.teamMembers).filter(m => !m.disabled);

    Observable.zip(
      Observable.from(shuffledAndAvailableMember),
      Observable.timer(500, 500),
      function (item, i) {
        return item;
      }
    )
      .finally(() => this.onPickComplete())
      .subscribe(member => {
        this.teamMembers = this.shuffle(this.teamMembers);
      });
  }

  private playAudio(filePath: string) {
    const audio = new Audio();
    audio.src = filePath;
    audio.load();
    audio.play();
  }

  private getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shuffle = function (input: TeamMember[]) {
    for (let i = input.length - 1; i >= 0; i--) {

      const randomIndex = Math.floor(Math.random() * (i + 1));
      const itemAtIndex = input[randomIndex];

      input[randomIndex] = input[i];
      input[i] = itemAtIndex;
    }
    return input;
  }
}

interface TeamMember {
  name: string,
  disabled: boolean,
  image: string
}

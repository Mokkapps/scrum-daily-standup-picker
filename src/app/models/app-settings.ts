import { TeamMember } from './team-member';

export interface AppSettings {
  standupPicker: StandupPicker;
  jiraUrl: string | undefined;
  slideshow: Slideshow;
}

export interface Slideshow {
  urls: string[];
  timerInSec: number;
}

export interface StandupPicker {
  standupHour: number;
  standupMinute: number;
  standupTimeInMin: number;
  standupEndReminderAfterMin: number;
  successSound: string;
  standupEndReminderSound: string;
  standupMusic: string[];
  teamMembers: TeamMember[];
}

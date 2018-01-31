import { TeamMember } from './team-member';

export interface AppSettings {
  standupPicker: StandupPicker;
}

export interface StandupPicker {
  background: string;
  standupHour: number;
  standupMinute: number;
  standupTimeInMin: number;
  standupEndReminderAfterMin: number;
  successSound: string;
  standupEndReminderSound: string;
  standupMusic: StandupSound[];
  teamMembers: TeamMember[];
}

export interface StandupSound {
  path: string;
  name: string;
  selected: boolean;
}

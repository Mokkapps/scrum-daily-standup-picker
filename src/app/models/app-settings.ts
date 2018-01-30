import { TeamMember } from './team-member';

export interface AppSettings {
  standupPicker: StandupPicker;
  background: string;
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

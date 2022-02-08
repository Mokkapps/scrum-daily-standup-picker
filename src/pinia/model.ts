import { ElectronFile } from 'src/electron-api';

export interface TeamMember {
  id: string;
  name: string;
  image: string | null;
  available: boolean;
  selected: boolean;
}

export interface StandupSound {
  src: string | null;
  name: string;
  selected: boolean;
}

export interface AppSettings {
  settingsVersion: number;
  language: string;
  format24h: boolean;
  teamMembers: TeamMember[];
  soundVolume: number;
  standupHour: number;
  standupMinute: number;
  standupDurationInMin: number;
  standupEndReminderAfterMin: number;
  standupSounds: StandupSound[];
  images: ElectronFile[];
  backgroundImage: ElectronFile | null;
  standupSuccessSound: ElectronFile | null;
  standupEndReminderSound: ElectronFile | null;
}

import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { AppSettings, StandupSound, TeamMember } from 'src/pinia/model';
import {
  DEFAULT_BACKGROUND_IMAGE,
  DEFAULT_IMAGES,
  DEFAULT_REMINDER_SOUND,
  DEFAULT_REMINDER_SOUND_NAME,
  DEFAULT_SOUNDS,
  DEFAULT_SUCCESS_SOUND,
  DEFAULT_SUCCESS_SOUND_NAME,
} from 'src/composables/useFiles';
import { ElectronFile } from 'src/electron-api';
import { availableLanguages } from 'src/i18n';

const SETTINGS_VERSION = 1;
export const LOCAL_STORAGE_STATE_KEY = 'store';

const getFakeName = () => `${faker.name.firstName()} ${faker.name.lastName()}`;

const storedStateItem = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);

let initialState: AppSettings = {
  settingsVersion: SETTINGS_VERSION,
  backgroundImage: DEFAULT_BACKGROUND_IMAGE,
  language: availableLanguages.en.id,
  format24h: false,
  standupHour: 10,
  standupMinute: 0,
  standupDurationInMin: 15,
  standupEndReminderAfterMin: 10,
  standupSounds: DEFAULT_SOUNDS,
  images: DEFAULT_IMAGES,
  standupSuccessSound: DEFAULT_SUCCESS_SOUND,
  standupEndReminderSound: DEFAULT_REMINDER_SOUND,
  teamMembers: Array.from(Array(5).keys()).map(() => ({
    id: uuidv4(),
    name: getFakeName(),
    image: null,
    available: true,
    selected: false,
  })),
  soundVolume: 100,
};

if (storedStateItem) {
  const storedState = JSON.parse(storedStateItem) as AppSettings;
  if (storedState.settingsVersion < SETTINGS_VERSION) {
    localStorage.clear();
  }
  initialState = storedState;
}

export const useStore = defineStore('main', {
  state: (): AppSettings => {
    return initialState;
  },
  getters: {
    getTeamMemberNameById: (state) => {
      return (id: string) =>
        state.teamMembers.find((member) => member.id === id)?.name ?? '';
    },
    getTeamMemberImageById: (state) => {
      return (id: string) =>
        state.teamMembers.find((member) => member.id === id)?.image ?? '';
    },
    getTeamMemberById: (state) => {
      return (id: string) =>
        state.teamMembers.find((member) => member.id === id);
    },
    availableTeamMembers: (state) => {
      return state.teamMembers.filter((member: TeamMember) => member.available);
    },
    standupDurationInSec: (state) => state.standupDurationInMin * 60,
    selectedTeamMemberName: (state) =>
      state.teamMembers.find((member: TeamMember) => member.selected)?.name,
    defaultSuccessSoundSrc: (state) =>
      state.standupSounds.find(
        (sound) => sound.name === DEFAULT_SUCCESS_SOUND_NAME
      )?.src,
    selectedStandupSounds: (state) =>
      state.standupSounds.filter((sound: StandupSound) => sound.selected),
    standupSoundsWithoutDefaultSounds: (state) =>
      state.standupSounds.filter(
        (sound: StandupSound) =>
          sound.name !== DEFAULT_SUCCESS_SOUND_NAME &&
          sound.name !== DEFAULT_REMINDER_SOUND_NAME
      ),
  },
  actions: {
    addTeamMember(defaultImage?: string) {
      this.teamMembers = [
        ...this.teamMembers,
        {
          id: uuidv4(),
          selected: false,
          available: true,
          image: defaultImage ?? null,
          name: getFakeName(),
        },
      ];
    },
    removeTeamMember({ id }: { id: string }) {
      this.teamMembers = this.teamMembers.filter(
        (member: TeamMember) => member.id !== id
      );
    },
    setTeamMemberName({ id, name }: { id: string; name: string }) {
      const teamMember = this.teamMembers.find(
        (member: TeamMember) => member.id === id
      );
      if (teamMember) {
        teamMember.name = name;
      }
    },
    deleteImage(imageIndex: number) {
      this.images = this.images.filter((_, index) => index !== imageIndex);
    },
    setTeamMemberImage({ id, image }: { id: string; image: string }) {
      const teamMember = this.teamMembers.find(
        (member: TeamMember) => member.id === id
      );
      if (teamMember) {
        teamMember.image = image;
      }
    },
    unselectAllTeamMembers() {
      this.teamMembers = this.teamMembers.map((member: TeamMember) => {
        member.selected = false;
        return member;
      });
    },
    setAllTeamMembersAvailable() {
      this.teamMembers = this.teamMembers.map((member: TeamMember) => {
        member.available = true;
        return member;
      });
    },
    setStandupSounds(sounds: ElectronFile[]) {
      const electronSounds = sounds.map(({ name, src }: ElectronFile) => {
        const oldSelectedState = this.standupSounds.find(
          (sound) => sound.name === name
        );
        return {
          selected: oldSelectedState ? oldSelectedState.selected : true,
          src,
          name,
        };
      });
      this.standupSounds = [...DEFAULT_SOUNDS, ...electronSounds];
    },
    setSoundSelected(name: string, selected: boolean) {
      const sound = this.standupSounds.find((sound) => sound.name === name);
      if (sound) {
        sound.selected = selected;
      }
    },
    setTeamMemberSelected({ id, selected }: { id: string; selected: boolean }) {
      const mappedMembers = this.teamMembers.map((member: TeamMember) => {
        if (member.id === id) {
          member.selected = selected;
        }
        return member;
      });
      const selectedTeamMemberIndex = mappedMembers.findIndex(
        (member: TeamMember) => member.selected
      );
      const nonSelectedTeamMembers = mappedMembers.filter(
        (member: TeamMember) => !member.selected
      );

      // selected team member should be on first position
      this.teamMembers = [
        mappedMembers[selectedTeamMemberIndex],
        ...nonSelectedTeamMembers,
      ];
    },
    toggleTeamMemberAvailibility({ id }: { id: string }) {
      const teamMember = this.teamMembers.find(
        (member: TeamMember) => member.id === id
      );
      if (teamMember) {
        teamMember.available = !teamMember.available;
      }
    },
    addDefaultImageToAllTeamMembersWithoutImage(defaultImageSrc?: string) {
      this.teamMembers = this.teamMembers.map((member: TeamMember) => {
        if (!member.image && defaultImageSrc) {
          member.image = defaultImageSrc;
        }
        return member;
      });
    },
    setStandupSuccessSound(soundName: string) {
      {
        const electronFile = this.standupSounds.find(
          (sound: StandupSound) => sound.name === soundName
        );
        this.standupSuccessSound = electronFile
          ? { name: electronFile.name, src: electronFile.src as string }
          : null;
      }
    },
    setStandupReminderSound(soundName: string) {
      {
        const electronFile = this.standupSounds.find(
          (sound: StandupSound) => sound.name === soundName
        );
        this.standupEndReminderSound = electronFile
          ? { name: electronFile.name, src: electronFile.src as string }
          : null;
      }
    },
  },
});

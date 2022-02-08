export interface ElectronFile {
  name: string;
  src: string;
}

export interface ElectronFileFilter {
  name: string;
  extensions: string[];
}

export interface ElectronApi {
  openExternal: (url: string) => void;
  getBase64ImagesFromDirectory: (folder: string) => Promise<ElectronFile[]>;
  getBase64SoundsFromDirectory: (folder: string) => Promise<ElectronFile[]>;
  writeFile: (folder: string, filePath: string) => Promise<void>;
  deleteFile: (folder: string, filePath: string) => Promise<void>;
  deleteDirectory: (folder: string) => Promise<void>;
  openFileDialog: (
    title: string,
    folder: string,
    filters: ElectronFileFilter
  ) => Promise<string[]>;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const electronApi: ElectronApi = (window as { electronApi: ElectronApi })
  .electronApi;

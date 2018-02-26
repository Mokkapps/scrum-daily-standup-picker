[![Angular Logo](./logo-angular.jpg)](https://angular.io/) [![Electron Logo](./logo-electron.jpg)](https://electron.atom.io/)

# Standup Picker

A desktop application which can be used in Scrum teams to initiate the daily Scrum meeting.

This project was bootstrapped with [angular-electron](https://github.com/maximegris/angular-electron).

Design by [Angular Material](https://material.angular.io).

<img src="./Standup_Picker_1-0-0_480p.gif?raw=true" width="100%">

# Features

* Randomly select a team member. You can click on team member images to "ignore" them if they are not attending at the standup.
* Play standup music at a given time.
* Inform about ending standup time by a sound.

# Releases

All releases are available [here](https://github.com/Mokkapps/scrum-daily-standup-picker/releases).

If you want to use the deprecated Angular standalone version without Electron you can use [Release 0.1.0](https://github.com/Mokkapps/scrum-daily-standup-picker/releases/tag/v0.1.0).

# Getting Started

## To build for development

* Clone this repository locally :

```bash
git clone https://github.com/Mokkapps/scrum-daily-standup-picker.git
```

* Install dependencies with npm:

```bash
npm install
```

* Build for development

```bash
npm start
```

## To build for production

* Using development variables (environments/index.ts) : `npm run electron:dev`
* Using production variables (environments/index.prod.ts) : `npm run electron:prod`

Your built files are in the /dist folder.

## Included Commands

| Command                    | Description                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run start:web`        | Execute the app in the browser                                                                              |
| `npm run electron:linux`   | Builds your application and creates an app consumable on linux system                                       |
| `npm run electron:windows` | On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems         |
| `npm run electron:mac`     | On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

# Used assets

* Wallpaper: http://www.wallpapersbrowse.com/wallpaper/17862
* Success sound: http://freesound.org/people/grunz/sounds/109662/
* Tick tock sound: http://freesound.org/people/FoolBoyMedia/sounds/264498/

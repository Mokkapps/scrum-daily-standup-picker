[![Travis Build Status][build-badge]][build]
[![Make a pull request][prs-badge]][prs]
[![License](http://img.shields.io/badge/Licence-MIT-brightgreen.svg)](LICENSE.md)

# Standup Picker

A desktop application which can be used in Scrum teams to initiate the daily Scrum meeting.

This project was bootstrapped with [angular-electron](https://github.com/maximegris/angular-electron).

Design by [Angular Material](https://material.angular.io).

[![Standup Picker](./youtube_video_thumbnail.png)](https://youtu.be/7MHk09N5APM "Standup Picker - Click to Watch!")

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

There is an issue with `yarn` and `node_modules` that are only used in electron on the backend when the application is built by the packager. Please use `npm` as dependencies manager.

* Build for development

```bash
npm start
```

Voila! You can use the Standup Picker app in a local development environment with hot reload!

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve:web`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

## Browser mode

Maybe you want to execute the application in the browser with hot reload ? You can do it with `npm run ng:serve:web`.  
Note that you can't use Electron or NodeJS native libraries in this case. Please check `providers/electron.service.ts` to watch how conditional import of electron/Native libraries is done.


# Used assets

* Wallpaper: http://www.wallpapersbrowse.com/wallpaper/17862
* Success sound: http://freesound.org/people/grunz/sounds/109662/
* Tick tock sound: http://freesound.org/people/FoolBoyMedia/sounds/264498/

[build-badge]: https://travis-ci.org/Mokkapps/scrum-daily-standup-picker.svg?branch=master
[build]: https://travis-ci.org/Mokkapps/scrum-daily-standup-picker.svg?branch=master
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

describe('Application launch', function() {
  const MAT_CARD = 'mat-card';
  const GO_TO_SETTINGS = '#go-to-settings';
  const SETTINGS_BACKGROUND = '#settings-background';
  const TRIGGER_PICKER = '#trigger-picker';
  const FIRST_HINT = '#hint1';
  const TIME_TEXT = '#timeText';
  const ADD_TEAM_MEMBER = '#add-team-member';
  const SAVE_BUTTON = '#save-button';
  const PICKER_BACKGROUND = '#picker-background';
  const STANDUP_PICKER_TOOLBAR_TITLE = '#standup-picker-toolbar-title';
  const SWITCH_LANGUAGE = '#switch-language';
  const DE_OPTION = '#mat-option-0';

  this.timeout(10000);

  beforeEach(function() {
    this.app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: electronPath,

      // Assuming you have the following directory structure

      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ spec.js  <- You are here! ~ Well you should be.

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '..')]
    });
    return this.app.start();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      this.app.client.localStorage('DELETE');
      return this.app.stop();
    }
  });

  it('shows an initial window', async function() {
    const win = this.app.browserWindow;
    assert.equal(await this.app.client.getWindowCount(), 1);
    assert.equal(await win.isMinimized(), false);
    assert.equal(await win.isDevToolsOpened(), false);
    assert.equal(await win.isVisible(), true);
    assert.equal(await win.isFocused(), true);

    const { width, height } = await win.getBounds();
    assert.equal(width > 0, true);
    assert.equal(height > 0, true);

    assert.equal(await this.app.client.getTitle(), 'Standup Picker');
  });

  it('shows two member cards per default', async function() {
    const memberCardNodes = await this.app.client.$$(MAT_CARD);
    assert.equal(memberCardNodes.length === 2, true);
  });

  it('switches to settings page if settings button is pressed', async function() {
    await this.app.browserWindow.isVisible();
    await this.app.client.click(GO_TO_SETTINGS);
    await this.app.client.waitForVisible(SETTINGS_BACKGROUND);
  });

  it('should start picker if play icon is pressed', async function() {
    await this.app.browserWindow.isVisible();
    await this.app.client.waitForVisible(TRIGGER_PICKER);
    await this.app.client.click(TRIGGER_PICKER);
    await this.app.client.waitForVisible(FIRST_HINT);
    assert.equal(
      await this.app.client.getText(TIME_TEXT),
      'Remaining standup time: 15 minutes'
    );
  });

  it('should correctly add a new team member', async function() {
    await this.app.browserWindow.isVisible();
    await this.app.client.click(GO_TO_SETTINGS);
    await this.app.client.waitForVisible(SETTINGS_BACKGROUND);

    await this.app.client.scroll(ADD_TEAM_MEMBER);
    await this.app.client.click(ADD_TEAM_MEMBER);

    await this.app.client.scroll(SAVE_BUTTON);
    await this.app.client.click(SAVE_BUTTON);

    await this.app.client.waitForVisible(PICKER_BACKGROUND);

    const memberCardNodes = await this.app.client.$$('mat-card');
    assert.equal(memberCardNodes.length === 3, true);
  });

  it('should correctly switch language', async function() {
    await this.app.browserWindow.isVisible();

    assert.equal(
      await this.app.client.getText(STANDUP_PICKER_TOOLBAR_TITLE),
      'Click play icon on the right side to start'
    );

    await this.app.client.click(GO_TO_SETTINGS);
    await this.app.client.waitForVisible(SETTINGS_BACKGROUND);

    await this.app.client.scroll(SWITCH_LANGUAGE);
    await this.app.client.click(SWITCH_LANGUAGE);
    await this.app.client.click(DE_OPTION);

    await this.app.client.scroll(SAVE_BUTTON);
    await this.app.client.waitForVisible(SAVE_BUTTON);
    await this.app.client.click(SAVE_BUTTON);

    await this.app.client.waitForVisible(PICKER_BACKGROUND);

    assert.equal(
      await this.app.client.getText(STANDUP_PICKER_TOOLBAR_TITLE),
      'Zum Starten rechts auf Play-Icon klicken'
    );
  });
});

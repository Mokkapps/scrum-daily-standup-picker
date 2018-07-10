const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

describe('Application launch', function() {
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
    const memberCardNodes = await this.app.client.$$('mat-card');
    assert.equal(memberCardNodes.length === 2, true);
  });

  it('switches to settings page if settings button is pressed', async function() {
    await this.app.browserWindow.isVisible();
    await this.app.client.click('#go-to-settings');
    await this.app.client.waitForVisible('#settings-background');
  });

  it('should start picker if play icon is pressed', async function() {
    await this.app.browserWindow.isVisible();
    await this.app.client.waitForVisible('#trigger-picker');
    await this.app.client.click('#trigger-picker');
    await this.app.client.waitForVisible('#hint1');
    assert.equal(await this.app.client.getText('#timeText'), 'Restliche Standup Zeit: 15 Minuten');
  });

  it('should correctly add a new team member', async function() {
    await this.app.browserWindow.isVisible();
    await this.app.client.click('#go-to-settings');
    await this.app.client.waitForVisible('#settings-background');

    await this.app.client.scroll('#add-team-member')
    await this.app.client.click('#add-team-member');

    await this.app.client.scroll('#save-button')
    await this.app.client.click('#save-button');

    await this.app.client.waitForVisible('#picker-background');

    const memberCardNodes = await this.app.client.$$('mat-card');
    assert.equal(memberCardNodes.length === 3, true);
  });
});

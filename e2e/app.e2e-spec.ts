import { AngularStandupPickerPage } from './app.po';

describe('angular-standup-picker App', () => {
  let page: AngularStandupPickerPage;

  beforeEach(() => {
    page = new AngularStandupPickerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});

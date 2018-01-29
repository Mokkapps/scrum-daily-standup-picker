import { SettingsService } from 'app/providers/settings.service';

describe('SettingsService', () => {
  let sut: SettingsService;

  beforeEach(() => {
    const mockNgZone = jasmine.createSpyObj('mockNgZone', [
      'run',
      'runOutsideAngular'
    ]);
    mockNgZone.run.and.callFake(fn => fn());

    const mockSnackBar = jasmine.createSpyObj('mockSnackBar', [
      'open',
      'runOutsideAngular'
    ]);
    mockSnackBar.open.and.callFake(fn => fn());

    sut = new SettingsService(mockSnackBar, mockNgZone);
  });

  it('gets initialised correctly', () => {
    expect(sut).toBeDefined();
  });
});

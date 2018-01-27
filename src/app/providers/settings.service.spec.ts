import { SettingsService } from 'app/providers/settings.service';

describe('SettingsService', () => {
  let sut: SettingsService;

  beforeEach(() => {
    const mockNgZone = jasmine.createSpyObj('mockNgZone', [
      'run',
      'runOutsideAngular'
    ]);
    mockNgZone.run.and.callFake(fn => fn());
    sut = new SettingsService(mockNgZone);
  });

  it('gets initialised correctly', () => {
    expect(sut).toBeDefined();
  });
});

import { distanceInKm } from '../src/common/geo';

describe('distanceInKm', () => {
  it('returns approximately zero for the same point', () => {
    expect(distanceInKm({ lat: 12.9716, lng: 77.5946 }, { lat: 12.9716, lng: 77.5946 })).toBeCloseTo(0, 5);
  });
});

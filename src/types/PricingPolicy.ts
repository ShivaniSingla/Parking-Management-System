export interface PricingPolicy {
  vehicleType: 'Car' | 'Bike' | 'EV' | 'Handicap';
  hourlyRate: number;
  gracePeriodMinutes: number;
}

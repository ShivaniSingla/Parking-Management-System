export interface Vehicle {
  vehicleNumber: string;
  vehicleType: 'Car' | 'Bike' | 'EV' | 'Handicap';
  ownerName?: string;
}

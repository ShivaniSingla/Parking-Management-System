export interface ParkingRecord {
  recordId: string;
  vehicleNumber: string;
  vehicleType: 'Car' | 'Bike' | 'EV' | 'Handicap';
  slotId: string;
  entryTime: string; // ISO string
  exitTime?: string; // ISO string
  durationMinutes?: number;
  feeAmount?: number;
  paymentStatus: 'pending' | 'completed';
  paymentMethod?: 'Cash' | 'Card' | 'UPI';
}

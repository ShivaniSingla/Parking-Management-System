export interface ParkingSlot {
  slotId: string;
  slotNumber: string;
  slotType: 'Car' | 'Bike' | 'EV' | 'Handicap';
  floorNumber: number;
  status: 'available' | 'occupied' | 'maintenance';
}

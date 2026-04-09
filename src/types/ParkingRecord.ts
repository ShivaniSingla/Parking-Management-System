export interface TicketType {
  ticketID: string;
  entryTime: string;
  exitTime: string | null;
  amount: number;
  vehicleNo: string;
}

export interface ParkingType {
  totalSlots: number;
  avaSlots: number;
}

export interface PaymentType {
  payID: string;
  amount: number;
  method: string;
  ticketID: string;
}

export interface PricingType {
  vehicleType: string;
  hourlyRate: number;
}

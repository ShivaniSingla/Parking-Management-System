import { supabase } from '../lib/supabaseClient';

class Ticket {
  ticketID: string;
  entryTime: string;
  exitTime: string | null;
  amount: number;
  vehicleNo: string;

  constructor(ticketID: string, entryTime: string, exitTime: string | null = null, amount: number = 0, vehicleNo: string = '') {
    this.ticketID = ticketID;
    this.entryTime = entryTime;
    this.exitTime = exitTime;
    this.amount = amount;
    this.vehicleNo = vehicleNo;
  }

  async generateBill(durationMinutes: number, vehicleType: string): Promise<number> {
    // Fetch hourly rate for this vehicle type from pricing table
    const { data } = await supabase
      .from('pricing')
      .select('hourlyRate')
      .eq('vehicleType', vehicleType)
      .single();

    const hourlyRate = data?.hourlyRate || 20;
    const hours = Math.ceil(durationMinutes / 60);
    this.amount = hours * hourlyRate;

    // Update the ticket in Supabase
    await supabase
      .from('tickets')
      .update({ exitTime: this.exitTime, amount: this.amount })
      .eq('ticketID', this.ticketID);

    return this.amount;
  }

  static async getByVehicleNo(vehicleNo: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('vehicleNo', vehicleNo)
      .is('exitTime', null)
      .single();

    if (error || !data) return null;
    return new Ticket(data.ticketID, data.entryTime, data.exitTime, data.amount, data.vehicleNo);
  }
}

export default Ticket;

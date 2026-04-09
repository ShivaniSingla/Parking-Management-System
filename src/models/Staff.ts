import { supabase } from '../lib/supabaseClient';
import User from './User';
import Vehicle from './Vehicle';
import Ticket from './Ticket';
import Parking from './Parking';
import Payment from './Payment';

class Staff extends User {
  constructor(user_email_id: string, password: string = '') {
    super(user_email_id, password);
  }

  async vehicleEntry(
    vehicleNo: string,
    vehicleType: string,
    parking: Parking
  ): Promise<{ success: boolean; ticketID?: string; error?: string }> {
    try {
      // Check if vehicle already parked
      const existing = await Vehicle.getActiveVehicle(vehicleNo);
      if (existing) {
        return { success: false, error: `Vehicle ${vehicleNo} is already parked!` };
      }

      // Check available slots
      if (parking.avaSlots <= 0) {
        return { success: false, error: 'No available slots!' };
      }

      const now = new Date().toISOString();
      const ticketID = `TKT-${Date.now()}`;

      // 1. Insert into vehicles table
      const { error: vehError } = await supabase.from('vehicles').insert([{
        vehicleNo,
        vehicleType,
        entryTime: now,
        exitTime: null,
      }]);
      if (vehError) return { success: false, error: vehError.message };

      // 2. Insert into tickets table
      const { error: tktError } = await supabase.from('tickets').insert([{
        ticketID,
        entryTime: now,
        exitTime: null,
        amount: 0,
        vehicleNo,
      }]);
      if (tktError) return { success: false, error: tktError.message };

      // 3. Call Parking.assignSlots()
      const slotResult = await parking.assignSlots();
      if (!slotResult.success) {
        return { success: false, error: slotResult.error };
      }

      return { success: true, ticketID };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async processExit(
    vehicleNo: string,
    paymentMethod: string,
    parking: Parking
  ): Promise<{ success: boolean; amount?: number; ticketID?: string; error?: string }> {
    try {
      // 1. Get the active vehicle
      const vehicle = await Vehicle.getActiveVehicle(vehicleNo);
      if (!vehicle) {
        return { success: false, error: `No active parking found for ${vehicleNo}` };
      }

      // Set exit time
      vehicle.exitTime = new Date().toISOString();

      // 2. Call Vehicle.calculateTime()
      const durationMinutes = vehicle.calculateTime();

      // 3. Get the active ticket
      const ticket = await Ticket.getByVehicleNo(vehicleNo);
      if (!ticket) {
        return { success: false, error: 'No active ticket found' };
      }
      ticket.exitTime = vehicle.exitTime;

      // 4. Call Ticket.generateBill()
      const amount = await ticket.generateBill(durationMinutes, vehicle.vehicleType);

      // 5. Call Payment.processPay()
      const payID = `PAY-${Date.now()}`;
      const payment = new Payment(payID, amount, paymentMethod, ticket.ticketID);
      const payResult = await payment.processPay();
      if (!payResult.success) {
        return { success: false, error: payResult.error };
      }

      // 6. Update the vehicle exit time in Supabase
      await supabase
        .from('vehicles')
        .update({ exitTime: vehicle.exitTime })
        .eq('vehicleNo', vehicleNo);

      // 7. Call Parking.freeSlots()
      await parking.freeSlots();

      return { success: true, amount, ticketID: ticket.ticketID };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export default Staff;

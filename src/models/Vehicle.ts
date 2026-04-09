import { supabase } from '../lib/supabaseClient';

class Vehicle {
  vehicleNo: string;
  vehicleType: string;
  entryTime: string;
  exitTime: string | null;

  constructor(vehicleNo: string, vehicleType: string, entryTime: string = new Date().toISOString(), exitTime: string | null = null) {
    this.vehicleNo = vehicleNo;
    this.vehicleType = vehicleType;
    this.entryTime = entryTime;
    this.exitTime = exitTime;
  }

  calculateTime(): number {
    if (!this.exitTime) return 0;
    const entry = new Date(this.entryTime);
    const exit = new Date(this.exitTime);
    const diffMs = exit.getTime() - entry.getTime();
    const diffMinutes = Math.ceil(diffMs / 60000);
    return diffMinutes;
  }

  static async getActiveVehicle(vehicleNo: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicleNo', vehicleNo)
      .is('exitTime', null)
      .single();

    if (error || !data) return null;
    return new Vehicle(data.vehicleNo, data.vehicleType, data.entryTime, data.exitTime);
  }

  static async getAllActive(): Promise<Vehicle[]> {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .is('exitTime', null)
      .order('entryTime', { ascending: false });

    return (data || []).map((v: any) => new Vehicle(v.vehicleNo, v.vehicleType, v.entryTime, v.exitTime));
  }
}

export default Vehicle;

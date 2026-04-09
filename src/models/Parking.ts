import { supabase } from '../lib/supabaseClient';

class Parking {
  totalSlots: number;
  avaSlots: number;

  constructor(totalSlots: number = 40, avaSlots: number = 40) {
    this.totalSlots = totalSlots;
    this.avaSlots = avaSlots;
  }

  async assignSlots(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.avaSlots <= 0) {
        return { success: false, error: 'No available slots' };
      }

      const newAvaSlots = this.avaSlots - 1;
      const { error } = await supabase
        .from('parking')
        .update({ avaSlots: newAvaSlots })
        .eq('id', 1);

      if (error) return { success: false, error: error.message };

      this.avaSlots = newAvaSlots;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async freeSlots(): Promise<{ success: boolean; error?: string }> {
    try {
      const newAvaSlots = Math.min(this.avaSlots + 1, this.totalSlots);
      const { error } = await supabase
        .from('parking')
        .update({ avaSlots: newAvaSlots })
        .eq('id', 1);

      if (error) return { success: false, error: error.message };

      this.avaSlots = newAvaSlots;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  static async fetch(): Promise<Parking> {
    const { data } = await supabase
      .from('parking')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      return new Parking(data.totalSlots, data.avaSlots);
    }
    return new Parking();
  }
}

export default Parking;

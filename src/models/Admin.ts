import { supabase } from '../lib/supabaseClient';
import User from './User';

class Admin extends User {
  constructor(user_email_id: string, password: string = '') {
    super(user_email_id, password);
  }

  async viewReport(): Promise<{ tickets: any[]; payments: any[] }> {
    const [ticketsRes, paymentsRes] = await Promise.all([
      supabase.from('tickets').select('*').order('entryTime', { ascending: false }),
      supabase.from('payments').select('*'),
    ]);

    return {
      tickets: ticketsRes.data || [],
      payments: paymentsRes.data || [],
    };
  }

  async updatePrice(vehicleType: string, newRate: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('pricing')
        .update({ hourlyRate: newRate })
        .eq('vehicleType', vehicleType);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async addStaff(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create the auth account
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) return { success: false, error: signUpError.message };

      // Insert into the STAFF child table (not parent users table)
      const { error: insertError } = await supabase.from('staff').upsert([
        { user_email_id: email, password: '', role: 'staff' }
      ]);
      if (insertError) return { success: false, error: insertError.message };

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export default Admin;

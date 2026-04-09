import { supabase } from '../lib/supabaseClient';

class Payment {
  payID: string;
  amount: number;
  method: string;
  ticketID: string;

  constructor(payID: string, amount: number, method: string, ticketID: string) {
    this.payID = payID;
    this.amount = amount;
    this.method = method;
    this.ticketID = ticketID;
  }

  async processPay(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('payments').insert([{
        payID: this.payID,
        amount: this.amount,
        method: this.method,
        ticketID: this.ticketID,
      }]);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export default Payment;

import { supabase } from '../lib/supabaseClient';

class User {
  user_email_id: string;
  password: string;

  constructor(user_email_id: string, password: string = '') {
    this.user_email_id = user_email_id;
    this.password = password;
  }

  async login(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.user_email_id,
        password: this.password,
      });
      if (error) return { success: false, error: error.message };

      // Ensure user exists in either admin or staff table
      if (data.user) {
        const { data: adminRow } = await supabase
          .from('admin')
          .select('*')
          .eq('user_email_id', data.user.email)
          .single();

        if (!adminRow) {
          const { data: staffRow } = await supabase
            .from('staff')
            .select('*')
            .eq('user_email_id', data.user.email)
            .single();

          if (!staffRow) {
            // Auto-create as staff if no record found
            await supabase.from('staff').insert([
              { user_email_id: data.user.email, password: '', role: 'staff' }
            ]);
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getRole(email: string): Promise<'admin' | 'staff'> {
    try {
      const timeoutPromise = new Promise<'staff'>((resolve) => setTimeout(() => resolve('staff'), 3000));
      
      const fetchRole = async (): Promise<'admin' | 'staff'> => {
        // Check admin table first
        const { data: adminRow } = await supabase
          .from('admin')
          .select('role')
          .eq('user_email_id', email)
          .single();

        if (adminRow) return 'admin';

        // Check staff table
        const { data: staffRow } = await supabase
          .from('staff')
          .select('role')
          .eq('user_email_id', email)
          .single();

        if (staffRow) return 'staff';

        return 'staff'; // default
      };

      return await Promise.race([fetchRole(), timeoutPromise]);
    } catch {
      return 'staff';
    }
  }
}

export default User;

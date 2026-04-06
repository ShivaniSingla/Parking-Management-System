import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ParkingSlot, ParkingRecord, PricingPolicy } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  currentUser: User | null;
  slots: ParkingSlot[];
  records: ParkingRecord[];
  pricingPolicy: PricingPolicy[];
  loading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateSlot: (slotId: string, updates: Partial<ParkingSlot>) => Promise<void>;
  addRecord: (record: ParkingRecord) => Promise<void>;
  updateRecord: (recordId: string, updates: Partial<ParkingRecord>) => Promise<void>;
  updatePricing: (updates: PricingPolicy[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [pricingPolicy, setPricingPolicy] = useState<PricingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsRes, recordsRes, pricingRes] = await Promise.all([
        supabase.from('slots').select('*'),
        supabase.from('records').select('*').order('entryTime', { ascending: false }),
        supabase.from('pricing').select('*')
      ]);

      if (slotsRes.error) throw slotsRes.error;
      if (recordsRes.error) throw recordsRes.error;
      if (pricingRes.error) throw pricingRes.error;

      setSlots(slotsRes.data as ParkingSlot[]);
      setRecords(recordsRes.data as ParkingRecord[]);
      setPricingPolicy(pricingRes.data as PricingPolicy[]);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      // Fallback data if table missing during local dev or errors
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Assume admin. In a real app we'd fetch from a users table.
        setCurrentUser({ username: session.user.email || 'user', role: 'admin' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({ username: session.user.email || 'user', role: 'admin' });
      } else {
        setCurrentUser(null);
      }
    });

    fetchInitialData();

    return () => subscription.unsubscribe();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateSlot = async (slotId: string, updates: Partial<ParkingSlot>) => {
    try {
      const { error } = await supabase.from('slots').update(updates).eq('slotId', slotId);
      if (error) throw error;
      setSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, ...updates } : s));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addRecord = async (record: ParkingRecord) => {
    try {
      const { error } = await supabase.from('records').insert([record]);
      if (error) throw error;
      setRecords(prev => [record, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateRecord = async (recordId: string, updates: Partial<ParkingRecord>) => {
    try {
      const { error } = await supabase.from('records').update(updates).eq('recordId', recordId);
      if (error) throw error;
      setRecords(prev => prev.map(r => r.recordId === recordId ? { ...r, ...updates } : r));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updatePricing = async (updates: PricingPolicy[]) => {
    try {
      // Typically we'd delete all and insert, or upsert. Let's use upsert.
      const { error } = await supabase.from('pricing').upsert(updates);
      if (error) throw error;
      setPricingPolicy(updates);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, slots, records, pricingPolicy, loading, error,
      login, logout, updateSlot, addRecord, updateRecord, updatePricing,
      refreshData: fetchInitialData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

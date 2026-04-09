import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ParkingSlot, ParkingRecord, PricingPolicy } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AppContextType {
  currentUser: User | null;
  slots: ParkingSlot[];
  records: ParkingRecord[];
  pricingPolicy: PricingPolicy[];
  loading: boolean;
  isAuthLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateSlot: (slotId: string, updates: Partial<ParkingSlot>) => Promise<void>;
  addRecord: (record: ParkingRecord) => Promise<void>;
  updateRecord: (recordId: string, updates: Partial<ParkingRecord>) => Promise<void>;
  updatePricing: (updates: PricingPolicy[]) => Promise<void>;
  refreshData: () => Promise<void>;
  refreshUserRole: (user: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [pricingPolicy, setPricingPolicy] = useState<PricingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
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

  const fetchUserRole = async (user: any) => {
    console.log("Fetching role for user:", user.email);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Role fetch timeout")), 3000)
      );

      const result = await Promise.race([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        timeoutPromise
      ]) as any;

      if (!result.error && result.data) {
        console.log("Role found:", result.data.role);
        setCurrentUser({ username: user.email || 'user', role: result.data.role });
      } else {
        console.warn("Profile fetch issue, defaulting to staff:", result.error);
        setCurrentUser({ username: user.email || 'user', role: 'staff' });
      }
    } catch (err) {
      console.error("fetchUserRole exception or timeout:", err);
      // On timeout or exception, immediately set a fallback role and move on
      setCurrentUser({ username: user.email || 'user', role: 'staff' });
    }
  };

  useEffect(() => {
    let authSubscription: any = null;

    const initAuth = async () => {
      console.log("Initializing Auth...");
      const authTimeout = setTimeout(() => {
        console.warn("Auth initialization timed out (30s)");
        setIsAuthLoading(false);
      }, 30000);

      try {
        // 1. Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          await fetchUserRole(session.user);
        } else {
          console.log("No active session found during initAuth");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("initAuth error:", err);
      } finally {
        clearTimeout(authTimeout);
        setIsAuthLoading(false);
        console.log("Auth init finished");
      }
    };

    // Initialize Auth
    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth State Changed:", event, session?.user?.email);
      
      if (session?.user) {
        // If we already have the user and it's the same, skip re-fetch unless it's a SIGN_IN event
        await fetchUserRole(session.user);
      } else {
        setCurrentUser(null);
      }
      
      // Also clear loading if it's still stuck
      setIsAuthLoading(false);
    });

    authSubscription = subscription;
    fetchInitialData();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
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
      currentUser, slots, records, pricingPolicy, loading, isAuthLoading, error,
      login, logout, updateSlot, addRecord, updateRecord, updatePricing,
      refreshData: fetchInitialData,
      refreshUserRole: fetchUserRole
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

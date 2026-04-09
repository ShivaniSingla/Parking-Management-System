import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserType, TicketType, ParkingType, PaymentType, PricingType, VehicleType } from '../types';
import { supabase } from '../lib/supabaseClient';
import UserModel from '../models/User';

interface AppContextType {
  currentUser: UserType | null;
  parking: ParkingType;
  tickets: TicketType[];
  payments: PaymentType[];
  vehicles: VehicleType[];
  pricing: PricingType[];
  loading: boolean;
  isAuthLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [parking, setParking] = useState<ParkingType>({ totalSlots: 40, avaSlots: 40 });
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [pricing, setPricing] = useState<PricingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [parkingRes, ticketsRes, paymentsRes, vehiclesRes, pricingRes] = await Promise.allSettled([
        supabase.from('parking').select('*').eq('id', 1).single(),
        supabase.from('tickets').select('*').order('entryTime', { ascending: false }),
        supabase.from('payments').select('*'),
        supabase.from('vehicles').select('*').order('entryTime', { ascending: false }),
        supabase.from('pricing').select('*'),
      ]);

      if (parkingRes.status === 'fulfilled' && parkingRes.value.data) {
        setParking({ totalSlots: parkingRes.value.data.totalSlots, avaSlots: parkingRes.value.data.avaSlots });
      }
      if (ticketsRes.status === 'fulfilled') setTickets((ticketsRes.value.data || []) as TicketType[]);
      if (paymentsRes.status === 'fulfilled') setPayments((paymentsRes.value.data || []) as PaymentType[]);
      if (vehiclesRes.status === 'fulfilled') setVehicles((vehiclesRes.value.data || []) as VehicleType[]);
      if (pricingRes.status === 'fulfilled') setPricing((pricingRes.value.data || []) as PricingType[]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Short timeout to give Supabase time to restore session from localStorage
    const timeout = setTimeout(() => setIsAuthLoading(false), 5000);

    const resolveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const role = await UserModel.getRole(session.user.email);
          setCurrentUser({ user_email_id: session.user.email, role });
          // Fetch data in background without blocking auth state
          fetchInitialData();
        }
      } catch (err) {
        console.error('Session resolve error:', err);
      } finally {
        clearTimeout(timeout);
        setIsAuthLoading(false);
      }
    };

    resolveSession();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const role = await UserModel.getRole(session.user.email);
          setCurrentUser({ user_email_id: session.user.email, role });
          fetchInitialData();
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setTickets([]);
          setPayments([]);
          setVehicles([]);
        }
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, parking, tickets, payments, vehicles, pricing,
      loading, isAuthLoading, error,
      refreshData: fetchInitialData,
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

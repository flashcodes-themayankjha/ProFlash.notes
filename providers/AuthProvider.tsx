// providers/AuthProvider.tsx
import React, { ReactNode } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={null} // for Expo, handled internally
      onAuthStateChange={(event, session) => {
        // Optional: log, handle auth events here if necessary
        console.log('Auth event:', event);
      }}
    >
      {children}
    </SessionContextProvider>
  );
}


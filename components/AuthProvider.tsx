// AuthProvider.tsx
import React from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';

type Props = { children: React.ReactNode };

export default function AuthProvider({ children }: Props) {
  // Use the same Supabase client instance you created
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}


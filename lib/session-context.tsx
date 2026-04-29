'use client';

import { createContext, useContext } from 'react';
import { SessionUser } from './session';

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

/**
 * Returns the current authenticated user from context.
 * Must be used inside a SessionProvider (i.e. within the protected layout).
 */
export function useSession(): SessionUser {
  const user = useContext(SessionContext);
  if (!user) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return user;
}

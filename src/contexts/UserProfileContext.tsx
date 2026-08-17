import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { userProfileRef } from '../firebase/firestore';
import type { UserProfile } from '../types/models';
import { useAuth } from './AuthContext';

interface UserProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextValue>({ profile: null, loading: true });

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(userProfileRef(user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
  }, [user]);

  return (
    <UserProfileContext.Provider value={{ profile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}

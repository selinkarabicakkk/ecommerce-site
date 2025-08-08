'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';

interface ProvidersProps {
  children: ReactNode;
}

function AuthHydrator({ children }: ProvidersProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        dispatch(setCredentials({ user, token }));
      } catch {}
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}
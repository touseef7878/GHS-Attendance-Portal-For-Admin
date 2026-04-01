import { useState, useEffect } from 'react';

const SESSION_KEY = 'ghs_admin_auth';
const CORRECT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export function useAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');

  const login = (password) => {
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  return { authed, login, logout };
}

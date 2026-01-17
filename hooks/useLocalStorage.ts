import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// FIX: Changed React.Dispatch<React.SetStateAction<T>> to Dispatch<SetStateAction<T>> to use imported types.
function useLocalStorage<T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // FIX: Changed React.Dispatch<React.SetStateAction<T>> to Dispatch<SetStateAction<T>> to use imported types.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    // This effect can be used to sync between tabs, but for now it's just for setup.
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
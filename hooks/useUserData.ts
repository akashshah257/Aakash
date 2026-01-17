import useLocalStorage from './useLocalStorage';

function useUserData<T>(key: string, initialValue: T) {
  // Directly use local storage for data persistence
  return useLocalStorage<T>(key, initialValue);
}

export default useUserData;
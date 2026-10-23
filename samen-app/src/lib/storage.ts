import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage can be unavailable (for example in a private browser window). The app then keeps
// working for this session instead of failing.

export async function load(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function save(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn('Opslaan op dit apparaat mislukt', e);
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Nothing stored, nothing to remove.
  }
}

import { useEffect, useState } from 'react';
import { read, write } from './storage';

/** useState that is kept in localStorage */
export default function useStored(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  useEffect(() => {
    write(key, value);
  }, [key, value]);
  return [value, setValue];
}

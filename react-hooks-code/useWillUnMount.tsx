import { useEffect } from 'react';
const useWillUnmount = fn => useEffect(() => () => fn && fn(), []);
export default useWillUnmount;
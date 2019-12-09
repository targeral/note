import {useEffect} from 'react';

export const useDidMount = fn => useEffect(() => fn && fn(), []);
import {useEffect, useRef} from 'react';

export const useDidUpdate = (fn, conditions) => {
    const didMountRef = useRef<boolean>(false);
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }

        return fn && fn();
    }, conditions);
}

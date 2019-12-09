import { useState } from 'react';

const useField =  (initial) => {
    const filed = useState(initial);
    const value = filed[0];
    const set = filed[1];

    return {
        value, 
        set,
        reset: () => set(initial),
        bind: {
            value,
            onChange: e => set(e.target.value)
        }
    }
};

export default useField;
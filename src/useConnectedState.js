import {
    useCallback,
    useLayoutEffect,
    useState
} from 'react';

const setters = {};
const returns = {};
const defaultScope = '__defaultScope__';

function useConnectedState({
        key = '__defaultKey__',
        scope = defaultScope,
        state: defaultState
    } = {}) {
    const [state, setState] = useState(defaultState);

    if (!returns.hasOwnProperty(scope)) {
        returns[scope] = {};
    }

    if (!returns[scope].hasOwnProperty(key)) {
        returns[scope][key] = state;
    }

    const setByKey = useCallback((key, s) => {
        if (returns[scope].hasOwnProperty(key)) {
            const newState = (typeof s === 'function') ? s(returns[scope][key]) : s;

            returns[scope][key] = newState;
            setters[scope][key].forEach(setter => setter(newState));
        }
    }, [scope]);

    const setSharedState = useCallback((s) => {
        const newState = (typeof s === 'function') ? s(returns[scope][key], returns[scope], setByKey) : s;

        returns[scope][key] = newState;
        setters[scope][key].forEach(setter => setter(newState));
    }, [key, scope, setByKey]);

    useLayoutEffect(() => {
        if (!setters.hasOwnProperty(scope)) {
            setters[scope] = {};
        }

        if (!setters[scope].hasOwnProperty(key)) {
            setters[scope][key] = [];
        }

        setters[scope][key].push(setState);
        
        return () => {
            setters[scope][key] = setters[scope][key].filter(setter => setter !== setState);

            if (setters[scope][key].length === 0) {
                delete returns[scope][key];
                delete setters[scope][key];
            }

            if(Object.keys(setters[scope]).length === 0) {
                delete returns[scope];
                delete setters[scope];
            }
        };
    }, [key, scope]);

    return [returns[scope][key], setSharedState];
}

export function getCurrentState(scope = defaultScope) {
    return returns[scope];
}

export default useConnectedState;
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState
} from 'react';

const setters = {};
const returns = {};
const defaultScope = '__defaultScope__';

function useConnectedState({
        key = '__defaultKey__',
        passive = false,
        scope = defaultScope,
        state: defaultState
    } = {}) {
    let setterState = defaultState;

    if (returns[scope] && returns[scope].hasOwnProperty(key) && !passive) {
        setterState = returns[scope][key];
    }

    const [state, setState] = useState(setterState);

    if (!returns.hasOwnProperty(scope)) {
        returns[scope] = {};
    }

    if (!returns[scope].hasOwnProperty(key)) {
        returns[scope][key] = state;
    }

    const getSharedState = useCallback(() => {
        return returns[scope][key];
    }, [key, scope]);

    const passiveSetter = useCallback(() => {}, []);

    const setByKey = useCallback((key, s) => {
        if (returns.hasOwnProperty(scope) && returns[scope].hasOwnProperty(key)) {
            const newState = (typeof s === 'function') ? s(returns[scope][key]) : s;
            const setterState = (typeof newState === 'function') ? () => newState : newState;

            returns[scope][key] = newState;

            if (setters.hasOwnProperty(scope) && setters[scope].hasOwnProperty(key)) {
                setters[scope][key].forEach(setter => setter(setterState));
            }
        }
    }, [scope]);

    const setSharedState = useCallback((s) => {
        if (returns.hasOwnProperty(scope) && returns[scope].hasOwnProperty(key)) {
            const newState = (typeof s === 'function') ? s(returns[scope][key], returns[scope], setByKey) : s;
            const setterState = (typeof newState === 'function') ? () => newState : newState;

            returns[scope][key] = newState;

            if (setters.hasOwnProperty(scope) && setters[scope].hasOwnProperty(key)) {
               setters[scope][key].forEach(setter => setter(setterState)); 
            }
        }
    }, [key, scope, setByKey]);

    useLayoutEffect(() => {
        if (!setters.hasOwnProperty(scope)) {
            setters[scope] = {};
        }

        if (!setters[scope].hasOwnProperty(key)) {
            setters[scope][key] = [];
        }

        setters[scope][key].push(!passive ? setState : passiveSetter); 
    }, [key, passive, scope]);

    useLayoutEffect(() => {
        if (!returns.hasOwnProperty(scope)) {
            returns[scope] = {};
        }
    
        if (!returns[scope].hasOwnProperty(key)) {
            returns[scope][key] = state;
        }
    }, [key, scope, state]);

    useEffect(() => {        
        return () => {
            const compareFunc = !passive ? setState : passiveSetter;

            setters[scope][key] = setters[scope][key].filter(setter => setter !== compareFunc);

            if (setters[scope][key].length === 0) {
                delete returns[scope][key];
                delete setters[scope][key];
            }

            if(Object.keys(setters[scope]).length === 0) {
                delete returns[scope];
                delete setters[scope];
            }
        };
    }, [key, passive, scope]);

    return [passive ? getSharedState : returns[scope][key], setSharedState];
}

export function getCurrentState(scope = defaultScope) {
    return returns[scope];
}

export default useConnectedState;
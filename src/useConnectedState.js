import {
    useCallback,
    useEffect,
    useState
} from 'react';
import useImmediateEffect from 'use-immediate-effect';

const setters = {};
const returns = {};
const defaultScope = '__defaultScope__';

function useConnectedState({
        default: defaultState,
        key = '__defaultKey__',
        passive = false,
        scope = defaultScope,
        state: deprecated_defaultState
    } = {}) {
    let setterState = defaultState !== undefined ? defaultState : deprecated_defaultState;

    if (returns[scope] && returns[scope].hasOwnProperty(key) && !passive) {
        const currentState = returns[scope][key];

        setterState = (typeof currentState === 'function') ? () => currentState : currentState;
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

    useImmediateEffect(() => {
        if (!setters.hasOwnProperty(scope)) {
            setters[scope] = {};
        }

        if (!setters[scope].hasOwnProperty(key)) {
            setters[scope][key] = [];
        }

        setters[scope][key].push(!passive ? setState : passiveSetter); 
    }, [key, passive, scope]);

    useImmediateEffect(() => {
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

export function useConnectedSetter(config) {
    return useConnectedState(config)[1];
}

export function useConnectedValue(config) {
    return useConnectedState(config)[0];
}

export default useConnectedState;
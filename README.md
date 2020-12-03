# use-connected-state
A hook to connect state across React components. No callbacks. No context. No wrappers.

## Installation
`npm install use-connected-state`

## useConnectedState
### Usage

```jsx
import React form 'react';
import useConnectedState from 'use-connected-state';

function Counter() {
    const [count, setCount] = useConnectedState({ key: 'count', state: 0 });

    return (<div>
        <div>Count: {count}</div>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>);
}

export default Counter;
```
This component when used by itself will work like any normal functional component that uses `useState`. If you add more than one anywhere in your tree, incrementing or decrementing any one of them will update the `count` of all of them. The components do not have to be of the same type, just have the same `key` and optionally `scope` in the state config.

Just like `useState`, `useConnectedState` returns the value and a setter function. Also just like `useState`, you can pass the setter function a function which will receive the previous (current really) value as the first argument, but it also gets 2 more arguments: an object containing all of the `state` in the current `scope` and a setter function that allows you to update any piece of `state` by its `key`.

Let's say we have a component that shows how many times our counter has been clicked.
```jsx
import useConnectedState from 'use-connected-state';

function Clicks() {
    const [clicks] = useConnectedState({ key: 'clicks', state: 0 });

    return (<div>Total Clicks: {clicks}</div>);
}

export default Clicks;
```

We can change our counter to update the clicks of the Clicks component.

```jsx
function Counter() {
    const [count, setCount] = useConnectedState({ key: 'count', state: 0 });

    const increment = () => {
        setCount((val, results, setByKey) => {
            // Using results to get the current value of clicks
            setByKey('clicks', results.clicks + 1);

            return val + 1;
        });
    };

    const decrement = () => {
        setCount((val, results, setByKey) => {
            // Passing an updater function which gets the current value of clicks
            setByKey('clicks', currClicks => currClicks + 1);

            return val - 1;
        });
    };

    return (<div>
        <div>Count: {count}</div>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
    </div>);
}
```
If the Clicks component does not exist the `setByKey` call is ignored allowing the Counter to still work.

### State Config
`useConnectedState` takes an optional state config object.
#### Properties
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `string` | `__defaultKey__` | (Optional) A `key` for the `state`. Any componets using `useConnectedState` with the same `key` and `scope` will be updated when `state` with that `key` is updated. |
| `state` | any | `undefined` | (Optional) The default `state` for the given `key` and `scope`. The first component for the given `key` and `scope` will set the default `state` for all that follow. Subsequent components do not even need to pass this. As with `useState`, you can pass a function which returns the default state and it will only be executed on the first render. |
| `scope` | `string` | `__defaultScope__` | (Optional) Provides `scope` for the `state`. Allows multiple components use the same `key` for `state` but not cause updates to each other. |

## Getting All State
The `getCurrentState(<scope>)` method that returns all `state` for the optionally specified `scope`. If `scope` is not specified it returns the `state` for the default `scope`.

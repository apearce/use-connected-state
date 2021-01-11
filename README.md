# use-connected-state
Hook to connect state chages across React components. No callbacks. No context. No wrappers.

## Installation
`npm install use-connected-state`

## useConnectedState
### Usage
`useConnectedState`, along with `useConnectedValue` and `useConnectedSetter`, let you connect `state` changes across components anywhere in the tree. When `state` changes in one component, it will be updated in other components connected to the same `state`, triggering a re-render.

Let's say you have a `Input` component and another component that shows the number of characters the user entered. You could wrap these in a single component but they may not live by each other in the layout.
```jsx
// input.jsx
import useConnectedState from 'use-connected-state';

function Input() {
    const [chars, setChars] = useConnectedState({ key: 'chars', default: '' });
    const onChange = (e) => {
        setChars(e.target.value);
    };

    return (<input type="text" onChange={onChange} value={chars} />);
}

export default Input;
```
```jsx
// character-count.jsx
import { useConnectedValue } from 'use-connected-state';

function CharacterCount() {
    const chars = useConnectedValue({ key: 'chars', default: '' });

    return (<p>Character Count: {chars.length}</p>);
}

export default CharacterCount;
```
The `Input` component when used by itself will work like any normal functional component that uses `useState`. You can add the `CharacterCount` component anywhere in the tree it will automatically show the count of characters from the `Input` component.

Just like `useState`, `useConnectedState` returns the value and a setter function. Also just like `useState`, you can pass the setter function a function which will receive the previous (current really) value as the first argument, but it also gets 2 more arguments: an object containing all of the `state` in the current `scope` and a setter function that allows you to update any piece of `state` by its `key`.

Let's say we have a component that shows how many times a counter has been clicked.
```jsx
// clicks.jsx
import { useConnectedValue } from 'use-connected-state';

function Clicks() {
    const clicks = useConnectedValue({ key: 'clicks', default: 0 });

    return (<div>Total Clicks: {clicks}</div>);
}

export default Clicks;
```

Our `Counter` component can update the `clicks` of the `Clicks` component.

```jsx
// counter.jsx
function Counter() {
    const [count, setCount] = useConnectedState({ key: 'count', default: 0 });

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
If the `Clicks` component does not exist the `setByKey` call is ignored allowing the `Counter` to still work.

### State Config
`useConnectedState` hooks take an optional state config object.
#### Properties
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `string` | `__defaultKey__` | (Optional) A `key` for the `state`. Any componets using `useConnectedState` with the same `key` and `scope` will be updated when `state` with that `key` is updated. |
| `default` | any | `undefined` | (Optional) The default `state` for the given `key` and `scope`. The first component for the given `key` and `scope` will set the default `state` for all that follow. Subsequent components do not even need to pass this. As with `useState`, you can pass a function which returns the default `state` and it will only be executed on the first render. |
| `state` | any | `undefined` | (Optional) **Deprecated** - replaced by `default` which makes more sense. |
| `scope` | `string` | `__defaultScope__` | (Optional) Provides `scope` for the `state`. Allows multiple components use the same `key` for `state` but not cause updates to each other. |
| `passive` | `boolean` | `false` | (Optional) Allows you to passively get and set `state`. When `passive` is `true`, updates to that `state` will **not** trigger a re-render of the component. Also, when `true` the hook returns 2 functions: one to get the current value and one to set the value. |

## Other Hooks
If you just want set or get the value of state you can use `useConnectedSetter` or `useConnectedValue` respectively. These are named exports so you would import them like
```jsx
import { useConnectedSetter } from 'use-connected-state';
```
They take the same state config object as `useConnectedState`. When using `useConnectedSetter` you probably don't want that component to update when that `state` changes since you're not using the `value`, so you may want to add `passive: true` to the config.

```jsx
// click-count.jsx
import { useConnectedValue } from 'use-connected-state';

function ClickCount() {
    const clicks = useConnectedValue({ key: 'clicks', default: 0 });

    return (<div>Total Clicks: {clicks}</div>);
}

export default ClickCount;
```
```jsx
// clicker.jsx
import { useConnectedSetter } from 'use-connected-state';

function Clicker() {
    const setClicks = useConnectedSetter({ key: 'clicks', default: 0, passive: true });

    const onClick = () => {
        setClicks(clicks => clicks + 1);
    };

    return (<button onClick={onClick}>Click Me</button>);
}

export default Clicker;
```
## Getting All State
The `getCurrentState(<scope>)` method that returns all `state` for the optionally specified `scope`. If `scope` is not specified it returns the `state` for the default `scope`.

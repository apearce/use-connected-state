import { act, renderHook } from '@testing-library/react-hooks';
import useConnectedState, { getCurrentState } from '../src/useConnectedState';

const testFunctionState = () => 'testFunctionState';

describe('useConnectedState Hook', () => {
  test('Test that state is set', () => {
    const { result } = renderHook(() => useConnectedState({ state: 'Test State' }));

    expect(result.current[0]).toBe('Test State');
  });

  test('Test that state is connected', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ state: 'Connected State' }));
    const { result: result2 } = renderHook(() => useConnectedState({ }));

    expect(result1.current[0]).toBe('Connected State');
    expect(result2.current[0]).toBe('Connected State');
  });

  test('Test that updated state is connected', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ state: 'Original State' }));
    const { result: result2 } = renderHook(() => useConnectedState({ state: 'Original State' }));

    expect(result1.current[0]).toBe('Original State');
    expect(result2.current[0]).toBe('Original State');
  
    act(() => {
      result2.current[1]('New State');
    });
  
    expect(result1.current[0]).toBe('New State');
    expect(result2.current[0]).toBe('New State');
  });

  test('Test that state is connected with key', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'key', state: 'Connected State' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'key' }));

    expect(result1.current[0]).toBe('Connected State');
    expect(result2.current[0]).toBe('Connected State');
  });

  test('Test that multiple updated state is connected', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'key', state: 'Original State' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'key', state: 'Original State' }));
    const { result: result3 } = renderHook(() => useConnectedState({ key: 'key', state: 'Original State' }));
    const { result: result4 } = renderHook(() => useConnectedState({ key: 'key', state: 'Original State' }));

    expect(result1.current[0]).toBe('Original State');
    expect(result2.current[0]).toBe('Original State');
    expect(result3.current[0]).toBe('Original State');
    expect(result4.current[0]).toBe('Original State');
  
    act(() => {
      result3.current[1]('New State');
    });
  
    expect(result1.current[0]).toBe('New State');
    expect(result2.current[0]).toBe('New State');
    expect(result3.current[0]).toBe('New State');
    expect(result4.current[0]).toBe('New State');
  });

  test('Test setting a function as state', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ }));
    const { result: result2 } = renderHook(() => useConnectedState({ }));

    expect(result1.current[0]).toBe(undefined);
    expect(result2.current[0]).toBe(undefined);
  
    act(() => {
      result2.current[1](() => testFunctionState);
    });
  
    expect(result1.current[0]).toBe(testFunctionState);
    expect(result2.current[0]).toBe(testFunctionState);
    expect(result1.current[0]()).toBe('testFunctionState');
    expect(result2.current[0]()).toBe('testFunctionState');
  });

  test('Test using setByKey', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'foo', state: 'FOO' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'bar', state: 'BAR' }));

    expect(result1.current[0]).toBe('FOO');
    expect(result2.current[0]).toBe('BAR');

    act(() => {
      result1.current[1]((cur, res, setByKey) => {
        setByKey('bar', res.bar.toLowerCase());

        return cur.toLowerCase();
      });
    });

    expect(result1.current[0]).toBe('foo');
    expect(result2.current[0]).toBe('bar');
  });

  test('Test setting a function as state using setByKey', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'foo', state: 'FOO' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'bar', state: 'BAR' }));

    expect(result1.current[0]).toBe('FOO');
    expect(result2.current[0]).toBe('BAR');

    act(() => {
      result1.current[1]((cur, res, setByKey) => {
        setByKey('bar', () => testFunctionState);

        return testFunctionState;
      });
    });

    expect(result1.current[0]).toBe(testFunctionState);
    expect(result2.current[0]).toBe(testFunctionState);
    expect(result1.current[0]()).toBe('testFunctionState');
    expect(result2.current[0]()).toBe('testFunctionState');
  });
});

describe('useConnectedState Hook with scpoe', () => {
  test('Test that state is connected', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ state: 'Connected State', scope: 'foo' }));
    const { result: result2 } = renderHook(() => useConnectedState({ scope: 'foo' }));

    expect(result1.current[0]).toBe('Connected State');
    expect(result2.current[0]).toBe('Connected State');
  });

  test('Test that state is not connected', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'test', state: 'Not connected', scope: 'foo' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'test', state: 'Not connected either', scope: 'bar' }));

    expect(result1.current[0]).toBe('Not connected');
    expect(result2.current[0]).toBe('Not connected either');
  });

  test('Test that state is not connected using setByKey', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'foo', state: 'FOO', scope: 'foo' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'bar', state: 'BAR', scope: 'bar' }));

    expect(result1.current[0]).toBe('FOO');
    expect(result2.current[0]).toBe('BAR');

    act(() => {
      result1.current[1]((cur, res, setByKey) => {
        setByKey('bar', 'bar');

        return cur.toLowerCase();
      });
    });

    expect(result1.current[0]).toBe('foo');
    expect(result2.current[0]).toBe('BAR');
  });
});

describe('getCurrentState', () => {
  test('getCurrentState default scope', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'test', state: 'Some state' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'test2', state: 'Some state too' }));

    expect(JSON.stringify(getCurrentState())).toBe('{"test":"Some state","test2":"Some state too"}');
  });

  test('getCurrentState scoped', () => {
    const { result: result1 } = renderHook(() => useConnectedState({ key: 'test', state: 'Some state', scope: 'foo' }));
    const { result: result2 } = renderHook(() => useConnectedState({ key: 'test2', state: 'Some state too', scope: 'bar' }));

    expect(JSON.stringify(getCurrentState())).toBe(undefined);
    expect(JSON.stringify(getCurrentState('foo'))).toBe('{"test":"Some state"}');
    expect(JSON.stringify(getCurrentState('bar'))).toBe('{"test2":"Some state too"}');
  });
});
import { act, renderHook } from '@testing-library/react-hooks';
import useConnectedState, { getCurrentState } from '../src/useConnectedState';

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
      result2.current[1]('New State')
    });
  
    expect(result1.current[0]).toBe('New State');
    expect(result2.current[0]).toBe('New State');
  });
});
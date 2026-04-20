import { useRef, useCallback } from 'react';

export interface HistoryEntry<T> {
  state: T;
  label: string;
}

export function useUndoRedo<T>(initialState: T) {
  const history = useRef<HistoryEntry<T>[]>([{ state: initialState, label: 'Initial' }]);
  const pointer = useRef(0);

  const push = useCallback((state: T, label: string) => {
    history.current = history.current.slice(0, pointer.current + 1);
    history.current.push({ state, label });
    if (history.current.length > 50) {
      history.current = history.current.slice(history.current.length - 50);
    }
    pointer.current = history.current.length - 1;
  }, []);

  const undo = useCallback((): HistoryEntry<T> | null => {
    if (pointer.current <= 0) return null;
    pointer.current--;
    return history.current[pointer.current];
  }, []);

  const redo = useCallback((): HistoryEntry<T> | null => {
    if (pointer.current >= history.current.length - 1) return null;
    pointer.current++;
    return history.current[pointer.current];
  }, []);

  const getCanUndo = () => pointer.current > 0;
  const getCanRedo = () => pointer.current < history.current.length - 1;

  return { push, undo, redo, getCanUndo, getCanRedo };
}

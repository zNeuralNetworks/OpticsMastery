import { useEffect, useState } from 'react';

export interface SnapshotRecord<T> {
  id: string;
  name: string;
  timestamp: number;
  state: T;
}

const createSnapshotId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const useLocalSnapshots = <T,>(storageKey: string) => {
  const [snapshots, setSnapshots] = useState<SnapshotRecord<T>[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return;
      }

      setSnapshots(JSON.parse(saved));
    } catch (error) {
      console.warn(`Failed to load snapshots for ${storageKey}:`, error);
    }
  }, [storageKey]);

  const persistSnapshots = (nextSnapshots: SnapshotRecord<T>[]) => {
    setSnapshots(nextSnapshots);

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextSnapshots));
    } catch (error) {
      console.warn(`Failed to save snapshots for ${storageKey}:`, error);
    }
  };

  const saveSnapshot = (name: string, state: T) => {
    const nextSnapshot: SnapshotRecord<T> = {
      id: createSnapshotId(),
      name,
      timestamp: Date.now(),
      state,
    };

    persistSnapshots([...snapshots, nextSnapshot]);
  };

  const deleteSnapshot = (id: string) => {
    persistSnapshots(snapshots.filter((snapshot) => snapshot.id !== id));
  };

  return {
    snapshots,
    saveSnapshot,
    deleteSnapshot,
  };
};

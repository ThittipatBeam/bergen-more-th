"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LeaderboardMode } from "@/types/benchmark";

export type Dataset = LeaderboardMode;

export interface DatasetContextType {
  dataset: Dataset;
  isNiti: boolean;
  setDataset: (dataset: Dataset) => void;
}

const defaultContext: DatasetContextType = {
  dataset: "wikipedia",
  isNiti: false,
  setDataset: () => {},
};

const DatasetContext = createContext<DatasetContextType>(defaultContext);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDatasetState] = useState<Dataset>("wikipedia");

  useEffect(() => {
    const saved = localStorage.getItem("dataset") as Dataset | null;
    if (saved === "wikipedia" || saved === "nitibench") {
      queueMicrotask(() => setDatasetState(saved));
    }
  }, []);

  const setDataset = useCallback((next: Dataset) => {
    setDatasetState(next);
    localStorage.setItem("dataset", next);
  }, []);

  const value = useMemo(
    () => ({
      dataset,
      isNiti: dataset === "nitibench",
      setDataset,
    }),
    [dataset, setDataset]
  );

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}

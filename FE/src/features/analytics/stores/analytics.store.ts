import { create } from "zustand";

interface AnalyticsState {
  selectedMonth: number;
  selectedYear: number;
  
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

const currentDatetime = new Date();

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  selectedMonth: currentDatetime.getMonth() + 1,
  selectedYear: currentDatetime.getFullYear(),

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),
}));

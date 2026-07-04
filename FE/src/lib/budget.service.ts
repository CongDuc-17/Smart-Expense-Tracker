
import { apiClient } from './apiClient'; 

export const getBudgets = async (month: number, year: number) => {
  // apiClient của bạn đã tự động đính kèm token rồi, 
  // nên bạn không cần lo header nữa, chỉ cần gọi như này thôi:
  const data = await apiClient.get(`/budgets?month=${month}&year=${year}`);
  return data; 
};
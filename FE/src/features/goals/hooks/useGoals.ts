import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";


export const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => apiClient.get("/saving-goals").then((res) => res.data),
  });
};


export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; targetAmount: number }) => 
      apiClient.post("/saving-goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    
    mutationFn: (data: { id: string; amount: number }) => 
      apiClient.post(`/saving-goals/${data.id}/deposits`, data), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};
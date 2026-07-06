import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSavingGoalStore } from "@/features/saving-goals/stores/saving-goal.store";
import type { SavingGoalTabFilter } from "@/features/saving-goals/types/saving-goal.types";

export function SavingGoalFilters() {
  const { activeTab, setActiveTab } = useSavingGoalStore();

  return (
    <div className="flex items-center justify-between w-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as SavingGoalTabFilter)}
        className="w-full sm:w-auto"
      >
        <TabsList className="bg-muted p-1 border border-border rounded-md grid w-full grid-cols-3 sm:w-auto sm:inline-flex h-9">
          <TabsTrigger
            value="ALL"
            className="text-xs font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded transition-all duration-200"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="IN_PROGRESS"
            className="text-xs font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded transition-all duration-200"
          >
            Đang thực hiện
          </TabsTrigger>
          <TabsTrigger
            value="COMPLETED"
            className="text-xs font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded transition-all duration-200"
          >
            Hoàn thành
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

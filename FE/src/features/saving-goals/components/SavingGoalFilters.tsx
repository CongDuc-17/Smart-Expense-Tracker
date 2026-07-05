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
        <TabsList className="bg-[#F7F6F3] p-1 border border-[#E8E7E5] rounded-md grid w-full grid-cols-3 sm:w-auto sm:inline-flex h-9">
          <TabsTrigger
            value="ALL"
            className="text-xs font-medium text-[#9B9A97] data-[state=active]:bg-white data-[state=active]:text-[#37352F] data-[state=active]:shadow-sm rounded transition-all duration-200"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="IN_PROGRESS"
            className="text-xs font-medium text-[#9B9A97] data-[state=active]:bg-white data-[state=active]:text-[#37352F] data-[state=active]:shadow-sm rounded transition-all duration-200"
          >
            Đang thực hiện
          </TabsTrigger>
          <TabsTrigger
            value="COMPLETED"
            className="text-xs font-medium text-[#9B9A97] data-[state=active]:bg-white data-[state=active]:text-[#37352F] data-[state=active]:shadow-sm rounded transition-all duration-200"
          >
            Hoàn thành
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

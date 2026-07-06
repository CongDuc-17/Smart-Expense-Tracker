import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SavingGoalCard } from "./SavingGoalCard";
import { SavingGoalFilterBar, type SavingFilterType, type SavingSortType } from "./SavingGoalFilterBar";
import { useDebounce } from "@/hooks/use-debounce";
import { differenceInDays } from "date-fns";
import type { SavingGoal } from "@/features/saving-goals/types/saving-goal.types";

interface SavingGoalListProps {
  goals: SavingGoal[];
  onEdit: (goal: SavingGoal) => void;
  onDeposit: (goal: SavingGoal) => void;
  onDelete: (goal: SavingGoal) => void;
}

export function SavingGoalList({ goals, onEdit, onDeposit, onDelete }: SavingGoalListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterType, setFilterType] = useState<SavingFilterType>("ALL");
  const [sortType, setSortType] = useState<SavingSortType>("ALMOST_DONE");

  const filteredAndSortedGoals = useMemo(() => {
    let result = [...goals];

    // 1. Filter by FilterType
    if (filterType !== "ALL") {
      result = result.filter((g) => {
        if (filterType === "IN_PROGRESS") return !g.isCompleted;
        if (filterType === "COMPLETED") return g.isCompleted;
        if (filterType === "OVERDUE") {
          if (!g.deadline || g.isCompleted) return false;
          return differenceInDays(new Date(g.deadline), new Date()) < 0;
        }
        return true;
      });
    }

    // 2. Search
    if (debouncedSearchQuery.trim()) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter((g) => g.title.toLowerCase().includes(lowerQuery));
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortType) {
        case "ALMOST_DONE": {
          return b.progressPercentage - a.progressPercentage;
        }
        case "DEADLINE_NEAR": {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        case "AMOUNT_HIGH":
          return Number(b.targetAmount) - Number(a.targetAmount);
        case "NEWEST":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [goals, filterType, debouncedSearchQuery, sortType]);

  if (filteredAndSortedGoals.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Không tìm thấy mục tiêu nào phù hợp với bộ lọc.
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div>
      <SavingGoalFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        sortType={sortType}
        onSortChange={setSortType}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredAndSortedGoals.map((goal) => (
          <motion.div key={goal.id} variants={itemVariants}>
            <SavingGoalCard
              goal={goal}
              onEdit={onEdit}
              onDeposit={onDeposit}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

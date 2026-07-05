
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore, useUserInitials, useUserRole } from "../stores/user.store";

export function ProfileSection() {
  const user = useUserStore((state) => state.currentUser);
  const initials = useUserInitials();
  const role = useUserRole();

  if (!user) return null;

  const joinedDate = user.createdAt
    ? `Tham gia tháng ${format(new Date(user.createdAt), "M, yyyy", { locale: vi })}`
    : "Tham gia gần đây";

  return (
    <div className="flex items-center gap-5 p-6 bg-white border border-[#E8E7E5] rounded-xl shadow-sm mb-6">
      <Avatar className="h-20 w-20 rounded-xl">
        <AvatarImage src={user.avatar || undefined} alt={user.name} />
        <AvatarFallback className="rounded-xl bg-[#37352F] text-white text-2xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#37352F]">{user.name}</h2>
        <p className="text-[#9B9A97] text-sm">{user.email}</p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="px-2 py-0.5 bg-[#F7F6F3] text-[#5A5A57] font-medium rounded-md">
            {role}
          </span>
          <span className="text-[#9B9A97]">&bull;</span>
          <span className="text-[#9B9A97]">{joinedDate}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NavMain — Sidebar Navigation Links
// Sử dụng NavLink của React Router để highlight active route.
// ============================================================

import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
  label?: string;
}) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-xs text-[#9B9A97] font-medium uppercase tracking-wider px-2 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  "text-[#9B9A97] hover:text-[#37352F] hover:bg-[rgba(55,53,47,0.06)]",
                  "transition-colors duration-150 rounded-md"
                )}
              >
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm",
                      isActive
                        ? "bg-[rgba(55,53,47,0.08)] text-[#37352F] font-medium"
                        : "text-[#9B9A97]"
                    )
                  }
                >
                  {item.icon && (
                    <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

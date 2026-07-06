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
        <SidebarGroupLabel className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-2 mb-1">
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
                  "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-150 rounded-md"
                )}
              >
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm",
                      isActive
                        ? "bg-[rgba(55,53,47,0.08)] text-foreground font-medium"
                        : "text-muted-foreground"
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

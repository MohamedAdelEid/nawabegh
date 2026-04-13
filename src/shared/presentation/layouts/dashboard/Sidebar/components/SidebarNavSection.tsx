import type React from "react";
import type { SidebarItem } from "@/shared/domain/types/sidebar.types";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarNavSectionProps {
  items: SidebarItem[];
  startIndex?: number;
  isCollapsed: boolean;
  activeItemId: string;
  resolveLabel: (item: SidebarItem) => string;
  onItemClick: (item: SidebarItem) => void;
}

export const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({
  items,
  startIndex = 0,
  isCollapsed,
  activeItemId,
  resolveLabel,
  onItemClick,
}) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <SidebarNavItem
          key={item.id}
          item={item}
          displayLabel={resolveLabel(item)}
          index={startIndex + index}
          isCollapsed={isCollapsed}
          isActive={activeItemId === item.id}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
};

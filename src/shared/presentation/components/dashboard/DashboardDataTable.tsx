"use client";

import type React from "react";
import { cn } from "@/shared/application/lib/cn";

export type DashboardDataTableColumn<TRow> = {
  id: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  renderCell: (row: TRow) => React.ReactNode;
};

interface DashboardDataTableProps<TRow> {
  rows: TRow[];
  columns: Array<DashboardDataTableColumn<TRow>>;
  getRowKey: (row: TRow) => React.Key;
  emptyMessage: React.ReactNode;
  onRowClick?: (row: TRow) => void;
  rowClassName?: string | ((row: TRow) => string | undefined);
  tableClassName?: string;
  containerClassName?: string;
  actionsHeader?: React.ReactNode;
  actionsHeaderClassName?: string;
  actionsCellClassName?: string;
  renderActions?: (row: TRow) => React.ReactNode;
}

export function DashboardDataTable<TRow>({
  rows,
  columns,
  getRowKey,
  emptyMessage,
  onRowClick,
  rowClassName,
  tableClassName,
  containerClassName,
  actionsHeader,
  actionsHeaderClassName,
  actionsCellClassName,
  renderActions,
}: DashboardDataTableProps<TRow>) {
  const hasActions = Boolean(renderActions);
  const colSpan = columns.length + (hasActions ? 1 : 0);

  return (
    <div className={cn("overflow-x-auto", containerClassName)}>
      <table className={cn("min-w-full text-start", tableClassName)}>
        <thead>
          <tr className="border-b border-slate-100 text-sm text-slate-400">
            {columns.map((column) => (
              <th
                key={column.id}
                className={cn("px-6 py-5 font-medium", column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
            {hasActions ? (
              <th className={cn("px-6 py-5 font-medium", actionsHeaderClassName)}>
                {actionsHeader}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="px-6 py-12 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  "border-b border-slate-100 text-sm text-slate-700 transition-colors duration-200",
                  onRowClick && "cursor-pointer hover:bg-slate-50/70",
                  typeof rowClassName === "function" ? rowClassName(row) : rowClassName,
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.id} className={cn("px-6 py-5", column.cellClassName)}>
                    {column.renderCell(row)}
                  </td>
                ))}
                {hasActions ? (
                  <td className={cn("px-6 py-5", actionsCellClassName)}>
                    {renderActions?.(row)}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

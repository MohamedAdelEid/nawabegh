"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/shared/application/lib/cn";

/** Responsive chart height — pair with an aspect-ratio class on ChartContainer */
export const chartResponsiveHeightClass = "h-48 w-full sm:h-56 md:h-72";

/** Taller variant for dashboards that need extra chart vertical space */
export const chartResponsiveHeightLgClass = "h-48 w-full sm:h-64 md:h-80";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `[data-chart=${chartId}] { ${Object.entries(config)
              .map(([key, item]) => `--color-${key}: ${item.color ?? "currentColor"};`)
              .join(" ")} }`,
          }}
        />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  className?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const itemConfig = config[key];
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {itemConfig?.label ?? item.name ?? key}
              </span>
              <span className="font-mono font-medium text-foreground">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : String(item.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { RechartsPrimitive as Recharts };

"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, Clock, GraduationCap, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { JourneyPath, JourneyStation } from "@/modules/admin/domain/data/journeyEditorData";
import { getStationEditorHref } from "@/modules/admin/domain/utils/journeyEditorRoutes";
import { cn } from "@/shared/application/lib/cn";
import { JourneyStationCard } from "./JourneyStationCard";

interface Props {
  journeyId: string;
  path: JourneyPath;
  onAddStation: (pathId: string) => void;
  onDeleteStation: (stationId: string) => void;
  onDeletePath?: (pathId: string) => void;
}

export function JourneyPathCard({
  journeyId,
  path,
  onAddStation,
  onDeleteStation,
  onDeletePath,
}: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.editor");
  const [collapsed, setCollapsed] = useState(path.isCollapsed);
  const [orderedStations, setOrderedStations] = useState(path.stations);
  const stationIds = useMemo(
    () => orderedStations.map((station) => station.id),
    [orderedStations],
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setOrderedStations(path.stations);
  }, [path.stations]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedStations((currentStations) => {
      const oldIndex = currentStations.findIndex((station) => station.id === active.id);
      const newIndex = currentStations.findIndex((station) => station.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return currentStations;
      return arrayMove(currentStations, oldIndex, newIndex);
    });
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0px_4px_0px_0px_#0000000D] overflow-hidden">
      <div className="flex items-center gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#2C4260]">
          <GraduationCap className="h-5 w-5 text-[#D97706]" />
        </div>

        <div className="flex flex-1 flex-col">
          <p className="font-bold text-slate-800">{path.title}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {t("path.stationsCount", { count: path.stations.length })}
            {" · "}
            <Clock className="inline-block h-3 w-3 align-middle" />
            {" "}
            {path.durationMinutes} {t("path.minutes")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 transition-colors"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>

        {onDeletePath ? (
          <button
            type="button"
            onClick={() => onDeletePath(path.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            aria-label={t("path.deletePath")}
            title={t("path.deletePath")}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="space-y-2 px-5 pb-5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={stationIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {orderedStations.map((station) => (
                  <SortableStationCard
                    key={station.id}
                    journeyId={journeyId}
                    station={station}
                    onDelete={onDeleteStation}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() => onAddStation(path.id)}
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200",
              "py-3 text-sm font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]",
            )}
          >
            <Plus className="h-4 w-4" />
            {t("path.addStation")}
          </button>
        </div>
      ) : (
        <div className="px-5 pb-4">
          <button
            type="button"
            onClick={() => onAddStation(path.id)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200",
              "py-3 text-sm font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]",
            )}
          >
            <Plus className="h-4 w-4" />
            {t("path.addStation")}
          </button>
        </div>
      )}
    </div>
  );
}

interface SortableStationCardProps {
  journeyId: string;
  station: JourneyStation;
  onDelete?: (stationId: string) => void;
}

function SortableStationCard({ journeyId, station, onDelete }: SortableStationCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: station.id });

  const editorHref = getStationEditorHref(journeyId, station);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "relative z-10 opacity-80")}
    >
      <JourneyStationCard
        station={station}
        editorHref={editorHref}
        onNavigate={
          editorHref ? () => router.push(editorHref) : undefined
        }
        dragActivatorRef={setActivatorNodeRef}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        onDelete={onDelete}
      />
    </div>
  );
}

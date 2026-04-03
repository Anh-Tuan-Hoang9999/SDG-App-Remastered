import React, { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SDG_DATA } from "@/lib/sdgData";
import { Badge } from "@/components/ui/badge";
import SDGFlipCard from "@/components/sdg/SDGFlipCard";
import { RotateCcw, Save, Shuffle } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../authContext";
import E_PRINT_01 from "../assets/GoalSDG/E_PRINT_01.jpg";
import E_PRINT_02 from "../assets/GoalSDG/E_PRINT_02.jpg";
import E_PRINT_03 from "../assets/GoalSDG/E_PRINT_03.jpg";
import E_PRINT_04 from "../assets/GoalSDG/E_PRINT_04.jpg";
import E_PRINT_05 from "../assets/GoalSDG/E_PRINT_05.jpg";
import E_PRINT_06 from "../assets/GoalSDG/E_PRINT_06.jpg";
import E_PRINT_07 from "../assets/GoalSDG/E_PRINT_07.jpg";
import E_PRINT_08 from "../assets/GoalSDG/E_PRINT_08.jpg";
import E_PRINT_09 from "../assets/GoalSDG/E_PRINT_09.jpg";
import E_PRINT_10 from "../assets/GoalSDG/E_PRINT_10.jpg";
import E_PRINT_11 from "../assets/GoalSDG/E_PRINT_11.jpg";
import E_PRINT_12 from "../assets/GoalSDG/E_PRINT_12.jpg";
import E_PRINT_13 from "../assets/GoalSDG/E_PRINT_13.jpg";
import E_PRINT_14 from "../assets/GoalSDG/E_PRINT_14.jpg";
import E_PRINT_15 from "../assets/GoalSDG/E_PRINT_15.jpg";
import E_PRINT_16 from "../assets/GoalSDG/E_PRINT_16.jpg";
import E_PRINT_17 from "../assets/GoalSDG/E_PRINT_17.jpg";

const PILES = [
  { id: "most_relevant", label: "Most Relevant", tone: "bg-green-50 border-green-200" },
  { id: "somewhat_relevant", label: "Somewhat Relevant", tone: "bg-amber-50 border-amber-200" },
  { id: "least_relevant", label: "Least Relevant", tone: "bg-rose-50 border-rose-200" },
];

const ALL_CONTAINER_IDS = ["unsorted", ...PILES.map((pile) => pile.id)];

const GOAL_IMAGES = {
  1: E_PRINT_01,
  2: E_PRINT_02,
  3: E_PRINT_03,
  4: E_PRINT_04,
  5: E_PRINT_05,
  6: E_PRINT_06,
  7: E_PRINT_07,
  8: E_PRINT_08,
  9: E_PRINT_09,
  10: E_PRINT_10,
  11: E_PRINT_11,
  12: E_PRINT_12,
  13: E_PRINT_13,
  14: E_PRINT_14,
  15: E_PRINT_15,
  16: E_PRINT_16,
  17: E_PRINT_17,
};

function SdgChip({ sdg }) {
  return (
    <div className="w-[130px] sm:w-[150px]" title={sdg.title}>
      <SDGFlipCard sdg={sdg} />
    </div>
  );
}

function SortableSdgChip({ id, sdg }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...attributes}
      {...listeners}
      className="touch-none cursor-grab active:cursor-grabbing"
    >
      <SdgChip sdg={sdg} />
    </div>
  );
}

function DroppableColumn({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all ${isOver ? "ring-2 ring-primary/40" : ""}`}
    >
      {children}
    </div>
  );
}

function MockButton({
  children,
  onClick,
  disabled = false,
  variant = "solid",
  className = "",
  type = "button",
}) {
  const variantClass =
    variant === "outline"
      ? "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
      : variant === "ghost"
        ? "text-foreground hover:bg-accent"
        : "bg-primary text-primary-foreground hover:opacity-90";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

export default function CardSort() {
  const { user } = useAuth();
  const initial = useMemo(() => SDG_DATA.map((s) => s.number), []);
  const [columns, setColumns] = useState({
    unsorted: initial,
    most_relevant: [],
    somewhat_relevant: [],
    least_relevant: [],
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSavedSort, setLoadingSavedSort] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!user?.id) {
      setLoadingSavedSort(false);
      return;
    }

    setLoadingSavedSort(true);
    client
      .get(`/api/card-sort/${user.id}`)
      .then((res) => {
        const data = res.data || {};

        const valid = (arr) =>
          Array.isArray(arr)
            ? arr.filter((n) => Number.isInteger(n) && n >= 1 && n <= 17)
            : [];

        const most = valid(data.most_relevant);
        const somewhat = valid(data.somewhat_relevant);
        const least = valid(data.least_relevant);
        const seen = new Set([...most, ...somewhat, ...least]);
        const unsorted = initial.filter((n) => !seen.has(n));

        setColumns({
          unsorted,
          most_relevant: most,
          somewhat_relevant: somewhat,
          least_relevant: least,
        });
        setSaved(seen.size === 17);
        setStatusMsg(seen.size > 0 ? "Loaded your saved card sort from database." : "");
      })
      .catch((e) => {
        // 404 means no existing save yet; leave default unsorted state.
        if (e?.response?.status !== 404) {
          setStatusMsg("Could not load previous card sort from database.");
        }
      })
      .finally(() => setLoadingSavedSort(false));
  }, [user?.id, initial]);

  const getSdg = (num) => {
    const sdg = SDG_DATA.find((s) => s.number === num);
    if (!sdg) return null;
    const img = GOAL_IMAGES[num];
    return {
      ...sdg,
      frontImage: img,
      backImage: img,
    };
  };

  const findContainer = (id) => {
    if (!id) return null;
    if (ALL_CONTAINER_IDS.includes(id)) return id;
    const cardNumber = Number(id);
    return ALL_CONTAINER_IDS.find((containerId) => columns[containerId].includes(cardNumber)) ?? null;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setSaved(false);
    setStatusMsg("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer) return;

    const activeNumber = Number(active.id);

    if (activeContainer === overContainer) {
      setColumns((prev) => {
        const oldIndex = prev[activeContainer].indexOf(activeNumber);
        const overIndex = ALL_CONTAINER_IDS.includes(over.id)
          ? prev[activeContainer].length - 1
          : prev[activeContainer].indexOf(Number(over.id));
        if (oldIndex < 0 || overIndex < 0 || oldIndex === overIndex) return prev;
        return {
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, overIndex),
        };
      });
      return;
    }

    setColumns((prev) => {
      const sourceItems = prev[activeContainer];
      const targetItems = prev[overContainer];
      const sourceIndex = sourceItems.indexOf(activeNumber);
      if (sourceIndex < 0) return prev;

      const nextSource = sourceItems.filter((n) => n !== activeNumber);
      const overIndex = ALL_CONTAINER_IDS.includes(over.id)
        ? targetItems.length
        : targetItems.indexOf(Number(over.id));
      const insertAt = overIndex < 0 ? targetItems.length : overIndex;
      const nextTarget = [...targetItems];
      nextTarget.splice(insertAt, 0, activeNumber);

      return {
        ...prev,
        [activeContainer]: nextSource,
        [overContainer]: nextTarget,
      };
    });
  };

  const handleReset = () => {
    setColumns({ unsorted: initial, most_relevant: [], somewhat_relevant: [], least_relevant: [] });
    setSaved(false);
    setStatusMsg("");
  };

  const handleSave = async () => {
    if (!user?.id) {
      setStatusMsg("Please log in to save progress.");
      return;
    }

    if (columns.unsorted.length > 0) {
      setStatusMsg("Sort all cards before saving.");
      return;
    }

    setSaving(true);
    setStatusMsg("");
    try {
      await client.post("/api/card-sort", {
        user_id: user.id,
        most_relevant: columns.most_relevant,
        somewhat_relevant: columns.somewhat_relevant,
        least_relevant: columns.least_relevant,
      });

      await client.patch(`/api/progress/${user.id}`, {
        completed_card_sort: true,
      });

      setSaved(true);
      setStatusMsg("Card sort saved to database.");
    } catch {
      setStatusMsg("Unable to save card sort to database.");
    } finally {
      setSaving(false);
    }
  };

  const totalSorted = columns.most_relevant.length + columns.somewhat_relevant.length + columns.least_relevant.length;
  const activeSdg = activeId ? getSdg(Number(activeId)) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shuffle className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">SDG Card Sort</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sort all 17 cards and save your progress to the database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{totalSorted}/17 sorted</Badge>
          <MockButton variant="outline" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </MockButton>
          <MockButton onClick={handleSave} disabled={columns.unsorted.length > 0 || saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </MockButton>
        </div>
      </div>

      {loadingSavedSort && (
        <div className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg px-3 py-2 mb-4">
          Loading your saved card sort...
        </div>
      )}

      {columns.unsorted.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Sort all remaining cards before saving.
        </div>
      )}

      {statusMsg && (
        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4">
          {statusMsg}
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="mb-6 rounded-xl border border-dashed p-4 bg-muted/30">
          <div className="text-sm font-semibold mb-3">Unsorted Cards ({columns.unsorted.length})</div>
          <DroppableColumn id="unsorted" className="rounded-lg p-2 min-h-[120px]">
            <SortableContext items={columns.unsorted.map(String)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-2">
                {columns.unsorted.length === 0 && (
                  <p className="text-xs text-muted-foreground">All cards are sorted.</p>
                )}
                {columns.unsorted.map((num) => {
                  const sdg = getSdg(num);
                  return <SortableSdgChip key={num} id={String(num)} sdg={sdg} />;
                })}
              </div>
            </SortableContext>
          </DroppableColumn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILES.map((pile) => (
            <div key={pile.id}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-sm font-semibold text-foreground">{pile.label}</h2>
                <Badge variant="secondary">{columns[pile.id].length}</Badge>
              </div>
              <div className={`rounded-xl border p-3 ${pile.tone}`}>
                <DroppableColumn id={pile.id} className="min-h-[180px] rounded-md p-1 flex flex-wrap gap-2 content-start">
                  <SortableContext items={columns[pile.id].map(String)} strategy={rectSortingStrategy}>
                    {columns[pile.id].length === 0 && (
                      <p className="text-xs text-muted-foreground w-full">Drop cards here.</p>
                    )}
                    {columns[pile.id].map((num) => {
                      const sdg = getSdg(num);
                      return <SortableSdgChip key={num} id={String(num)} sdg={sdg} />;
                    })}
                  </SortableContext>
                </DroppableColumn>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeSdg ? <SdgChip sdg={activeSdg} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface DragAndDropListProps<T> {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  disabled?: boolean;
  className?: string;
  strategy?: "vertical" | "grid"; // Stratégie de tri : vertical pour listes, grid pour grilles CSS
  buttonSize?: "normal" | "small"; // Taille du bouton drag-and-drop
}

interface SortableItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  disabled?: boolean;
  buttonSize?: "normal" | "small"; // Taille du bouton
}

function SortableItem<T>({
  item,
  index,
  renderItem,
  getItemId,
  disabled,
  buttonSize = "normal",
}: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getItemId(item), disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "z-50" : ""}`}
    >
      {renderItem(item, index)}
      {!disabled && (
        <button
          {...attributes}
          {...listeners}
          className={`absolute top-1 left-1 ${buttonSize === "small" ? "p-0.5" : "p-2.5"} cursor-grab active:cursor-grabbing text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white transition-all bg-white dark:bg-slate-800 rounded ${buttonSize === "small" ? "shadow-sm hover:shadow" : "rounded-md shadow-md hover:shadow-lg"} z-30 ${buttonSize === "small" ? "border border-gray-300 dark:border-slate-600" : "border-2 border-gray-300 dark:border-slate-600"} hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 backdrop-blur-sm`}
          aria-label="Réorganiser (glisser-déposer)"
          title="Glisser pour réorganiser"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical
            size={buttonSize === "small" ? 12 : 20}
            strokeWidth={buttonSize === "small" ? 1.5 : 2.5}
          />
        </button>
      )}
    </div>
  );
}

export function DragAndDropList<T>({
  items,
  onReorder,
  renderItem,
  getItemId,
  disabled = false,
  className = "",
  strategy = "vertical",
  buttonSize = "normal",
}: DragAndDropListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id.toString();
      const overId = over.id.toString();

      const oldIndex = items.findIndex((item) => getItemId(item) === activeId);
      const newIndex = items.findIndex((item) => getItemId(item) === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        onReorder(reorderedItems);
      }
    }
  };

  const sortingStrategy =
    strategy === "grid" ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => getItemId(item))}
        strategy={sortingStrategy}
      >
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem
              key={getItemId(item)}
              item={item}
              index={index}
              renderItem={renderItem}
              getItemId={getItemId}
              disabled={disabled}
              buttonSize={buttonSize}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

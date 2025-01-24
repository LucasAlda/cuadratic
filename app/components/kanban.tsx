import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
import { MaybePromise } from "@rocicorp/zero";
import { ReactNode, useMemo, useState } from "react";

export function Board<
  Item extends { readonly id: string },
  Column extends { readonly id: string; readonly name: string },
>({
  items,
  columns,
  renderItem,
  renderColumn,
  columnKey,
  onColumnChange,
  onSortChange,
}: {
  columnKey: (item: Item) => string;
  columns: readonly Column[];
  items: readonly Item[];
  renderItem: (item: Item, isOverlay?: boolean) => ReactNode;
  renderColumn: (props: { column: Column; children: ReactNode }) => ReactNode;
  onColumnChange: (itemId: string, columnId: string) => void;
  onSortChange: (itemId: string, overId: string) => MaybePromise<void>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cols = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[columnKey(item)] = acc[columnKey(item)] || [];
        acc[columnKey(item)].push(item);
        return acc;
      },
      {} as Record<string, Item[]>
    );
  }, [items]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={(event) => {
        let overContainer = event.over?.data?.current?.sortable?.containerId;
        const activeContainer = event.active?.data?.current?.sortable?.containerId;
        if (overContainer !== activeContainer) {
          onColumnChange(event.active.id as string, overContainer);
        }
      }}
      onDragStart={(event) => {
        setActiveId(event.active.id as string);
      }}
      onDragEnd={async (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
          await onSortChange(active.id as string, over?.id as string);
        }
        setActiveId(null);
      }}
    >
      {columns.map((column) => (
        <Column column={column} items={cols[column.id]} renderItem={renderItem} renderColumn={renderColumn} />
      ))}
      <DragOverlay>{activeId && renderItem(items.find((item) => item.id === activeId)!, true)}</DragOverlay>
    </DndContext>
  );
}

function Column<Item extends { readonly id: string }, Column extends { readonly id: string }>({
  column,
  items = [],
  renderItem,
  renderColumn,
}: {
  column: Column;
  items: Item[];
  renderItem: (item: Item, isOverlay?: boolean) => ReactNode;
  renderColumn: (props: { readonly column: Column; children: ReactNode }) => ReactNode;
}) {
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy} id={column.id}>
      {renderColumn({
        column,
        children: (
          <>
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {renderItem(item, false)}
              </SortableItem>
            ))}
            {items.length === 0 && (
              <SortableItem id={"__SPOT__" + column.id}>
                <div />
              </SortableItem>
            )}
          </>
        ),
      })}
    </SortableContext>
  );
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      type: "SPOT",
    },
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging ? "cursor-grabbing -bg-slate-300/50 rounded-md z-20" : "z-10")}
    >
      <div className={cn(isDragging && "opacity-0")}>{children}</div>
    </div>
  );
}

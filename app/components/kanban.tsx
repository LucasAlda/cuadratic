import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
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
import { ReactNode, useMemo } from "react";

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
  renderItem: (item: Item) => ReactNode;
  renderColumn: (props: { column: Column; children: ReactNode }) => ReactNode;
  onColumnChange: (itemId: string, columnId: string) => void;
  onSortChange: (itemId: string, overId: string) => void;
}) {
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
        const overContainer = event.over?.data?.current?.sortable?.containerId;
        const activeContainer = event.active?.data?.current?.sortable?.containerId;
        if (overContainer !== activeContainer) {
          console.log(event.active.id, overContainer);
          onColumnChange(event.active.id as string, overContainer);
          // setItems((items) => {
          //   return items.map((i) => {
          //     if (i.id === event.active.id) {
          //       return { ...i, status: overContainer };
          //     }

          //     return i;
          //   });
          // });
        }
      }}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          onSortChange(active.id as string, over?.id as string);
          // setItems((items) => {
          //   const oldIndex = items.findIndex((item) => item.id === active.id);
          //   const newIndex = items.findIndex((item) => item.id === over?.id);
          //   return arrayMove(items, oldIndex, newIndex);
          // });
        }
      }}
    >
      <div className="flex">
        {columns.map((column) => (
          <Column column={column} items={cols[column.id]} renderItem={renderItem} renderColumn={renderColumn} />
        ))}
      </div>
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
  renderItem: (item: Item) => ReactNode;
  renderColumn: (props: { readonly column: Column; children: ReactNode }) => ReactNode;
}) {
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy} id={column.id}>
      {renderColumn({
        column,
        children: items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {renderItem(item)}
          </SortableItem>
        )),
      })}
    </SortableContext>
  );
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id });

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
      className={cn(isDragging && "cursor-grabbing shadow-md z-50")}
    >
      {children}
    </div>
  );
}

import { DragDropContext, Draggable } from "@hello-pangea/dnd";
import { Droppable } from "@hello-pangea/dnd";
import { ReactNode } from "react";

export const Kanban = DragDropContext;

export function Column({
  children,
  // addTicket,
  render,
  id,
  dropClassName,
}: {
  children: React.ReactNode;
  id: string;
  // addTicket: () => void;
  render: (props: { children: ReactNode }) => ReactNode;
  dropClassName?: string;
}) {
  return render({
    children: (
      <Droppable droppableId={id}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={dropClassName}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ),
  });
}

export function Item({
  index,
  id,
  render,
}: {
  index: number;
  id: string;
  render: (props: { isDragging: boolean }) => React.ReactNode;
}) {
  return (
    <Draggable index={index} draggableId={id}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} className="mb-2" {...provided.draggableProps} {...provided.dragHandleProps}>
          {render({ isDragging: snapshot.isDragging })}
        </div>
      )}
    </Draggable>
  );
}

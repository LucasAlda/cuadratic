import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createFileRoute, ReactNode } from "@tanstack/react-router";
import { format } from "date-fns";
import { useQuery } from "@rocicorp/zero/react";
import { Button } from "@/components/ui/button";
import { useZero } from "@/hooks/use-zero";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { DropResult } from "@hello-pangea/dnd";
import type { State, Ticket } from "@/lib/zero";
import { Column, Item, Kanban } from "@/components/kanban";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/board/$boardId")({
  component: Example,
});

const users = [
  {
    id: 1,
    name: "Alice Johnson",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
  },
  {
    id: 2,
    name: "Bob Smith",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2",
  },
  {
    id: 3,
    name: "Charlie Brown",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3",
  },
  {
    id: 4,
    name: "Diana Prince",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4",
  },
  {
    id: 5,
    name: "Ethan Hunt",
    image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5",
  },
];

function Example() {
  const z = useZero();
  const { boardId } = Route.useParams();

  const [states] = useQuery(z.query.states.where("boardId", "=", boardId));
  const [unsortedTickets] = useQuery(
    z.query.tickets
      .orderBy("timestamp", "asc")
      .related("state", (state) => state.one())
      .where("boardId", "=", boardId)
      .orderBy("sortOrder", "asc")
  );

  const tickets = unsortedTickets.sort((a, b) => a.sortOrder - b.sortOrder);

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    const col = tickets.filter((t) => t.stateId === destination.droppableId);

    let prevOrder, nextOrder;
    if (source.droppableId === destination.droppableId && source.index < destination.index) {
      prevOrder = col[destination.index]?.sortOrder;
      nextOrder = col[destination.index + 1]?.sortOrder;
    } else {
      prevOrder = col[destination.index - 1]?.sortOrder;
      nextOrder = col[destination.index]?.sortOrder;
    }

    let newOrder;
    if (prevOrder === undefined) newOrder = (col.at(0)?.sortOrder ?? 0) - 1000;
    else if (nextOrder === undefined) newOrder = (col.at(-1)?.sortOrder ?? 0) + 1000;
    else newOrder = (prevOrder + nextOrder) / 2;

    z.mutate.tickets.update({
      id: draggableId,
      sortOrder: newOrder,
      stateId: destination.droppableId,
    });
  }

  return (
    <div className="p-2 py-4 min-w-[1000px] max-h-[calc(100vh-60px)] h-full flex flex-col">
      <div className="grid grid-cols-3 flex-grow overflow-hidden">
        <Kanban onDragEnd={onDragEnd}>
          {states.map((state) => (
            <Column
              key={state.id}
              id={state.id}
              dropClassName="flex flex-col h-full overflow-y-auto"
              render={({ children }) => <StateColumn state={state}>{children}</StateColumn>}
            >
              {tickets
                .filter((item) => item.stateId === state.id)
                .map((item, index) => (
                  <Item
                    key={item.id}
                    index={index}
                    id={item.id}
                    render={({ isDragging }) => <Ticket ticket={item} isDragging={isDragging} />}
                  />
                ))}
            </Column>
          ))}
        </Kanban>
      </div>
    </div>
  );
}

function StateColumn({ children, state }: { children: ReactNode; state: State }) {
  const z = useZero();

  return (
    <div className="px-2 w-full h-full max-h-full overflow-y-hidden">
      <div className="bg-slate-200 w-full h-full p-2 rounded-lg shadow-sm flex flex-col gap-2">
        <div className="flex gap-2 justify-between items-center">
          <div className="text-sm font-semibold pr-4 pl-2 flex items-center gap-1.5">{state.name}</div>
          <AddTicket defaultState={state.id} boardId={state.boardId} />
        </div>
        {children}
      </div>
    </div>
  );
}

function Ticket({ ticket, isDragging }: { ticket: Ticket & { state: State | undefined }; isDragging: boolean }) {
  const z = useZero();

  return (
    <div
      className={cn(
        "bg-white p-3 w-full rounded-md shadow-sm border group cursor-pointer select-none",
        isDragging && "shadow-lg cursor-move"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="m-0 flex-1 font-medium text-sm">{ticket.title}</p>
          <p className="m-0 text-muted-foreground text-xs">{ticket.state?.name}</p>
        </div>
        {ticket.assigneeId && users.find((user) => user.id === ticket.assigneeId) && (
          <Avatar className="h-4 w-4 shrink-0 group-hover:hidden">
            <AvatarImage src={users.find((user) => user.id === ticket.assigneeId)?.image} />
            <AvatarFallback>{users.find((user) => user.id === ticket.assigneeId)?.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <div
          className="hidden cursor-pointer group-hover:block"
          onClick={() => {
            z.mutate.tickets.delete({
              id: ticket.id,
            });
          }}
        >
          <X className="size-4 text-slate-500" />
        </div>
      </div>
      <p className="m-0 text-muted-foreground text-xs">{format(ticket.timestamp, "MMM d")}</p>
    </div>
  );
}

function AddTicket({ defaultState, boardId }: { defaultState: string; boardId: string }) {
  const z = useZero();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>();
  const [priority, setPriority] = useState<number>();
  const [assignee, setAssignee] = useState<number>();
  const [body, setBody] = useState<string>();
  const [state, setState] = useState(defaultState);

  const [states] = useQuery(z.query.states.where("boardId", "=", boardId));
  const [maxSortOrder] = useQuery(
    z.query.tickets.where("boardId", "=", boardId).where("stateId", "=", state).orderBy("sortOrder", "desc").one()
  );

  function add() {
    const ticket = {
      boardId: boardId,
      timestamp: Date.now(),
      id: (Math.random() * 1000000).toFixed(0),
      title: title,
      body: body,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      priority: priority,
      stateId: state,
      assigneeId: assignee,
      senderId: 1,
      sortOrder: (maxSortOrder?.sortOrder ?? 0) + 1000,
    };
    z.mutate.tickets.insert(ticket);
    setOpen(false);
  }

  useEffect(() => {
    if (open) return;
    setTimeout(() => {
      setTitle("");
      setBody("");
      setState(defaultState);
      setDueDate(undefined);
      setPriority(undefined);
      setAssignee(undefined);
    }, 200);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="size-7 hover:bg-slate-300" size="sm">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-3 max-w-xl">
        <DialogTitle className="sr-only">Create Ticket</DialogTitle>
        <div className="">
          <Input
            className="border-0 font-medium shadow-none focus-visible:ring-0 p-1 md:text-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue title"
          />
          <Textarea
            className="border-0 shadow-none text-slate-600 focus-visible:ring-0 p-0 px-1 h-24"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a description..."
          />
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-1 items-end">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="text-xs h-8 px-2 gap-1">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="h-8 px-2 md:text-xs"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select value={priority?.toString()} onValueChange={(value) => setPriority(Number(value))}>
              <SelectTrigger className="text-xs h-8 px-2 gap-1">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">High</SelectItem>
                <SelectItem value="3">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assignee?.toString()} onValueChange={(value) => setAssignee(Number(value))}>
              <SelectTrigger className="text-xs h-8 px-2 gap-1">
                <SelectValue placeholder="Assignee">
                  <Avatar className="size-4">
                    <AvatarImage src={users.find((user) => user.id === Number(assignee))?.image} />
                    <AvatarFallback>
                      {users.find((user) => user.id === Number(assignee))?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-4">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={add}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const posibleNames = [
  "AI Scene Analysis",
  "Collaborative Editing",
  "AI-Powered Color Grading",
  "Real-time Video Chat",
  "AI Voice-to-Text Subtitles",
  "Cloud Asset Management",
  "AI-Assisted Video Transitions",
  "Version Control System",
  "AI Content-Aware Fill",
  "Multi-User Permissions",
  "AI-Powered Audio Enhancement",
  "Real-time Project Analytics",
  "AI-Powered Video Compression",
  "Global CDN Integration",
  "AI Object Tracking",
  "Real-time Language Translation",
  "AI-Powered Video Summarization",
  "Blockchain-based Asset Licensing",
  "AI-Powered Video Editing",
];

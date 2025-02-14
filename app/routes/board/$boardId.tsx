import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createFileRoute, ReactNode } from "@tanstack/react-router";
import { format, formatDistance } from "date-fns";
import { useQuery } from "@rocicorp/zero/react";
import { Button } from "@/components/ui/button";
import { useZero } from "@/hooks/use-zero";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";
import { DropResult } from "@hello-pangea/dnd";
import type { Category, Ticket } from "@/lib/zero";
import { Column, Item, Kanban } from "@/components/kanban";
import { Dialog, DialogContent, DialogFooter, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { NavActions } from "@/components/nav-actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/board/$boardId")({
  component: Board,
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

type Status = "TODO" | "NEXT" | "IN_PROGRESS" | "BLOCKED" | "DONE";

const priorities = [
  { id: "-1", name: "No Priority" },
  { id: "1", name: "Low" },
  { id: "2", name: "High" },
  { id: "3", name: "Urgent" },
];

const statuses = [
  { id: "TODO", name: "To Do" },
  { id: "NEXT", name: "Next" },
  { id: "IN_PROGRESS", name: "In Progress" },
  { id: "BLOCKED", name: "Blocked" },
  { id: "DONE", name: "Done" },
];

type NewTicket = {
  open: boolean;
  boardId: string;
  title: string;
  dueDate: string | undefined;
  priority: string;
  assignee: number | undefined;
  body: string;
  categoryId: string;
  status: Status;
};

const groupKeys = {
  status: "status",
  priority: "priority",
  category: "categoryId",
} as const;

function Board() {
  const z = useZero();
  const { boardId } = Route.useParams();
  const { state } = useSidebar();

  const [groupBy, setGroupBy] = useState<"status" | "priority" | "category">("category");
  const [newTicket, setNewTicket] = useState<NewTicket>({
    open: false,
    boardId: boardId,
    title: "",
    dueDate: undefined,
    priority: "-1",
    assignee: undefined,
    body: "",
    categoryId: "",
    status: "TODO",
  });

  const [board] = useQuery(z.query.boards.where("id", "=", boardId).one());
  const [categories] = useQuery(z.query.categories.where("boardId", "=", boardId));
  const [unsortedTickets] = useQuery(
    z.query.tickets
      .orderBy("timestamp", "asc")
      .related("category", (category) => category.one())
      .where("boardId", "=", boardId)
      .orderBy("sortOrder", "asc")
  );

  const cols = (groupBy === "status" ? statuses : groupBy === "priority" ? priorities : categories).map((c) => ({
    ...c,
    tickets: unsortedTickets
      .filter((t) => t[groupKeys[groupBy]]?.toString() === c.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    const col = cols.find((c) => c.id === destination.droppableId);

    let prevOrder, nextOrder;
    if (source.droppableId === destination.droppableId && source.index < destination.index) {
      prevOrder = col?.tickets[destination.index]?.sortOrder;
      nextOrder = col?.tickets[destination.index + 1]?.sortOrder;
    } else {
      prevOrder = col?.tickets[destination.index - 1]?.sortOrder;
      nextOrder = col?.tickets[destination.index]?.sortOrder;
    }

    let newOrder;
    if (nextOrder === undefined) newOrder = (col?.tickets.at(-1)?.sortOrder ?? 0) + 1000;
    else if (prevOrder === undefined) newOrder = (col?.tickets.at(0)?.sortOrder ?? 0) - 1000;
    else newOrder = (prevOrder + nextOrder) / 2;

    z.mutate.tickets.update({
      id: draggableId,
      sortOrder: newOrder,
      [groupKeys[groupBy]]: destination.droppableId,
    });
  }

  return (
    <div className="h-full relative overflow-hidden">
      <div className="h-14"></div>
      <header
        className={cn(
          "flex top-0 right-0 h-14 md:transition-[width] md:duration-200 md:ease-linear justify-between w-full fixed shrink-0 items-center gap-2",
          state !== "collapsed" && "md:w-[calc(100%-var(--sidebar-width))]"
        )}
      >
        <div className="flex items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 text-base">{board?.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className=" flex items-center gap-2 px-3">
          <Tabs value={groupBy} onValueChange={(value) => setGroupBy(value as "status" | "priority" | "category")}>
            <TabsList className="bg-slate-200">
              <TabsTrigger value="status">State</TabsTrigger>
              <TabsTrigger value="priority">Priority</TabsTrigger>
              <TabsTrigger value="category">Category</TabsTrigger>
            </TabsList>
          </Tabs>
          <NavActions />
        </div>
      </header>
      <div className="max-h-[calc(100vh-60px)] h-full flex flex-col">
        <div className="p-2 py-4 flex flex-grow overflow-y-hidden overflow-x-auto">
          <Kanban onDragEnd={onDragEnd}>
            {cols.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                dropClassName="flex flex-col h-full overflow-y-auto"
                render={({ children }) => (
                  <StateColumn
                    category={col}
                    openNewTicket={() => setNewTicket((t) => ({ ...t, open: true, [groupKeys[groupBy]]: col.id }))}
                  >
                    {children}
                  </StateColumn>
                )}
              >
                {col.tickets.map((item, index) => (
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
          <AddTicket newTicket={newTicket} setNewTicket={setNewTicket} />
        </div>
      </div>
    </div>
  );
}

function StateColumn({
  children,
  category,
  openNewTicket,
}: {
  children: ReactNode;
  category: { id: string | number; name: string };
  openNewTicket: () => void;
}) {
  return (
    <div className="px-2 w-[320px] shrink-0 h-full max-h-full overflow-y-hidden">
      <div className="bg-slate-200 w-full h-full p-2 rounded-lg shadow-sm flex flex-col gap-2">
        <div className="flex gap-2 justify-between items-center">
          <div className="text-sm font-semibold pr-4 pl-2 flex items-center gap-1.5">{category.name}</div>
          <Button variant="ghost" className="size-7 hover:bg-slate-300" size="sm" onClick={openNewTicket}>
            <Plus />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Ticket({ ticket, isDragging }: { ticket: Ticket & { category: Category | undefined }; isDragging: boolean }) {
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
          <p className="m-0 text-muted-foreground text-xs">{ticket.category?.name}</p>
          <p className="m-0 text-muted-foreground text-xs">{ticket.status}</p>
          <p className="m-0 text-muted-foreground text-xs">{ticket.sortOrder}</p>
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

function AddTicket({ newTicket, setNewTicket }: { newTicket: NewTicket; setNewTicket: (ticket: NewTicket) => void }) {
  const z = useZero();

  const [categories] = useQuery(z.query.categories.where("boardId", "=", newTicket.boardId));
  const [members] = useQuery(z.query.members.where("boardId", "=", newTicket.boardId));
  const [maxSortOrder] = useQuery(
    z.query.tickets
      .where("boardId", "=", newTicket.boardId)
      .where("categoryId", "=", newTicket.categoryId)
      .orderBy("sortOrder", "desc")
      .one()
  );

  const canBeAdded = newTicket.title && newTicket.status;

  function add() {
    if (!newTicket.title) {
      toast.error("Title is required");
      return;
    }

    if (!newTicket.categoryId) {
      toast.error("Category is required");
      return;
    }

    if (!canBeAdded) {
      toast.error("Please fill in all required fields");
      return;
    }

    const ticket = {
      id: (Math.random() * 1000000).toFixed(0),
      boardId: newTicket.boardId,
      timestamp: Date.now(),
      title: newTicket.title,
      body: newTicket.body,
      dueDate: newTicket.dueDate ? new Date(newTicket.dueDate).getTime() : null,
      priority: Number(newTicket.priority),
      categoryId: newTicket.categoryId,
      status: newTicket.status,
      assigneeId: newTicket.assignee ?? null,
      senderId: 1,
      sortOrder: (maxSortOrder?.sortOrder ?? 0) + 1000,
    };
    z.mutate.tickets.insert(ticket);
    setNewTicket({ ...newTicket, open: false });
  }

  useEffect(() => {
    const handleToggleOpen = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setNewTicket({ ...newTicket, open: !newTicket.open });
      }
    };

    window.addEventListener("keydown", handleToggleOpen);
    return () => window.removeEventListener("keydown", handleToggleOpen);
  }, []);

  useEffect(() => {
    if (!newTicket.open) return;

    const handleSubmit = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        add();
      }
    };

    window.addEventListener("keydown", handleSubmit);
    return () => window.removeEventListener("keydown", handleSubmit);
  }, [newTicket.open, add]);

  useEffect(() => {
    if (newTicket.open) return;
    setTimeout(() => {
      setNewTicket({
        ...newTicket,
        title: "",
        body: "",
        categoryId: newTicket.categoryId,
        dueDate: undefined,
        priority: "-1",
        assignee: undefined,
      });
    }, 200);
  }, [newTicket.open]);

  return (
    <Dialog open={newTicket.open} onOpenChange={(open) => setNewTicket({ ...newTicket, open })}>
      <DialogContent
        overlay={<DialogOverlay className="bg-black/50" />}
        className="p-3 max-w-2xl translate-y-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 top-[10vh]"
      >
        <DialogTitle className="sr-only">Create Ticket</DialogTitle>
        <div className="space-y-1">
          <Select
            value={newTicket.categoryId}
            onValueChange={(value) => setNewTicket({ ...newTicket, categoryId: value })}
          >
            <SelectTrigger className="text-xs w-min h-7 px-1.5 gap-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            autoFocus
            className="border-0 font-medium !mt-3 shadow-none h-8 focus-visible:ring-0 p-1 md:text-base placeholder:text-gray-400"
            value={newTicket.title}
            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            placeholder="Ticket title"
          />
          <Textarea
            className="border-0 shadow-none font-light md:text-base focus-visible:ring-0 p-0 px-1 h-40 placeholder:text-gray-400"
            value={newTicket.body}
            onChange={(e) => setNewTicket({ ...newTicket, body: e.target.value })}
            placeholder="Add a description..."
          />
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-1 items-end">
            <Select
              value={newTicket.status}
              onValueChange={(value: Status) => setNewTicket({ ...newTicket, status: value })}
            >
              <SelectTrigger className="text-xs h-7 px-2 gap-1" icon={""}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-7 px-2 hover:bg-white text-xs font-normal">
                  {newTicket.dueDate ? (
                    formatDistance(new Date(newTicket.dueDate), new Date(), {
                      addSuffix: true,
                    })
                  ) : (
                    <CalendarIcon className="!size-3.5" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-fit">
                <div>
                  <h5 className="text-base font-medium px-2 pt-2.5">Due date</h5>
                  <Calendar
                    mode="single"
                    selected={newTicket.dueDate ? new Date(newTicket.dueDate) : undefined}
                    onSelect={(date) => setNewTicket({ ...newTicket, dueDate: date?.toISOString() })}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <Select
              value={newTicket.priority}
              onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
            >
              <SelectTrigger
                className={cn(
                  "text-xs h-7 px-2 gap-1",
                  newTicket.priority === "1" && "border-blue-200 bg-blue-100 text-blue-700",
                  newTicket.priority === "2" && "border-amber-200 bg-amber-100 text-amber-700",
                  newTicket.priority === "3" && "border-red-200 bg-red-100 text-red-700"
                )}
                icon={""}
              >
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1" className="">
                  No Priority
                </SelectItem>
                <SelectItem value="1" className="focus:bg-blue-100 focus:text-blue-700">
                  Low
                </SelectItem>
                <SelectItem value="2" className="focus:bg-amber-100 focus:text-amber-700">
                  High
                </SelectItem>
                <SelectItem value="3" className="focus:bg-red-100 focus:text-red-700">
                  Urgent
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newTicket.assignee?.toString()}
              onValueChange={(value) => setNewTicket({ ...newTicket, assignee: Number(value) })}
            >
              <SelectTrigger className="text-xs h-7 px-2 gap-1" icon={""}>
                <SelectValue placeholder="Assignee">
                  <Avatar className="size-4">
                    <AvatarImage src={users.find((user) => user.id === newTicket.assignee)?.image} />
                    <AvatarFallback>
                      {users.find((user) => user.id === newTicket.assignee)?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {members.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-4">
                        <AvatarImage src={users.find((u) => u.id === user.userId)?.image} />
                        <AvatarFallback>{users.find((u) => u.id === user.userId)?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {users.find((u) => u.id === user.userId)?.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="text-sm" onClick={add} disabled={!canBeAdded}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

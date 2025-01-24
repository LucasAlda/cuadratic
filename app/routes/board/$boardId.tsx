import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Board } from "@/components/kanban";
import { useQuery } from "@rocicorp/zero/react";
import { Button } from "@/components/ui/button";
import { useZero } from "@/hooks/use-zero";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { readBody } from "@tanstack/start/server";

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

  const [members] = useQuery(z.query.members.where("boardId", "=", boardId));
  const [states] = useQuery(z.query.states.where("boardId", "=", boardId));
  const [tickets] = useQuery(
    z.query.tickets
      .orderBy("timestamp", "asc")
      .related("state", (state) => state.one())
      .where("boardId", "=", boardId)
      .orderBy("sortOrder", "asc")
  );

  // const [items, setItems] = useState<typeof tickets>([]);

  // useEffect(() => {
  //   if (items.length === 0) {
  //     setItems(tickets);
  //   }
  // }, [tickets]);

  return (
    <div className=" p-2 py-4  min-w-[1000px] max-h-[calc(100vh-60px)] h-full flex flex-col">
      <div className="grid grid-cols-3 flex-grow overflow-hidden">
        <Board
          columns={states}
          items={[...tickets].sort((a, b) => b.sortOrder - a.sortOrder)}
          onColumnChange={(itemId, columnId) => {
            // setItems(items.map((item) => ({ ...item, stateId: item.id === itemId ? columnId : item.stateId })));
            z.mutate.tickets.update({
              id: itemId,
              stateId: columnId,
            });
          }}
          onSortChange={async (itemId, overId) => {
            // const oldOrder = tickets.find((t) => t.id === itemId)?.sortOrder;
            // const newOrder = tickets.find((t) => t.id === overId)?.sortOrder;
            // console.log(oldOrder, newOrder);
            // // // if (oldOrder && newOrder) {
            // // z.mutateBatch((m) => {
            // //   m.tickets.update({
            // //     id: itemId,
            // //     sortOrder: newOrder,
            // //   });
            // //   m.tickets.update({
            // //     id: overId,
            // //     sortOrder: oldOrder,
            // //   });
            // // });
            // // // }
          }}
          columnKey={(item) => item.stateId}
          renderItem={(item, isOverlay) => {
            const user = users.find((user) => user.id === item.senderId);
            return (
              <div className={cn("bg-white p-3 w-full rounded-md shadow-sm border group", isOverlay && "shadow-lg")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="m-0 flex-1 font-medium text-sm">{item.body}</p>
                    <p className="m-0 text-muted-foreground text-xs">{item.state?.name}</p>
                  </div>
                  {item.senderId && user && (
                    <Avatar className="h-4 w-4 shrink-0 group-hover:hidden">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className="hidden cursor-pointer group-hover:block"
                    onClick={() => {
                      z.mutate.tickets.delete({
                        id: item.id,
                      });
                    }}
                  >
                    <X className="size-4 text-slate-500" />
                  </div>
                </div>
                <p className="m-0 text-muted-foreground text-xs">{format(item.timestamp, "MMM d")}</p>
              </div>
            );
          }}
          renderColumn={({ children, column }) => (
            <div className="px-2 w-full h-full max-h-full overflow-y-hidden overflow-x-visible">
              <div className="bg-slate-200 w-full h-full p-2 rounded-lg shadow-sm flex flex-col gap-2">
                <div className="flex gap-2 justify-between items-center">
                  <div className="text-sm font-semibold px-4">{column.name}</div>
                  <Button
                    variant="ghost"
                    className="size-7 hover:bg-slate-300"
                    size="sm"
                    onClick={() => {
                      const ticket = {
                        boardId,
                        timestamp: Date.now(),
                        id: (Math.random() * 1000000).toFixed(0),
                        body: posibleNames[Math.round(Math.random() * (posibleNames.length - 1))],
                        stateId: column.id,
                        senderId: 1,
                        sortOrder: Math.max(...tickets.map((t) => t.sortOrder), 0) + 1000,
                      };
                      console.log(
                        ticket,
                        tickets.map((t) => t.sortOrder),
                        Math.max(...tickets.map((t) => t.sortOrder), 0)
                      );
                      z.mutate.tickets.insert(ticket);
                    }}
                  >
                    <Plus />
                  </Button>
                </div>
                <div className="flex flex-col gap-2 h-full overflow-y-auto">{children}</div>
              </div>
            </div>
          )}
        ></Board>
      </div>
    </div>
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

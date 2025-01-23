import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { BreadcrumbList } from "@/components/ui/breadcrumb";
import { NavActions } from "@/components/nav-actions";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_kanban")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">Zero Sync Kanban</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}

import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow bg-background dark:bg-background">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default AppLayout;

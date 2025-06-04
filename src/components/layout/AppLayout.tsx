import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow bg-background dark:bg-background">
        
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default AppLayout;

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { IoSettings } from "react-icons/io5";
import { ChevronDown, PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { GrGallery } from "react-icons/gr";
import { FaHome } from "react-icons/fa";
import { FaRegHandshake } from "react-icons/fa";
import { BsPersonWorkspace } from "react-icons/bs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdContactPhone } from "react-icons/md";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuth } from "../../contexts/AuthContext";

const AppSidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const { logout } = useAuth();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          {!isCollapsed && <span className="text-lg font-semibold">CMS</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto h-8 w-8"
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/settings">
                  <IoSettings />
                  <span>{!isCollapsed && "Settings"}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/gallery">
                  <GrGallery />
                  <span>{!isCollapsed && "Gallery"}</span>
                </Link>
              </SidebarMenuButton>            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <Collapsible defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                {!isCollapsed && "Pages"}
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/pages/home">
                        <FaHome />
                        <span>{!isCollapsed && "Home"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/pages/services">
                        <FaRegHandshake />
                        <span>{!isCollapsed && "Services"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/pages/career">
                        <BsPersonWorkspace />
                        <span>{!isCollapsed && "Career"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/pages/about-us">
                        <IoIosInformationCircleOutline />
                        <span>{!isCollapsed && "About Us"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/pages/contact">
                        <MdContactPhone />
                        <span>{!isCollapsed && "Contact"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>      <SidebarFooter>
        {!isCollapsed && (
          <div className="p-2">
            <ThemeToggle 
              showLabel={true}
              className="w-full"
            />
          </div>
        )}        {!isCollapsed && (
          <div className="p-2">
            <Button 
              variant="outline" 
              onClick={logout}
              className="w-full flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        )}        {isCollapsed && (
          <div className="p-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
              className="w-full flex items-center justify-center text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              title="Logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
        <div className="p-2 text-xs text-center dark:text-gray-400">
          {!isCollapsed && <span>CMS © 2025</span>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

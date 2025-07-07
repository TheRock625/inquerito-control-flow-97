import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Settings, Home, LogOut, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Processos',
    url: '/processos',
    icon: List,
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const getNavClassName = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
      : 'hover:bg-gray-100';
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-800 font-semibold">
            {!isCollapsed && 'Sistema de Inquéritos'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Botão de atalho para Dashboard sempre visível */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-blue-50 border border-blue-200 mb-2">
                  <NavLink to="/">
                    <Home className="h-4 w-4 text-blue-600" />
                    {!isCollapsed && <span className="text-blue-600 font-medium">Início</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Seção do Usuário */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium">
            {!isCollapsed && 'Usuário'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="cursor-default">
                  <User className="h-4 w-4" />
                  {!isCollapsed && <span className="text-sm truncate">{user?.email}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={async () => {
                    const { error } = await signOut();
                    if (error) {
                      toast({
                        title: "Erro",
                        description: "Erro ao fazer logout",
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Logout realizado",
                        description: "Até logo!",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

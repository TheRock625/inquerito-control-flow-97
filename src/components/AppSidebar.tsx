import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Settings, Home, LogOut, User, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  
  const [sidebarBehavior, setSidebarBehavior] = useState<'manual' | 'auto'>('manual');
  const [mouseNearEdge, setMouseNearEdge] = useState(false);

  // Auto show/hide sidebar based on mouse position
  useEffect(() => {
    if (sidebarBehavior !== 'auto') return;

    const handleMouseMove = (e: MouseEvent) => {
      const isNearLeftEdge = e.clientX < 50;
      setMouseNearEdge(isNearLeftEdge);
      
      if (isNearLeftEdge && isCollapsed) {
        toggleSidebar();
      } else if (!isNearLeftEdge && !isCollapsed && e.clientX > 250) {
        toggleSidebar();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [sidebarBehavior, isCollapsed, toggleSidebar]);

  const getNavClassName = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
      : 'hover:bg-gray-100';
  };

  const displayName = profile?.display_name || user?.email || 'Usuário';

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-800 font-semibold">
            {!isCollapsed && 'Sistema de Inquéritos'}
          </SidebarGroupLabel>
          
          {/* Controles do Sidebar */}
          {!isCollapsed && (
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Comportamento do Menu</span>
              </div>
              <Select value={sidebarBehavior} onValueChange={(value: 'manual' | 'auto') => setSidebarBehavior(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
                  {!isCollapsed && <span className="text-sm truncate">{displayName}</span>}
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

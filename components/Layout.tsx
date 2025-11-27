import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  Copy, 
  Settings, 
  LogOut, 
  Package,
  Menu
} from 'lucide-react';
import { setSession } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary text-white' 
          : 'text-gray-400 hover:bg-surface hover:text-gray-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    setSession(false);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-800 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-primary tracking-tight">SMM MANAGER</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarLink to="/" icon={LayoutDashboard} label="Painel" />
            <SidebarLink to="/new-order" icon={PlusCircle} label="Novo Pedido" />
            <SidebarLink to="/orders" icon={List} label="Meus Pedidos" />
            <SidebarLink to="/services" icon={Package} label="Serviços" />
            <SidebarLink to="/copies" icon={Copy} label="Copys" />
            <div className="pt-4 mt-4 border-t border-gray-800">
              <SidebarLink to="/settings" icon={Settings} label="Configurações" />
            </div>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-surface lg:hidden">
            <h1 className="text-lg font-bold text-gray-100">Painel</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400">
                <Menu size={24} />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {mobileMenuOpen && (
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

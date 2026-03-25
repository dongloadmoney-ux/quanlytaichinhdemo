import React, { useContext } from 'react';
import { AuthContext } from './Auth';
import { LogOut, Home, PieChart, List, PlusCircle, User as UserIcon, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'transactions', label: 'Giao dịch', icon: List },
    { id: 'reports', label: 'Báo cáo', icon: PieChart },
    { id: 'profile', label: 'Hồ sơ', icon: UserIcon },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Quản trị', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E5E5E0] p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-light text-[#1A1A1A]">Nấm's finance</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-[#5A5A40] text-white shadow-md'
                  : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#E5E5E0]">
          <div className="flex items-center gap-3 mb-6 px-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border border-[#E5E5E0]" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E5E5E0] flex items-center justify-center text-[#5A5A40]">
                <UserIcon size={20} />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">{user?.displayName}</p>
              <p className="text-xs text-[#5A5A40] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[#A04040] hover:bg-[#FEE2E2] transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile FAB */}
      <button 
        onClick={() => setActiveTab('add')}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#5A5A40] text-white rounded-full flex items-center justify-center shadow-xl z-50"
      >
        <PlusCircle size={28} />
      </button>
    </div>
  );
};

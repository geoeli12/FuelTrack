import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, Fuel, Users, History, Plus 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: createPageUrl("Dashboard") },
    { name: "Drivers", icon: Users, href: createPageUrl("Drivers") },
    { name: "History", icon: History, href: createPageUrl("History") },
  ];

  const isActive = (href) => currentPath === href || currentPath === href + '/';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d49225c6cad23bf5cbfa5/8bb3790a3_image.png" 
              alt="ASH Pallet Management" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive(item.href)
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <Link to={createPageUrl("AddReading")}>
            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-amber-200 transition-all">
              <Plus className="w-5 h-5" />
              Log Usage
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive(item.href)
                  ? "text-amber-600"
                  : "text-slate-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          ))}
          <Link
            to={createPageUrl("AddReading")}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom padding */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
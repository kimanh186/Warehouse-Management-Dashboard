import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  FolderTree,
  Download,
  Upload,
  FileText,
  Warehouse,
  ShoppingBag ,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Tổng quan", icon: LayoutDashboard },
  { path: "/products", label: "Sản phẩm", icon: Package },
  { path: "/suppliers", label: "Nhà cung cấp", icon: Users },
  { path: "/categories", label: "Danh mục", icon: FolderTree },
  { path: "/import-orders", label: "Phiếu nhập", icon: Download },
  { path: "/export-orders", label: "Phiếu xuất", icon: Upload },
  { path: "/reports", label: "Báo cáo", icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Warehouse className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Quản lý kho</h1>
            <p className="text-xs text-muted-foreground">Hệ thống quản lý kho hàng</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-accent/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Phiên bản 1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 Hệ thống quản lý kho
          </p>
        </div>
      </div>
    </aside>
  );
}

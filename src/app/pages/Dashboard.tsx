import { useEffect, useMemo, useState } from "react";
import { Package, Users, AlertCircle, Calendar } from "lucide-react";
import StatsCard from "../components/ui/StatsCard";
import Table from "../components/ui/Table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getImportOrders, getProducts, getSuppliers } from "../../services/api";


const columns = [
  { key: "productCode", label: "Mã SP", width: "15%" },
  { key: "productName", label: "Tên sản phẩm", width: "40%" },
  { key: "category", label: "Danh mục", width: "20%" },
  { key: "quantity", label: "Số lượng", width: "15%" },
  { key: "minStock", label: "Tồn kho tối thiểu", width: "10%" },
];

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [importOrders, setImportOrders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getSuppliers(),
      getImportOrders(),
    ])
      .then(([productsData, suppliersData, importOrdersData]) => {
        setProducts(Array.isArray(productsData) ? productsData : []);
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        setImportOrders(Array.isArray(importOrdersData) ? importOrdersData : []);
      })
      .catch((error) => {
        console.error("Lỗi tải dashboard:", error);
      });
  }, []);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => product.quantity <= 5)
      .map((product) => ({
        ...product,
        minStock: 5,
        category:
          product.category?.categoryName ||
          product.categoryName ||
          "Chưa có danh mục",
      }));
  }, [products]);

  const expiringProducts = useMemo(() => {
    const today = new Date();

    return products.filter((product) => {
      if (!product.expiryDate) return false;

      const expiryDate = new Date(product.expiryDate);
      const diffDays = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return diffDays >= 0 && diffDays <= 30;
    });
  }, [products]);

  const chartData = useMemo(() => {
    const monthlyTotals = [
      { month: "T1", value: 0 },
      { month: "T2", value: 0 },
      { month: "T3", value: 0 },
      { month: "T4", value: 0 },
      { month: "T5", value: 0 },
      { month: "T6", value: 0 },
      { month: "T7", value: 0 },
      { month: "T8", value: 0 },
      { month: "T9", value: 0 },
      { month: "T10", value: 0 },
      { month: "T11", value: 0 },
      { month: "T12", value: 0 },
    ];

    importOrders.forEach((order) => {
      const date = new Date(order.createdDate);
      const month = date.getMonth();

      const total = order.details?.reduce(
        (sum: number, item: any) => sum + item.quantity * item.importPrice,
        0
      );

      monthlyTotals[month].value += total || 0;
    });

    return monthlyTotals;
  }, [importOrders]);

  const statsData = [
    {
      title: "Tổng số sản phẩm",
      value: products.length.toLocaleString(),
      icon: Package,
      color: "blue" as const,
    },
    {
      title: "Tổng số nhà cung cấp",
      value: suppliers.length.toLocaleString(),
      icon: Users,
      color: "green" as const,
    },
    {
      title: "Sản phẩm sắp hết hàng",
      value: lowStockProducts.length.toLocaleString(),
      icon: AlertCircle,
      color: "yellow" as const,
    },
    {
      title: "Sản phẩm sắp hết hạn",
      value: expiringProducts.length.toLocaleString(),
      icon: Calendar,
      color: "red" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý kho hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Biểu đồ nhập hàng theo tháng
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString()} VNĐ`,
                "Tổng nhập",
              ]}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Sản phẩm sắp hết hàng
        </h2>

        <Table
          columns={columns}
          data={lowStockProducts}
          renderRow={(product) => (
            <tr key={product.id} className="hover:bg-muted/50">
              <td className="px-6 py-4 text-sm font-medium text-foreground">
                {product.productCode}
              </td>
              <td className="px-6 py-4 text-sm text-foreground">
                {product.productName}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {product.category}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                  {product.quantity}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {product.minStock}
              </td>
            </tr>
          )}
          emptyMessage="Không có sản phẩm sắp hết hàng"
        />
      </div>
    </div>
  );
}
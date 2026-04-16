import { useEffect, useState } from "react";
import { Calendar, Download } from "lucide-react";

const tabs = [
  { id: "daily", label: "Báo cáo nhập theo ngày" },
  { id: "monthly", label: "Báo cáo nhập theo tháng" },
  { id: "expiring", label: "Sản phẩm sắp hết hạn" },
  { id: "outofstock", label: "Sản phẩm hết hàng" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("daily");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [monthFilter, setMonthFilter] = useState(
    `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`
  );

  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [expiringProducts, setExpiringProducts] = useState<any[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(
      `https://warehousemanagement-2ga9.onrender.com/api/Reports/import-by-date?date=${dateFilter}T00:00:00Z`
    )
      .then((res) => res.json())
      .then((data) => {
        setDailyData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi báo cáo ngày:", err);
        setDailyData([]);
      });

    const [year, month] = monthFilter.split("-");

    fetch(
      `https://warehousemanagement-2ga9.onrender.com/api/Reports/import-by-month?month=${Number(
        month
      )}&year=${Number(year)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setMonthlyData(data);
      })
      .catch((err) => {
        console.error("Lỗi báo cáo tháng:", err);
        setMonthlyData(null);
      });

    fetch(
      "https://warehousemanagement-2ga9.onrender.com/api/Reports/expiring-products"
    )
      .then((res) => res.json())
      .then((data) => {
        setExpiringProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi sản phẩm sắp hết hạn:", err);
        setExpiringProducts([]);
      });

    fetch(
      "https://warehousemanagement-2ga9.onrender.com/api/Reports/out-of-stock"
    )
      .then((res) => res.json())
      .then((data) => {
        setOutOfStockProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Lỗi sản phẩm hết hàng:", err);
        setOutOfStockProducts([]);
      });
  }, [dateFilter, monthFilter]);

  const dailyTotalProducts = dailyData.reduce(
    (sum, item) => sum + (item.products?.length ?? 0),
    0
  );

  const dailyTotalQuantity = dailyData.reduce(
    (sum, item) => sum + (item.totalQuantity ?? 0),
    0
  );

  const dailyTotalMoney = dailyData.reduce(
    (sum, item) => sum + (item.totalMoney ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Báo cáo
          </h1>
          <p className="text-muted-foreground">
            Thống kê và báo cáo chi tiết
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "daily" && (
            <div className="space-y-6">
              <div className="max-w-sm">
                <label className="block text-sm font-medium mb-2">
                  Chọn ngày
                </label>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Tổng số mặt hàng</p>
                  <p className="text-2xl font-semibold text-blue-700">
                    {dailyTotalProducts}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Tổng số lượng</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {dailyTotalQuantity}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">Tổng tiền</p>
                  <p className="text-2xl font-semibold text-purple-700">
                    {dailyTotalMoney.toLocaleString()} VNĐ
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Mã phiếu
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Nhà cung cấp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Tổng tiền
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {dailyData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Không có dữ liệu trong ngày này
                        </td>
                      </tr>
                    ) : (
                      dailyData.map((row) => (
                        <tr key={row.id}>
                          <td className="px-6 py-4">PN{row.id}</td>
                          <td className="px-6 py-4">
                            {new Date(row.createdDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4">{row.supplier}</td>
                          <td className="px-6 py-4">{row.totalQuantity}</td>
                          <td className="px-6 py-4 font-medium">
                            {row.totalMoney.toLocaleString()} VNĐ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "monthly" && (
            <div className="space-y-6">
              <div className="max-w-sm">
                <label className="block text-sm font-medium mb-2">
                  Chọn tháng
                </label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Số phiếu nhập</p>
                  <p className="text-2xl font-semibold text-blue-700">
                    {monthlyData?.totalImportOrders ?? 0}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Tổng số lượng</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {monthlyData?.totalQuantity ?? 0}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">Tổng tiền</p>
                  <p className="text-2xl font-semibold text-purple-700">
                    {(monthlyData?.totalMoney ?? 0).toLocaleString()} VNĐ
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Mã phiếu
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Nhà cung cấp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Tổng tiền
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {monthlyData?.data?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Không có dữ liệu trong tháng này
                        </td>
                      </tr>
                    ) : (
                      monthlyData?.data?.map((row: any) => (
                        <tr key={row.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4">PN{row.id}</td>
                          <td className="px-6 py-4">
                            {new Date(row.createdDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4">{row.supplier}</td>
                          <td className="px-6 py-4">{row.totalQuantity}</td>
                          <td className="px-6 py-4 font-medium">
                            {row.totalMoney.toLocaleString()} VNĐ
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "expiring" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700 mb-1">Cảnh báo</p>
                <p className="text-yellow-800">
                  Có {expiringProducts.length} sản phẩm sắp hết hạn trong vòng 30
                  ngày
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Mã SP
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Tên sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Nhà cung cấp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Hạn sử dụng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Còn lại
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {expiringProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Không có sản phẩm nào sắp hết hạn
                        </td>
                      </tr>
                    ) : (
                      expiringProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4">{product.productCode}</td>
                          <td className="px-6 py-4">{product.productName}</td>
                          <td className="px-6 py-4">{product.supplier}</td>
                          <td className="px-6 py-4">{product.quantity}</td>
                          <td className="px-6 py-4">
                            {new Date(product.expiryDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${product.daysLeft <= 5
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                                }`}
                            >
                              {product.daysLeft} ngày
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "outofstock" && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Cảnh báo</p>
                <p className="text-red-800">
                  Có {outOfStockProducts.length} sản phẩm hết hoặc sắp hết hàng
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Mã SP
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Tên sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Nhà cung cấp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {outOfStockProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Không có sản phẩm nào hết hàng
                        </td>
                      </tr>
                    ) : (
                      outOfStockProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4">{product.productCode}</td>
                          <td className="px-6 py-4">{product.productName}</td>
                          <td className="px-6 py-4">{product.supplier}</td>
                          <td className="px-6 py-4">{product.quantity}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === "Hết hàng"
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                                }`}
                            >
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

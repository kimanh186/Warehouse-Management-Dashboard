import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { createExportOrder, getExportOrders, getProducts, deleteExportOrder, markExportOrderPrinted } from "../../services/api";

interface Product {
  productCode: string;
  productName: string;
}

interface ExportOrderItem {
  productCode: string;
  quantity: number;
}

interface ExportOrder {
  id: number;
  createdDate: string;
  reason: string;
  isPrinted: boolean;
  details: ExportOrderItem[];
}

const exportTypes = [
  { value: "sale", label: "Xuất bán" },
  { value: "internal", label: "Xuất nội bộ" },
  { value: "damaged", label: "Hàng hỏng / hết hạn" },
  { value: "transfer", label: "Chuyển kho" },
];

const columns = [
  { key: "id", label: "Mã phiếu", width: "15%" },
  { key: "createdDate", label: "Ngày tạo", width: "20%" },
  { key: "reason", label: "Loại xuất", width: "20%" },
  { key: "details", label: "Tổng SL", width: "20%" },
  { key: "actions", label: "Hành động", width: "25%" },
];

export default function ExportOrders() {
  const [search, setSearch] = useState("");
  const [exportOrders, setExportOrders] = useState<ExportOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("internal");
  const [orderItems, setOrderItems] = useState<ExportOrderItem[]>([
    {
      productCode: "",
      quantity: 0,
    },
  ]);
  const handleViewDetail = (order: ExportOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        const exportData = await getExportOrders();
        setExportOrders(
          Array.isArray(exportData) ? exportData : exportData.data ?? []
        );

        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);


 const handleDelete = async (id: number) => {
  if (!confirm("Xóa phiếu này?")) return;

  try {
    await deleteExportOrder(id);

    setExportOrders((prev) =>
      prev.filter((o) => o.id !== id)
    );

    alert(" Xóa phiếu xuất thành công"); 
  } catch (error: any) {
    alert(error.message || "Không thể xóa phiếu");
  }
};

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        productCode: "",
        quantity: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ExportOrderItem,
    value: string | number
  ) => {
    const updated = [...orderItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setOrderItems(updated);
  };

  const handleSaveOrder = async () => {
  const body = {
    reason: selectedType,
    details: orderItems,
  };

  try {
    const result = await createExportOrder(body);

    setExportOrders((prev) => [
      ...prev,
      result.data ?? result,
    ]);

    alert("Tạo phiếu xuất thành công"); 

    setIsCreateModalOpen(false);
    setSelectedType("internal");
    setOrderItems([
      { productCode: "", quantity: 0 },
    ]);
  } catch (error: any) {
    alert(error.message || "Không thể tạo phiếu xuất");
  }
};

  const getTypeLabel = (reason: string) => {
    switch (reason) {
      case "sale": return "Xuất bán";
      case "internal": return "Xuất nội bộ";
      case "damaged": return "Hàng hỏng / hết hạn";
      case "transfer": return "Chuyển kho";
      default: return reason;
    }
  };

  const getTypeColor = (reason: string) => {
    switch (reason) {
      case "sale": return "bg-purple-50 text-purple-700";
      case "internal": return "bg-green-50 text-green-700";
      case "damaged": return "bg-red-50 text-red-700";
      case "transfer": return "bg-blue-50 text-blue-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };
  const filteredExportOrders = exportOrders.filter((order) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    if (`px${order.id}`.toLowerCase().includes(keyword)) return true;

    if (getTypeLabel(order.reason).toLowerCase().includes(keyword)) return true;

    const productNames = (order.details ?? [])
      .map((item) => {
        const product = products.find(
          (p) => p.productCode === item.productCode
        );
        return product?.productName ?? "";
      })
      .join(" ")
      .toLowerCase();

    if (productNames.includes(keyword)) return true;

    return false;
  });
  const handlePrintOrder = async () => {
    if (!selectedOrder) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      alert("Trình duyệt chặn popup rồi!");
      return;
    }

    try {
  await markExportOrderPrinted(selectedOrder.id);

  alert(" Đã đánh dấu phiếu đã in");

  setExportOrders(prev =>
    prev.map(o =>
      o.id === selectedOrder.id
        ? { ...o, isPrinted: true }
        : o
    )
  );
} catch (err: any) {
  alert(err.message || "Lỗi khi in phiếu");
}

    const rows = (selectedOrder.details ?? [])
      .map((item, index) => {
        const product = products.find(
          (p) => p.productCode === item.productCode
        );

        return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.productCode}</td>
          <td>${product?.productName ?? "Không tìm thấy"}</td>
          <td>${item.quantity}</td>
        </tr>
      `;
      })
      .join("");

    const totalQuantity = (selectedOrder.details ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    printWindow.document.write(`
    <html>
      <head>
        <title>Phiếu xuất PX${selectedOrder.id}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #eee; }
        </style>
      </head>

      <body>
        <h2>PHIẾU XUẤT KHO</h2>
        <p>Mã: PX${selectedOrder.id}</p>
        <p>Ngày: ${new Date(selectedOrder.createdDate).toLocaleDateString("vi-VN")}</p>

        <table>
          <tr>
            <th>STT</th>
            <th>Mã</th>
            <th>Tên</th>
            <th>SL</th>
          </tr>
          ${rows}
        </table>

        <p><b>Tổng SL: ${totalQuantity}</b></p>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            Phiếu xuất hàng
          </h1>
          <p className="text-muted-foreground">
            Quản lý các phiếu xuất hàng khỏi kho
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔍 search */}
          <input
            type="text"
            placeholder="🔍 Tìm PX, loại, sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg w-72"
          />

          {/* ➕ button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo phiếu xuất
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder=" Tìm PX, loại, sản phẩm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 border rounded-lg w-72"
      />

      <Table
        columns={columns}
        data={filteredExportOrders} renderRow={(order) => (
          <tr key={order.id} className="hover:bg-muted/50">
            <td className="px-6 py-4 text-sm font-medium text-foreground">
              PX{order.id}
            </td>

            <td className="px-6 py-4 text-sm text-muted-foreground">
              {new Date(order.createdDate).toLocaleDateString("vi-VN")}
            </td>

            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  order.reason
                )}`}
              >
                {getTypeLabel(order.reason)}
              </span>
            </td>

            <td className="px-6 py-4 text-sm text-foreground">
              {(order.details ?? []).reduce(
                (sum: number, item: ExportOrderItem) => sum + item.quantity,
                0
              )}
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => handleViewDetail(order)}
                className="text-primary hover:underline text-sm"
              >
                Chi tiết
              </button>

              {/* 🔥 chỉ hiện nếu chưa in */}
              {!order.isPrinted && (
                <button
                  onClick={() => handleDelete(order.id)}
                  className="text-red-600 hover:underline text-sm ml-2"
                >
                  Xóa
                </button>
              )}
            </td>

          </tr>
        )}
        emptyMessage="Chưa có phiếu xuất hàng nào"
      />


      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo phiếu xuất hàng"
        size="lg"
      >
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Loại xuất
            </label>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {exportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Danh sách sản phẩm</h3>

              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </button>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sản phẩm
                      </label>

                      <select
                        value={item.productCode}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "productCode",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      >
                        <option value="">Chọn sản phẩm</option>

                        {products.map((product) => (
                          <option
                            key={product.productCode}
                            value={product.productCode}
                          >
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Số lượng
                      </label>

                      <input
                        type="text"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // chỉ cho nhập số

                          handleItemChange(
                            index,
                            "quantity",
                            value === "" ? 0 : Number(value)
                          );
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      />
                    </div>
                  </div>

                  {orderItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors mt-6"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-accent/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Tổng số lượng xuất:
              </span>

              <span className="font-semibold text-lg text-primary">
                {orderItems.reduce(
                  (sum: number, item: ExportOrderItem) =>
                    sum + item.quantity,
                  0
                )}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Hủy
            </button>

            <button
              onClick={handleSaveOrder}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Lưu phiếu xuất
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết phiếu xuất PX${selectedOrder?.id ?? ""}`}
        size="lg"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mã phiếu</p>
              <p className="font-medium">PX{selectedOrder?.id}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
              <p className="font-medium">
                {selectedOrder?.createdDate
                  ? new Date(selectedOrder.createdDate).toLocaleDateString("vi-VN")
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Loại xuất</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  selectedOrder?.reason ?? ""
                )}`}
              >
                {getTypeLabel(selectedOrder?.reason ?? "")}
              </span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng số lượng</p>
              <p className="font-medium text-primary">
                {(selectedOrder?.details ?? []).reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Danh sách sản phẩm</h3>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3">Mã sản phẩm</th>
                    <th className="text-left px-4 py-3">Tên sản phẩm</th>
                    <th className="text-left px-4 py-3">Số lượng</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedOrder?.details ?? []).map((item, index) => {
                    const product = products.find(
                      (p) => p.productCode === item.productCode
                    );

                    return (
                      <tr key={index} className="border-t border-border">
                        <td className="px-4 py-3">{item.productCode}</td>
                        <td className="px-4 py-3">
                          {product?.productName ?? "Không tìm thấy"}
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => handlePrintOrder()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              In phiếu
            </button>

            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

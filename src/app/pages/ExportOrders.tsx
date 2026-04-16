import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";

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
  type: string;
  details: ExportOrderItem[];
}

const exportTypes = [
  { label: "Bán hàng", value: "BanHang" },
  { label: "Hủy", value: "Huy" },
  { label: "Chuyển kho", value: "ChuyenKho" },
];

const columns = [
  { key: "id", label: "Mã phiếu", width: "15%" },
  { key: "createdDate", label: "Ngày tạo", width: "20%" },
  { key: "type", label: "Loại xuất", width: "20%" },
  { key: "details", label: "Tổng SL", width: "20%" },
  { key: "actions", label: "Hành động", width: "25%" },
];

export default function ExportOrders() {
  const [exportOrders, setExportOrders] = useState<ExportOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("BanHang");

  const [orderItems, setOrderItems] = useState<ExportOrderItem[]>([
    {
      productCode: "",
      quantity: 0,
    },
  ]);

  useEffect(() => {
    fetch("https://warehousemanagement-2ga9.onrender.com/api/ExportOrders")
      .then((res) => res.json())
      .then((data) => {
        console.log("ExportOrders:", data);
        setExportOrders(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch((err) => console.error("Lỗi lấy phiếu xuất:", err));

    fetch("https://warehousemanagement-2ga9.onrender.com/api/Products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err));
  }, []);

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
      type: selectedType,
      details: orderItems,
    };

    try {
      const response = await fetch("https://warehousemanagement-2ga9.onrender.com/api/ExportOrders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText);
        return;
      }

      const result = await response.json();

setExportOrders([...exportOrders, result]);
      setIsCreateModalOpen(false);
      setSelectedType("BanHang");
      setOrderItems([
        {
          productCode: "",
          quantity: 0,
        },
      ]);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo phiếu xuất");
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "BanHang":
        return "Bán hàng";
      case "Huy":
        return "Hủy";
      case "ChuyenKho":
        return "Chuyển kho";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BanHang":
        return "bg-green-50 text-green-700";
      case "Huy":
        return "bg-red-50 text-red-700";
      case "ChuyenKho":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Phiếu xuất hàng
          </h1>
          <p className="text-muted-foreground">
            Quản lý các phiếu xuất hàng khỏi kho
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo phiếu xuất
        </button>
      </div>

      <Table
        columns={columns}
        data={exportOrders}
        renderRow={(order) => (
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
                  order.type
                )}`}
              >
                {getTypeLabel(order.type)}
              </span>
            </td>

            <td className="px-6 py-4 text-sm text-foreground">
              {(order.details ?? []).reduce(
  (sum: number, item: ExportOrderItem) => sum + item.quantity,
  0
)}
            </td>

            <td className="px-6 py-4">
              <button className="text-primary hover:underline text-sm">
                Chi tiết
              </button>
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
                        type="number"
                        min="1"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
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
    </div>
  );
}
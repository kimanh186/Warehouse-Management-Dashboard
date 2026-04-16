import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";

interface Supplier {
  id: number;
  supplierName: string;
}

interface Product {
  productCode: string;
  productName: string;
}

interface ImportOrderItem {
  productCode: string;
  quantity: number;
  importPrice: number;
}

interface ImportOrder {
  id: number;
  createdDate: string;
  supplier: {
    supplierName: string;
  };
  details: ImportOrderItem[];
}

const columns = [
  { key: "id", label: "Mã phiếu", width: "15%" },
  { key: "createdDate", label: "Ngày tạo", width: "20%" },
  { key: "supplier", label: "Nhà cung cấp", width: "25%" },
  { key: "quantity", label: "Tổng SL", width: "15%" },
  { key: "money", label: "Tổng tiền", width: "15%" },
  { key: "actions", label: "Hành động", width: "10%" },
];

export default function ImportOrders() {
  const [importOrders, setImportOrders] = useState<ImportOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | "">("");

  const [orderItems, setOrderItems] = useState<ImportOrderItem[]>([
    {
      productCode: "",
      quantity: 0,
      importPrice: 0,
    },
  ]);

  useEffect(() => {
    fetch("https://warehousemanagement-2ga9.onrender.com/api/ImportOrders")
      .then((res) => res.json())
      .then((data) => {
        console.log("ImportOrders:", data);

        setImportOrders(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch((err) => console.error("Lỗi lấy phiếu nhập:", err));

    fetch("https://warehousemanagement-2ga9.onrender.com/api/Suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Lỗi lấy nhà cung cấp:", err));

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
        importPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ImportOrderItem,
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
    if (selectedSupplierId === "") {
      alert("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (orderItems.some((item) => !item.productCode || item.quantity <= 0)) {
      alert("Vui lòng nhập đầy đủ sản phẩm và số lượng");
      return;
    }

    const body = {
      supplierId: selectedSupplierId,
      details: orderItems,
    };

    try {
      const response = await fetch(
        "https://warehousemanagement-2ga9.onrender.com/api/ImportOrders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        alert(error);
        return;
      }

      const result = await response.json();

      setImportOrders([...importOrders, result]);

      setIsCreateModalOpen(false);
      setSelectedSupplierId("");
      setOrderItems([
        {
          productCode: "",
          quantity: 0,
          importPrice: 0,
        },
      ]);
    } catch (error) {
      console.error(error);
      alert("Không thể tạo phiếu nhập");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Phiếu nhập hàng
          </h1>
          <p className="text-muted-foreground">
            Quản lý các phiếu nhập hàng vào kho
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo phiếu nhập
        </button>
      </div>

      <Table
        columns={columns}
        data={importOrders}
        renderRow={(order) => (
          <tr key={order.id} className="hover:bg-muted/50">
            <td className="px-6 py-4 text-sm font-medium text-foreground">
              PN{order.id}
            </td>

            <td className="px-6 py-4 text-sm text-muted-foreground">
              {new Date(order.createdDate).toLocaleDateString("vi-VN")}
            </td>

            <td className="px-6 py-4 text-sm text-foreground">
              {order.supplier?.supplierName}
            </td>

            <td className="px-6 py-4 text-sm text-foreground">
              {(order.details ?? []).reduce(
                (sum: number, item: ImportOrderItem) => sum + item.quantity,
                0
              )}
            </td>

            <td className="px-6 py-4 text-sm font-medium text-foreground">
              {order.details
                .reduce(
                  (sum: number, item: ImportOrderItem) =>
                    sum + item.quantity * item.importPrice,
                  0
                )
                .toLocaleString()}{" "}
              VNĐ
            </td>

            <td className="px-6 py-4">
              <button className="text-primary hover:underline text-sm">
                Chi tiết
              </button>
            </td>
          </tr>
        )}
        emptyMessage="Chưa có phiếu nhập nào"
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo phiếu nhập hàng"
        size="lg"
      >
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nhà cung cấp
            </label>

            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Chọn nhà cung cấp</option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
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
                  <div className="flex-1 grid grid-cols-3 gap-3">
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

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Giá nhập
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={item.importPrice || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "importPrice",
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Tổng số lượng:</span>

              <span className="font-medium">
                {orderItems.reduce(
                  (sum: number, item: ImportOrderItem) =>
                    sum + item.quantity,
                  0
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tổng tiền:</span>

              <span className="font-semibold text-lg text-primary">
                {orderItems
                  .reduce(
                    (sum: number, item: ImportOrderItem) =>
                      sum + item.quantity * item.importPrice,
                    0
                  )
                  .toLocaleString()}{" "}
                VNĐ
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
              Lưu phiếu nhập
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
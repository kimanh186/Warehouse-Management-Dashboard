import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { createImportOrder, getImportOrders, getProducts, getSuppliers, deleteImportOrder, markImportOrderPrinted } from "../../services/api";
import { toast } from "sonner";

interface Supplier {
  id: number;
  supplierName: string;
}

interface Product {
  productCode: string;
  productName: string;
  quantity: number;
  supplierId: number;
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
  isPrinted: boolean;
}

const columns = [
  { key: "id", label: "Mã phiếu", width: "15%" },
  { key: "createdDate", label: "Ngày tạo", width: "20%" },
  { key: "products", label: "Tên sản phẩm", width: "25%" },
  { key: "stock", label: "Tồn kho hiện tại", width: "10%" },
  { key: "quantity", label: "SL nhập", width: "15%" },
  { key: "money", label: "Tổng tiền", width: "15%" },
  { key: "actions", label: "Hành động", width: "10%" },
];

export default function ImportOrders() {
  const [search, setSearch] = useState("");
  const [importOrders, setImportOrders] = useState<ImportOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ImportOrder | null>(null);
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
    const loadData = async () => {
      try {
        const orders = await getImportOrders();
        setImportOrders(Array.isArray(orders) ? orders : orders.data ?? []);

        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);

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
      await deleteImportOrder(id);

      setImportOrders(prev =>
        prev.filter(o => o.id !== id)
      );

      alert("Xóa phiếu nhập thành công");
    } catch (err: any) {
      alert(err.message || "Không thể xóa");
    }
  };
  useEffect(() => {
    setOrderItems([
      {
        productCode: "",
        quantity: 0,
        importPrice: 0,
      },
    ]);
  }, [selectedSupplierId]);

  const filteredProducts =
    selectedSupplierId === ""
      ? []
      : products.filter(p => p.supplierId === Number(selectedSupplierId));

  const filteredOrders = importOrders.filter((order) => {
    const keyword = search.toLowerCase();

    if (`pn${order.id}`.toLowerCase().includes(keyword)) return true;

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

    if (
      order.supplier?.supplierName?.toLowerCase().includes(keyword)
    )
      return true;

    return false;
  });

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
  const handleViewDetail = (order: ImportOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleSaveOrder = async () => {
    if (selectedSupplierId === "") {
      alert(" Vui lòng chọn nhà cung cấp");
      return;
    }

    if (orderItems.some((item) => !item.productCode || item.quantity <= 0)) {
      alert(" Vui lòng nhập đầy đủ sản phẩm và số lượng");
      return;
    }

    const body = {
      supplierId: selectedSupplierId,
      details: orderItems,
    };

    try {
      await createImportOrder(body);

      alert(" Tạo phiếu nhập thành công");

      const refreshed = await getImportOrders();

      setImportOrders(
        Array.isArray(refreshed) ? refreshed : refreshed.data ?? []
      );

      setIsCreateModalOpen(false);
      setSelectedSupplierId("");
      setOrderItems([
        {
          productCode: "",
          quantity: 0,
          importPrice: 0,
        },
      ]);
    } catch (error: any) {
      alert(error?.message || " Không thể tạo phiếu nhập");
    }
  };

  const handlePrintOrder = async () => {
    if (!selectedOrder) return;

    try {
      await markImportOrderPrinted(selectedOrder.id);
    } catch (err) {
      alert("Không thể đánh dấu in");
      return;
    }
    alert(" Đang mở phiếu để in...");

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) return;

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
          <td>${item.importPrice.toLocaleString()} VNĐ</td>
          <td>${(item.quantity * item.importPrice).toLocaleString()} VNĐ</td>
        </tr>
      `;
      })
      .join("");

    const totalQuantity = (selectedOrder.details ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const totalMoney = (selectedOrder.details ?? []).reduce(
      (sum, item) => sum + item.quantity * item.importPrice,
      0
    );

    printWindow.document.write(`
    <html>
      <head>
        <title>Phiếu nhập PN${selectedOrder.id}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #111;
          }

          .header {
            text-align: center;
            margin-bottom: 24px;
          }

          .header h1 {
            margin: 0;
            font-size: 26px;
          }

          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }

          .info p {
            margin: 0;
            line-height: 1.8;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          .footer {
            margin-top: 24px;
            text-align: right;
            line-height: 1.8;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>PHIẾU NHẬP KHO</h1>
          <p>PN${selectedOrder.id}</p>
        </div>

        <div class="info">
          <p><strong>Ngày tạo:</strong> ${new Date(
      selectedOrder.createdDate
    ).toLocaleDateString("vi-VN")}</p>

          <p><strong>Nhà cung cấp:</strong> ${selectedOrder.supplier?.supplierName ?? ""
      }</p>
        </div>
        

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá nhập</th>
              <th>Thành tiền</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          <div>Tổng số lượng: ${totalQuantity}</div>
          <div>Tổng tiền: ${totalMoney.toLocaleString()} VNĐ</div>
        </div>
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
      <input
        type="text"
        placeholder=" Tìm mã phiếu, sản phẩm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 border rounded-lg w-72"
      />


      <Table
        columns={columns}
        data={filteredOrders}
        renderRow={(order) => (
          <tr key={order.id} className="hover:bg-muted/50">
            <td className="px-6 py-4 text-sm font-medium text-foreground">
              PN{order.id}
            </td>

            <td className="px-6 py-4 text-sm text-muted-foreground">
              {new Date(order.createdDate).toLocaleDateString("vi-VN")}
            </td>

            <td className="px-6 py-4 text-sm text-foreground">
              {(order.details ?? [])
                .map((item: ImportOrderItem) => {
                  const product = products.find(
                    (p) => p.productCode === item.productCode
                  );

                  return product?.productName ?? item.productCode;
                })
                .join(", ")}
            </td>

            <td className="px-6 py-4 text-sm text-foreground">
              {(order.details ?? [])
                .map((item: ImportOrderItem) => {
                  const product = products.find(
                    (p) => p.productCode === item.productCode
                  );

                  return `${product?.quantity ?? 0}`;
                })
                .join(", ")}
            </td><td className="px-6 py-4 text-sm text-foreground">
              {(order.details ?? []).reduce(
                (sum: number, item: ImportOrderItem) => sum + item.quantity,
                0
              )}
            </td>

            <td className="px-6 py-4 text-sm font-medium text-foreground">
              {(order.details ?? [])
                .reduce(
                  (sum: number, item: ImportOrderItem) =>
                    sum + item.quantity * item.importPrice,
                  0
                )
                .toLocaleString()}{" "}
              VNĐ
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => handleViewDetail(order)}
                className="text-primary hover:underline text-sm"
              >
                Chi tiết
              </button>
              <button
                onClick={() => handleDelete(order.id)}
                disabled={order.isPrinted}
                className={`text-sm ml-2 ${order.isPrinted
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-600 hover:underline"
                  }`}
              >
                Xóa
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

                        {filteredProducts.map((product) => (
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
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết phiếu nhập PN${selectedOrder?.id ?? ""}`}
        size="lg"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mã phiếu</p>
              <p className="font-medium">PN{selectedOrder?.id}</p>
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
              <p className="text-sm text-muted-foreground mb-1">Nhà cung cấp</p>
              <p className="font-medium">
                {selectedOrder?.supplier?.supplierName}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
              <p className="font-medium text-primary">
                {(selectedOrder?.details ?? [])
                  .reduce(
                    (sum, item) => sum + item.quantity * item.importPrice,
                    0
                  )
                  .toLocaleString()} VNĐ
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Danh sách sản phẩm</h3>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3">Mã SP</th>
                    <th className="text-left px-4 py-3">Tên sản phẩm</th>
                    <th className="text-left px-4 py-3">Số lượng</th>
                    <th className="text-left px-4 py-3">Giá nhập</th>
                    <th className="text-left px-4 py-3">Thành tiền</th>
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
                        <td className="px-4 py-3">
                          {item.importPrice.toLocaleString()} VNĐ
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {(item.quantity * item.importPrice).toLocaleString()} VNĐ
                        </td>
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
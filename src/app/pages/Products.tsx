import { useEffect, useState } from "react";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSuppliers,
} from "../../services/api";

interface Product {
  id: number;
  productCode: string;
  name: string;
  category: string;
  supplier: string;
  categoryId: number;
  supplierId: number;
  quantity: number;
  importPrice: number;
  salePrice: number;
  expiryDate: string;
}

const columns = [
  { key: "productCode", label: "Mã SP", width: "10%" },
  { key: "name", label: "Tên sản phẩm", width: "20%" },
  { key: "category", label: "Danh mục", width: "12%" },
  { key: "supplier", label: "Nhà cung cấp", width: "15%" },
  { key: "quantity", label: "Số lượng", width: "10%" },
  { key: "importPrice", label: "Giá nhập", width: "10%" },
  { key: "salePrice", label: "Giá bán", width: "10%" },
  { key: "expiryDate", label: "Hạn SD", width: "10%" },
  { key: "actions", label: "Hành động", width: "13%" },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    productCode: "",
    name: "",
    categoryId: 0,
    supplierId: 0,
    quantity: 0,
    importPrice: 0,
    salePrice: 0,
    expiryDate: "",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();

      const mapped = data.map((p: any) => ({
        id: p.id,
        productCode: p.productCode,
        name: p.productName,
        category: p.category?.categoryName ?? "",
        supplier: p.supplier?.supplierName ?? "",
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        quantity: p.quantity,
        importPrice: p.importPrice,
        salePrice: p.promotionPrice,
        expiryDate: p.expiryDate ? p.expiryDate.split("T")[0] : "",
      }));

      setProducts(mapped);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Lỗi tải nhà cung cấp:", error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormData({
      id: 0,
      productCode: `P${String(products.length + 1).padStart(3, "0")}`,
      name: "",
      categoryId: 0,
      supplierId: 0,
      quantity: 0,
      importPrice: 0,
      salePrice: 0,
      expiryDate: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      quantity: product.quantity,
      importPrice: product.importPrice,
      salePrice: product.salePrice,
      expiryDate: product.expiryDate,
    });
    setIsEditModalOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      await loadProducts();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert("Không thể xóa sản phẩm");
    }
  };

  const handleSave = async () => {
    const body = {
      productCode: formData.productCode,
      productName: formData.name,
      quantity: Number(formData.quantity),
      importPrice: Number(formData.importPrice),
      promotionPrice: Number(formData.salePrice),
      expiryDate: formData.expiryDate,
      supplierId: Number(formData.supplierId),
      categoryId: Number(formData.categoryId),
    };

    try {
      if (isAddModalOpen) {
        await createProduct(body);
      }

      if (isEditModalOpen && selectedProduct) {
        await updateProduct(selectedProduct.id, {
          id: selectedProduct.id,
          ...body,
        });
      }

      await loadProducts();

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Không thể lưu sản phẩm");
    }
  };

  const ProductForm = () => (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mã sản phẩm</label>
          <input
            type="text"
            value={formData.productCode}
            onChange={(e) =>
              setFormData({ ...formData, productCode: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
            disabled={isEditModalOpen}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Danh mục</label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({
                ...formData,
                categoryId: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          >
            <option value={0}>Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nhà cung cấp</label>
          <select
            value={formData.supplierId}
            onChange={(e) =>
              setFormData({
                ...formData,
                supplierId: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          >
            <option value={0}>Chọn nhà cung cấp</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.supplierName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Số lượng</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: Number(e.target.value) })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giá nhập</label>
          <input
            type="number"
            value={formData.importPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                importPrice: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giá bán</label>
          <input
            type="number"
            value={formData.salePrice}
            onChange={(e) =>
              setFormData({ ...formData, salePrice: Number(e.target.value) })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hạn sử dụng</label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          className="flex-1 px-4 py-2 border border-border rounded-lg"
        >
          Hủy
        </button>

        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Lưu
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">
            Danh sách tất cả sản phẩm trong kho
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
        />
      </div>

      <Table
        columns={columns}
        data={filteredProducts}
        renderRow={(product) => (
          <tr key={product.id} className="hover:bg-muted/50">
            <td className="px-6 py-4">{product.productCode}</td>
            <td className="px-6 py-4">{product.name}</td>
            <td className="px-6 py-4">{product.category}</td>
            <td className="px-6 py-4">{product.supplier}</td>
            <td className="px-6 py-4">{product.quantity}</td>
            <td className="px-6 py-4">
              {product.importPrice.toLocaleString()}
            </td>
            <td className="px-6 py-4">
              {product.salePrice.toLocaleString()}
            </td>
            <td className="px-6 py-4">{product.expiryDate}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button onClick={() => handleView(product)}>
                  <Eye className="w-4 h-4 text-blue-600" />
                </button>
                <button onClick={() => handleEdit(product)}>
                  <Edit className="w-4 h-4 text-yellow-600" />
                </button>
                <button onClick={() => handleDelete(product)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </td>
          </tr>
        )}
        emptyMessage="Không tìm thấy sản phẩm nào"
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm sản phẩm mới"
      >
        <ProductForm />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa sản phẩm"
      >
        <ProductForm />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/api";

interface Supplier {
  id: number;
  supplierName: string;
  phone: string;
}

const columns = [
  { key: "id", label: "Mã NCC", width: "20%" },
  { key: "supplierName", label: "Tên nhà cung cấp", width: "50%" },
  { key: "phone", label: "Số điện thoại", width: "20%" },
  { key: "actions", label: "Hành động", width: "10%" },
];
function SupplierForm({
  formData,
  setFormData,
  handleSave,
  closeModal,
}: any) {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Mã nhà cung cấp
          </label>
          <input
            type="text"
            value={formData.id || "Tự động"}
            disabled
            className="w-full px-4 py-2 border border-border rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tên nhà cung cấp
          </label>
          <input
            type="text"
            value={formData.supplierName}
            onChange={(e) =>
              setFormData({
                ...formData,
                supplierName: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Số điện thoại
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-border rounded-lg"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={closeModal}
          className="flex-1 px-4 py-2 border border-border rounded-lg"
        >
          Hủy
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    supplierName: "",
    phone: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Lỗi tải nhà cung cấp:", error);
    }
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setFormData({
      id: 0,
      supplierName: "",
      phone: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      id: supplier.id,
      supplierName: supplier.supplierName,
      phone: supplier.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
  if (!selectedSupplier) return;

  try {
    await deleteSupplier(selectedSupplier.id);
    await loadSuppliers();

    alert(" Xóa nhà cung cấp thành công");

    setIsDeleteDialogOpen(false);
  } catch (error: any) {
    alert(error?.message || " Không thể xóa nhà cung cấp");
  }
};

  const handleSave = async () => {
  if (!formData.supplierName.trim()) {
    alert(" Vui lòng nhập tên nhà cung cấp");
    return;
  }

  try {
    if (isAddModalOpen) {
      await createSupplier({
        supplierName: formData.supplierName,
        phone: formData.phone,
      });

      alert(" Thêm nhà cung cấp thành công");
    }

    if (isEditModalOpen) {
      await updateSupplier(formData.id, {
        id: formData.id,
        supplierName: formData.supplierName,
        phone: formData.phone,
      });

      alert(" Cập nhật nhà cung cấp thành công");
    }

    await loadSuppliers();

    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  } catch (error: any) {
    alert(error?.message || " Không thể lưu nhà cung cấp");
  }
};



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý nhà cung cấp</h1>
          <p className="text-muted-foreground">Danh sách các nhà cung cấp</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Thêm nhà cung cấp
        </button>
      </div>

      <Table
        columns={columns}
        data={suppliers}
        renderRow={(supplier) => (
          <tr key={supplier.id} className="hover:bg-muted/50">
            <td className="px-6 py-4">{supplier.id}</td>
            <td className="px-6 py-4">{supplier.supplierName}</td>
            <td className="px-6 py-4">{supplier.phone}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button onClick={() => handleEdit(supplier)}>
                  <Edit className="w-4 h-4 text-yellow-600" />
                </button>

                <button onClick={() => handleDelete(supplier)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </td>
          </tr>
        )}
        emptyMessage="Không có nhà cung cấp nào"
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm nhà cung cấp mới"
      >
        <SupplierForm
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
          closeModal={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa nhà cung cấp"
      >
        <SupplierForm
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
          closeModal={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa nhà cung cấp"
        message={`Bạn có chắc chắn muốn xóa nhà cung cấp "${selectedSupplier?.supplierName}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}

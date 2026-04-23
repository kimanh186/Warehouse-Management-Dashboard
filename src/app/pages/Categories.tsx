import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/api";
import { Toaster } from "sonner";
import { toast } from "sonner";

interface Category {
  id: number;
  categoryName: string;
}


const columns = [
  { key: "id", label: "Mã danh mục", width: "30%" },
  { key: "categoryName", label: "Tên danh mục", width: "50%" },
  { key: "actions", label: "Hành động", width: "20%" },
];

function CategoryForm({
  formData,
  setFormData,
  isEditModalOpen,
  handleSave,
  closeModal,
}: any) {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Mã danh mục
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
            Tên danh mục
          </label>
          <input
            type="text"
            value={formData.categoryName || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                categoryName: e.target.value,
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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Lỗi tải danh mục:", err));
  }, []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({});

  const handleAdd = () => {
    const maxId =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.id))
        : 0;

    setFormData({
      id: maxId + 1,
      categoryName: "",
    });

    setIsAddModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  


const handleSave = async () => {
  const name = formData.categoryName?.trim();

  //  validate
  if (!name) {
    toast.error("Vui lòng nhập tên danh mục");
    return;
  }

  try {
    if (isAddModalOpen) {
      await createCategory({ categoryName: name });
      toast.success(" Thêm danh mục thành công");
    }

    if (isEditModalOpen && selectedCategory) {
      await updateCategory(selectedCategory.id, {
        id: selectedCategory.id,
        categoryName: name,
      });
      toast.success(" Cập nhật danh mục thành công");
    }

    const data = await getCategories();
    setCategories(data);

    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({});
  } catch (error: any) {
    //  hiện đúng message backend (vd: “Danh mục đã tồn tại”)
    toast.error(error?.message || "Không thể lưu danh mục");
  }
};

const confirmDelete = async () => {
  if (!selectedCategory) return;

  try {
    await deleteCategory(selectedCategory.id);

    const data = await getCategories();
    setCategories(data);

    toast.success(" Xóa danh mục thành công");

    setIsDeleteDialogOpen(false);
  } catch (error: any) {
    toast.error(error?.message || "Không thể xóa danh mục");
  }
};
  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Danh sách các danh mục sản phẩm</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      <Table
        columns={columns}
        data={categories}
        renderRow={(category) => (
          <tr key={category.id} className="hover:bg-muted/50">
            <td className="px-6 py-4 text-sm font-medium text-foreground">{category.id}</td>
            <td className="px-6 py-4 text-sm text-foreground">{category.categoryName}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                  title="Sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        )}
        emptyMessage="Không có danh mục nào"
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm danh mục mới"
        size="sm"
      >
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          isEditModalOpen={isEditModalOpen}
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
        title="Chỉnh sửa danh mục"
        size="sm"
      >
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          isEditModalOpen={isEditModalOpen}
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
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory?.categoryName}"? Hành động này không thể hoàn tác.`} confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}

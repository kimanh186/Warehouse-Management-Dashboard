const API_URL = "https://warehousemanagement-2ga9.onrender.com/api";

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Có lỗi xảy ra");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// Products
export async function getProducts() {
    const response = await fetch(`${API_URL}/Products`);
    return response.json();
}

export async function createProduct(product: any) {
    const response = await fetch(`${API_URL}/Products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
    });

    return response.json();
}

export async function updateProduct(id: number, product: any) {
    const response = await fetch(`${API_URL}/Products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
    });

    return response.json();
}

export async function deleteProduct(id: number) {
    await fetch(`${API_URL}/Products/${id}`, {
        method: "DELETE",
    });
}

// Suppliers
export async function getSuppliers() {
    const response = await fetch(`${API_URL}/Suppliers`);
    return response.json();
}

export async function createSupplier(supplier: any) {
    const response = await fetch(`${API_URL}/Suppliers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
    });

    return response.json();
}

export async function updateSupplier(id: number, supplier: any) {
    const response = await fetch(`${API_URL}/Suppliers/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(supplier),
    });

    return response.json();
}

export async function deleteSupplier(id: number) {
    await fetch(`${API_URL}/Suppliers/${id}`, {
        method: "DELETE",
    });
}

// Categories
export async function getCategories() {
    const response = await fetch(`${API_URL}/Categories`);
    return response.json();
}

export async function createCategory(category: any) {
    const response = await fetch(`${API_URL}/Categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
    });

    return response.json();
}

export async function updateCategory(id: number, category: any) {
    const response = await fetch(`${API_URL}/Categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
    });

    return response.json();
}

export async function deleteCategory(id: number) {
  await fetch(`${API_URL}/Categories/${id}`, {
    method: "DELETE",
  });
}

// ==================== Import Orders ====================
export async function getImportOrders() {
    const response = await fetch(`${API_URL}/ImportOrders`);
    return handleResponse(response);
}

export async function createImportOrder(order: any) {
    const response = await fetch(`${API_URL}/ImportOrders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    });

    return handleResponse(response);
}

// ==================== Export Orders ====================
export async function getExportOrders() {
    const response = await fetch(`${API_URL}/ExportOrders`);
    return handleResponse(response);
}

export async function createExportOrder(order: any) {
    const response = await fetch(`${API_URL}/ExportOrders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    });

    return handleResponse(response);
}
const API_URL = "https://warehousemanagement-2ga9.onrender.com/api";
// const API_URL = "https://localhost:7000/api";
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

export async function getProducts() {
    const response = await fetch(`${API_URL}/Products`);
    return handleResponse(response);
}
export async function createProduct(form: FormData) {
    const response = await fetch(`${API_URL}/Products`, {
        method: "POST",
        body: form,
    });

    return handleResponse(response);
}
export async function updateProduct(id: number, form: FormData) {
    const response = await fetch(`${API_URL}/Products/${id}`, {
        method: "PUT",
        body: form,
    });

    return handleResponse(response);
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
  return handleResponse(response);
}

export async function createCategory(category: any) {
  const response = await fetch(`${API_URL}/Categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  return handleResponse(response);
}

export async function updateCategory(id: number, category: any) {
  const response = await fetch(`${API_URL}/Categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  return handleResponse(response);
}

export async function deleteCategory(id: number) {
  const response = await fetch(`${API_URL}/Categories/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
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

export async function deleteExportOrder(id: number) {
    const response = await fetch(`${API_URL}/ExportOrders/${id}`, {
        method: "DELETE",
    });
    return handleResponse(response);
}
export async function markExportOrderPrinted(id: number) {
    const response = await fetch(`${API_URL}/ExportOrders/${id}/print`, {
        method: "PUT",
    });

    return handleResponse(response);
}

//Report
export async function getImportReportByDate(date: string) {
    const response = await fetch(
        `${API_URL}/Reports/import-by-date?date=${date}T00:00:00Z`
    );

    return handleResponse(response);
}

export async function getImportReportByMonth(month: number, year: number) {
    const response = await fetch(
        `${API_URL}/Reports/import-by-month?month=${month}&year=${year}`
    );

    return handleResponse(response);
}

export async function getExpiringProducts() {
    const response = await fetch(`${API_URL}/Reports/expiring-products`);
    return handleResponse(response);
}

export async function getOutOfStockProducts() {
    const response = await fetch(`${API_URL}/Reports/out-of-stock`);
    return handleResponse(response);
}
export async function getExportReportByDate(date: string) {
  const response = await fetch(
    `${API_URL}/Reports/export-by-date?date=${date}T00:00:00Z`
  );
  return handleResponse(response);
}

export async function getExportReportByMonth(month: number, year: number) {
  const response = await fetch(
    `${API_URL}/Reports/export-by-month?month=${month}&year=${year}`
  );
  return handleResponse(response);
}


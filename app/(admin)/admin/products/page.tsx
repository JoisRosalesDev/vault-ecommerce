"use client";

import { Skeleton } from "@/components/atoms/skeleton";
import { Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/admin/products");
      if (!response.ok) {
        throw new Error("No se pudo obtener el listado de productos.");
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      const error = err as Error;
      setErrorMsg(error.message || "Error al recuperar los productos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImageUrl(product.images[0] || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      let response;
      if (editingProduct) {
        // Edit product
        response = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create product
        response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al guardar el producto.");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      const error = err as Error;
      setErrorMsg(error.message || "Error de red al guardar el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este producto?")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al eliminar.");
      }

      fetchProducts();
    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message || "Error de red al eliminar el producto.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-900">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
            Inventario
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Gestión de Productos
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-semibold transition-all transform active:scale-95 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Añadir Producto
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table view / loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-16 rounded-xl" />
          <Skeleton className="w-full h-16 rounded-xl" />
          <Skeleton className="w-full h-16 rounded-xl" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/20 rounded-2xl border border-neutral-900 border-dashed">
          <p className="text-lg text-neutral-400 font-medium">
            No hay productos registrados en el inventario.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-sm text-neutral-300 hover:text-white font-mono underline"
          >
            Crear el primer producto ahora
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-900 bg-neutral-900/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-xs font-mono uppercase text-neutral-500">
                <th className="py-4 px-6">Producto</th>
                <th className="py-4 px-6">Precio</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-5 px-6 font-medium text-white">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-xs text-neutral-500 font-normal line-clamp-1 max-w-sm mt-0.5">
                        {product.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-mono text-neutral-300">
                    ${product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-5 px-6 font-mono text-neutral-350">
                    {product.stock}
                  </td>
                  <td className="py-5 px-6">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-neutral-800 text-neutral-500 border border-neutral-700/30"
                      }`}
                    >
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
                        aria-label="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Edit/Create Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-450 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-neutral-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-450 uppercase mb-1">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-neutral-700 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-450 uppercase mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-neutral-700 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-450 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-neutral-700 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-450 uppercase mb-1">URL de Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:border-neutral-700 outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-4 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-semibold transition-all transform active:scale-[0.98] disabled:bg-neutral-800 disabled:text-neutral-500"
              >
                {isSubmitting ? "Guardando..." : "Guardar Producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

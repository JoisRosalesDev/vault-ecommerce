"use client";

import { Skeleton } from "@/components/atoms/skeleton";
import { Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  currency: string;
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
  const [brand, setBrand] = useState("other");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    setBrand("other");
    setCurrency("USD");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand || "other");
    setCurrency(product.currency || "USD");
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImageUrl(product.images[0] || "");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    let finalImageUrl = imageUrl;

    // Handle Image Upload to our server API route (bypasses browser RLS policies)
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "No se pudo subir la imagen del auto.");
        }
        finalImageUrl = uploadData.url;
      } catch (err) {
        console.error(err);
        const error = err as Error;
        setErrorMsg(error.message || "Error al cargar la imagen en el servidor.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      name,
      brand,
      currency,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      images: finalImageUrl ? [finalImageUrl] : [],
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
    <div className="space-y-8 text-neutral-900 dark:text-white">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-white/10">
        <div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-red-500 font-extrabold">
            Inventario
          </span>
          <h1 className="mt-1 text-3xl lg:text-4xl font-black uppercase tracking-wide text-neutral-950 dark:text-white font-heading">
            Gestión de Productos
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-950 stroke-[3]" />
          Añadir Producto
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 border border-red-500/20 bg-red-950/30 rounded-xl text-red-400 text-xs font-mono font-bold leading-relaxed flex items-center gap-3 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 stroke-[1.5]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table view / loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-12 rounded-xl border border-neutral-200 dark:border-neutral-800" />
          <Skeleton className="w-full h-16 rounded-xl border border-neutral-200 dark:border-neutral-800" />
          <Skeleton className="w-full h-16 rounded-xl border border-neutral-200 dark:border-neutral-800" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-50 dark:bg-neutral-900/40 backdrop-blur-md rounded-2xl border border-dashed border-neutral-300 dark:border-white/10">
          <p className="text-base text-neutral-500 dark:text-neutral-400 font-black uppercase font-heading">
            No hay productos registrados en el inventario.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-xs text-red-500 hover:text-red-400 font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Crear el primer producto ahora
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/10 text-xs font-mono font-black uppercase bg-neutral-50 dark:bg-neutral-955/40 text-neutral-550 dark:text-neutral-400">
                <th className="py-4.5 px-6 font-heading tracking-wider">Producto</th>
                <th className="py-4.5 px-6 font-heading tracking-wider">Precio</th>
                <th className="py-4.5 px-6 font-heading tracking-wider">Stock</th>
                <th className="py-4.5 px-6 font-heading tracking-wider">Estado</th>
                <th className="py-4.5 px-6 text-right font-heading tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-white/5 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-100/30 dark:hover:bg-white/2.5 transition-colors">
                  <td className="py-5 px-6 font-medium text-neutral-950 dark:text-white">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading font-bold uppercase tracking-wide">{product.name}</span>
                        {product.brand && product.brand !== "other" && (
                          <span className="text-[8px] font-mono tracking-widest px-2.5 py-0.5 border border-white/10 bg-white/5 text-neutral-300 uppercase font-bold shrink-0 rounded-full">
                            {product.brand}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 font-normal line-clamp-1 max-w-sm mt-1">
                        {product.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-mono text-neutral-900 dark:text-neutral-300 font-bold">
                    {formatPrice(product.price, product.currency)}
                  </td>
                  <td className="py-5 px-6 font-mono text-neutral-700 dark:text-neutral-300 font-bold">
                    {product.stock}
                  </td>
                  <td className="py-5 px-6">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-black uppercase font-heading ${
                        product.isActive
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-neutral-500/20 bg-neutral-500/10 text-neutral-450 dark:text-neutral-450"
                      }`}
                    >
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 active:scale-95 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer"
                        aria-label="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)] cursor-pointer"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative z-10 w-full max-w-lg bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-neutral-955/40">
              <h2 className="text-xl font-black uppercase text-white font-heading tracking-wider">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Nombre</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-full bg-neutral-950 border border-white/10 focus:border-red-500/40 text-white text-sm outline-none transition-colors font-sans uppercase font-bold"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Marca del Auto</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-full bg-neutral-950 border border-white/10 focus:border-red-500/40 text-white text-sm outline-none transition-colors font-mono font-bold uppercase"
                  >
                    <option value="ferrari">Ferrari</option>
                    <option value="lamborghini">Lamborghini</option>
                    <option value="bugatti">Bugatti</option>
                    <option value="other">Otro / Multimarca</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-955 border border-white/10 focus:border-red-500/40 text-white text-sm outline-none transition-colors resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-full bg-neutral-950 border border-white/10 focus:border-red-500/40 text-white text-sm outline-none transition-colors font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-full bg-neutral-950 border border-white/10 focus:border-red-500/40 text-white text-sm outline-none transition-colors font-mono font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CLP">CLP ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Stock de Unidades</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-full bg-neutral-955 border border-white/10 focus:border-red-500/40 text-white text-sm outline-none transition-colors font-mono font-bold"
                />
              </div>

              {/* device gallery file picker */}
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 tracking-wider">Imagen del Vehículo</label>
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/15 bg-neutral-950/40 hover:bg-neutral-955/80 transition-all rounded-2xl cursor-pointer text-center">
                    <div className="flex flex-col items-center justify-center px-4 py-3">
                      <Plus className="w-5 h-5 text-neutral-450 mb-1 stroke-[1.5]" />
                      <p className="text-xs text-neutral-300 truncate max-w-xs font-bold font-sans uppercase">
                        {imageFile ? imageFile.name : "Seleccionar desde el dispositivo"}
                      </p>
                      <p className="mt-0.5 text-[9px] text-neutral-550 font-mono">JPG, PNG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  
                  {(imageUrl || imageFile) && (
                    <div className="flex items-center gap-3.5 p-3 border border-white/10 bg-neutral-950/60 rounded-xl">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                          alt="Vista previa"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[10px] font-mono text-neutral-400 truncate font-bold">
                          {imageFile ? imageFile.name : "Imagen cargada"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImageUrl("");
                        }}
                        className="text-neutral-400 hover:text-red-500 p-2 rounded-full border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                        aria-label="Quitar imagen"
                      >
                        <X className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-4 rounded-full border border-white/10 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed cursor-pointer"
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

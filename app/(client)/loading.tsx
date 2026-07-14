import { ProductGrid } from "@/components/organisms/product-grid";

export default function CatalogLoading() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Hero Header Skeleton */}
      <section className="mb-16 max-w-2xl animate-pulse">
        <div className="w-24 h-4 bg-neutral-900 rounded-md" />
        <div className="w-48 h-12 bg-neutral-900 mt-4 rounded-xl" />
        <div className="w-full h-16 bg-neutral-900 mt-6 rounded-xl" />
      </section>

      {/* Catalog Title Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
          <div className="w-24 h-6 bg-neutral-900 rounded-md" />
          <div className="w-16 h-4 bg-neutral-900 rounded-md" />
        </div>

        {/* Loading Grid */}
        <ProductGrid products={[]} isLoading={true} />
      </section>
    </main>
  );
}

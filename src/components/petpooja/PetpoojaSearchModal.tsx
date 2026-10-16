import {
  useEffect,
  useState,
} from "react";

interface PetpoojaSearchModalProps {
  open: boolean;

  item: any;

  onClose: () => void;

  onSelect: (
    item: any,
    petpoojaItemId: number
  ) => void;

  searchProducts: (
    query: string
  ) => Promise<any[]>;

  loading?: boolean;
}

export default function PetpoojaSearchModal({
  open,
  item,
  onClose,
  onSelect,
  searchProducts,
  loading = false,
}: PetpoojaSearchModalProps) {

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState<any[]>([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    searched,
    setSearched,
  ] = useState(false);


  useEffect(() => {

    if (!open) {

      setQuery("");

      setResults([]);

      setSearched(false);

    }

  }, [open]);


  if (!open) {
    return null;
  }


  const invoiceProduct =
    item?.invoiceProduct || {};


  const handleSearch =
    async () => {

      const value =
        query.trim();

      if (!value) {
        return;
      }

      setSearching(true);

      setSearched(false);

      try {

        const data =
          await searchProducts(
            value
          );

        setResults(
          Array.isArray(data)
            ? data
            : []
        );

        setSearched(true);

      } catch (error) {

        console.error(
          "Petpooja search failed:",
          error
        );

        setResults([]);

        setSearched(true);

      } finally {

        setSearching(false);

      }
    };


  const handleSelect =
    (product: any) => {

      const id =
        Number(
          product?.id ??
          product?.itemId
        );

      if (
        !Number.isFinite(id)
      ) {
        return;
      }

      onSelect(
        product,
        id
      );

    };


  return (

    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">

      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white sm:max-w-3xl sm:rounded-2xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="shrink-0 border-b border-slate-100 p-4 sm:p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500">
                Change Mapping
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Search Petpooja Product
              </h2>

              <p className="mt-1 truncate text-sm text-slate-500">
                Invoice:{" "}
                {invoiceProduct.description ||
                  "Unknown Product"}
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-slate-500 hover:bg-slate-200"
            >
              ✕
            </button>

          </div>

        </div>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="shrink-0 border-b border-slate-100 bg-slate-50 p-3 sm:p-4">

          <div className="flex gap-2">

            <div className="relative min-w-0 flex-1">

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                autoFocus
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter"
                  ) {
                    handleSearch();
                  }

                }}
                placeholder="Search item name, code or barcode..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={
                searching ||
                loading ||
                !query.trim()
              }
              className="shrink-0 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
            >
              {searching
                ? "Searching..."
                : "Search"}
            </button>

          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Search directly in your Petpooja items.
          </p>

        </div>


        {/* ==================================================
            RESULTS
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">

          {(loading ||
            searching) && (

            <div className="py-10 text-center">

              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />

              <p className="mt-3 text-sm text-slate-500">
                Searching Petpooja...
              </p>

            </div>

          )}


          {!loading &&
            !searching &&
            !searched && (

            <div className="py-12 text-center">

              <div className="text-3xl">
                🔍
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Search for a Petpooja item
              </p>

              <p className="mt-1 text-xs text-slate-400">
                You can choose a different product
                from the suggested mapping.
              </p>

            </div>

          )}


          {!loading &&
            !searching &&
            searched &&
            results.length === 0 && (

            <div className="py-12 text-center">

              <div className="text-3xl">
                📦
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No products found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try another search term.
              </p>

            </div>

          )}


          {!loading &&
            !searching &&
            results.length > 0 && (

            <div className="space-y-2">

              <div className="mb-3 flex items-center justify-between">

                <p className="text-xs font-semibold text-slate-500">
                  {results.length} product
                  {results.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

                <p className="text-[10px] text-slate-400">
                  Select one to map
                </p>

              </div>


              {results.map(
                (
                  product: any,
                  index: number
                ) => (

                  <button
                    type="button"
                    key={
                      product.id ||
                      product.itemId ||
                      index
                    }
                    onClick={() =>
                      handleSelect(
                        product
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100 sm:p-4"
                  >

                    <div className="flex items-start gap-3">

                      {/* PRODUCT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="break-words text-sm font-bold text-slate-900">
                            {product.itemName ||
                              product.name ||
                              product.description ||
                              "Unnamed Product"}
                          </p>

                          {product.isActive ===
                            false && (
                            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                              INACTIVE
                            </span>
                          )}

                        </div>


                        {product.description && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {product.description}
                          </p>
                        )}


                        {/* DETAILS */}

                        <div className="mt-2 flex flex-wrap gap-1.5">

                          <DetailChip
                            label="MRP"
                            value={`₹${formatMoney(
                              product.mrp
                            )}`}
                          />

                          <DetailChip
                            label="Purchase"
                            value={`₹${formatMoney(
                              product.purchaseRate
                            )}`}
                          />

                          <DetailChip
                            label="Sales"
                            value={`₹${formatMoney(
                              product.salesRate
                            )}`}
                          />

                          <DetailChip
                            label="Stock"
                            value={getStock(
                              product
                            )}
                          />

                          {product.hsn && (
                            <DetailChip
                              label="HSN"
                              value={
                                product.hsn
                              }
                            />
                          )}

                          {product.itemCode && (
                            <DetailChip
                              label="Code"
                              value={
                                product.itemCode
                              }
                            />
                          )}

                        </div>


                        {/* GROUP / CATEGORY */}

                        {(product.groupName ||
                          product.categoryName ||
                          product.group ||
                          product.category) && (

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">

                            {(product.groupName ||
                              product.group) && (
                              <span>
                                Group:{" "}
                                <b className="text-slate-600">
                                  {product.groupName ||
                                    product.group}
                                </b>
                              </span>
                            )}

                            {(product.categoryName ||
                              product.category) && (
                              <span>
                                Category:{" "}
                                <b className="text-slate-600">
                                  {product.categoryName ||
                                    product.category}
                                </b>
                              </span>
                            )}

                          </div>

                        )}

                      </div>


                      {/* SELECT */}

                      <div className="shrink-0 self-center">

                        <span className="inline-flex rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white">
                          Use This
                        </span>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


function DetailChip({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
      <span className="text-slate-400">
        {label}
      </span>{" "}
      <b>{value ?? "—"}</b>
    </span>
  );
}


function getStock(
  item: any
) {
  return Number(
    item?.availableStockQty ??
    item?.stock?.available ??
    item?.stock?.total ??
    item?.totalStock ??
    item?.availableStock?.total ??
    0
  );
}


function formatMoney(
  value: any
) {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return value ?? "0";
  }

  return number.toFixed(2);
}
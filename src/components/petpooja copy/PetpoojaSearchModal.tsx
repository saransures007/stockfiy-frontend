import { useEffect, useState } from "react";

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
  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<any[]>([]);

  const [searching, setSearching] =
    useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const invoiceProduct =
    item?.invoiceProduct || {};

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }

    setSearching(true);

    try {
      const data =
        await searchProducts(
          query.trim()
        );

      setResults(
        Array.isArray(data)
          ? data
          : []
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-white sm:max-w-2xl sm:rounded-2xl">
        {/* HEADER */}

        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-orange-500">
                Change Mapping
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Search Petpooja Product
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Invoice:{" "}
                {invoiceProduct.description ||
                  "Unknown"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-slate-100 px-3 py-2 text-slate-500"
            >
              ✕
            </button>
          </div>
        </div>

        {/* SEARCH */}

        <div className="border-b border-slate-100 p-4">
          <div className="flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search product name..."
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <button
              onClick={handleSearch}
              disabled={
                searching ||
                !query.trim()
              }
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {searching
                ? "..."
                : "Search"}
            </button>
          </div>
        </div>

        {/* RESULTS */}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading products...
            </div>
          )}

          {!loading &&
            searching && (
              <div className="py-10 text-center text-sm text-slate-500">
                Searching...
              </div>
            )}

          {!loading &&
            !searching &&
            results.length === 0 && (
              <div className="py-10 text-center">
                <div className="text-3xl">
                  🔍
                </div>

                <p className="mt-3 font-medium text-slate-700">
                  Search Petpooja products
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Search by product name,
                  description or item code.
                </p>
              </div>
            )}

          <div className="space-y-3">
            {results.map(
              (
                product: any,
                index: number
              ) => (
                <div
                  key={
                    product.id ||
                    product.itemId ||
                    index
                  }
                  className="rounded-xl border border-slate-200 p-4 hover:border-orange-300"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {product.itemName ||
                          product.name ||
                          product.description ||
                          "Unnamed Product"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>
                          ID:{" "}
                          {product.id ||
                            product.itemId ||
                            "—"}
                        </span>

                        <span>
                          MRP:{" "}
                          {formatMoney(
                            product.mrp
                          )}
                        </span>

                        <span>
                          Sales:{" "}
                          {formatMoney(
                            product.salesRate
                          )}
                        </span>

                        <span>
                          Purchase:{" "}
                          {formatMoney(
                            product.purchaseRate
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const id =
                          Number(
                            product.id ||
                              product.itemId
                          );

                        if (
                          Number.isFinite(id)
                        ) {
                          onSelect(
                            product,
                            id
                          );
                        }
                      }}
                      className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                      Use This
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: any) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}
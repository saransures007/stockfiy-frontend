import { useMemo, useState } from "react";
import MappingItemCard from "./MappingItemCard";
import PetpoojaSearchModal from "./PetpoojaSearchModal";

interface ProductMappingStepProps {
  mappingData: any;
  confirmingId: number | null;
  onConfirm: (
    item: any,
    petpoojaItemId: number
  ) => void;
  onSearchProducts: (
    query: string
  ) => Promise<any[]>;
  onContinue: () => void;
  onBack: () => void;
}

export default function ProductMappingStep({
  mappingData,
  confirmingId,
  onConfirm,
  onSearchProducts,
  onContinue,
  onBack,
}: ProductMappingStepProps) {
  const [searchItem, setSearchItem] =
    useState<any>(null);

  const mapping =
    mappingData?.mapping || {};

  const items =
    mapping.items || [];

  const total =
    mapping.totalProducts ||
    items.length ||
    0;

  const mapped =
    mapping.alreadyMapped ||
    items.filter(
      (item: any) =>
        item.mapping?.status ===
        "ALREADY_MAPPED"
    ).length;

  const unmatched =
    items.filter(
      (item: any) => {
        const status =
          item.mapping?.status;

        return (
          status !==
          "ALREADY_MAPPED"
        );
      }
    ).length;

  const complete =
    total > 0 &&
    mapped === total;

  const progress =
    total > 0
      ? Math.round(
          (mapped / total) * 100
        )
      : 0;

  const stats = useMemo(
    () => ({
      high:
        mapping.highConfidence || 0,
      medium:
        mapping.mediumConfidence || 0,
      low:
        mapping.lowConfidence || 0,
    }),
    [mapping]
  );

  const handleCustomSearch = (
    item: any
  ) => {
    setSearchItem(item);
  };

  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              onClick={onBack}
              className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Review
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              Product Mapping
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Map every invoice item to the
              correct Petpooja product.
            </p>
          </div>

          <div
            className={[
              "rounded-xl px-4 py-3 text-center",
              complete
                ? "bg-green-50"
                : "bg-orange-50",
            ].join(" ")}
          >
            <p
              className={[
                "text-xs",
                complete
                  ? "text-green-600"
                  : "text-orange-600",
              ].join(" ")}
            >
              Mapping Status
            </p>

            <p
              className={[
                "text-xl font-bold",
                complete
                  ? "text-green-700"
                  : "text-orange-700",
              ].join(" ")}
            >
              {mapped}/{total}
            </p>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                Mapping Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {complete
                  ? "All invoice items are mapped."
                  : `${unmatched} item(s) still need attention.`}
              </p>
            </div>

            <span className="text-lg font-bold text-slate-900">
              {progress}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard
            label="Total"
            value={total}
          />

          <StatCard
            label="Mapped"
            value={mapped}
            green
          />

          <StatCard
            label="High"
            value={stats.high}
          />

          <StatCard
            label="Medium"
            value={stats.medium}
          />

          <StatCard
            label="Low"
            value={stats.low}
          />
        </div>

        {/* HELP */}

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <strong>Tip:</strong> You can change an
          existing mapping at any time using
          <strong> Change Mapping</strong>, or
          manually search for a Petpooja item.
        </div>

        {/* ITEMS */}

        <div className="space-y-4">
          {items.map(
            (
              item: any,
              index: number
            ) => (
              <MappingItemCard
                key={
                  item.invoiceProduct
                    ?.lineNumber ||
                  index
                }
                item={item}
                confirmingId={
                  confirmingId
                }
                onConfirm={onConfirm}
                onSearch={
                  handleCustomSearch
                }
              />
            )
          )}
        </div>

        {/* BOTTOM */}

        <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:flex-row sm:justify-end">
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
          >
            ← Back
          </button>

          <button
            disabled={!complete}
            onClick={onContinue}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:w-auto"
          >
            {complete
              ? "Continue to Purchase Review →"
              : `Map ${unmatched} Remaining`}
          </button>
        </div>
      </div>

      {/* SEARCH MODAL */}

      <PetpoojaSearchModal
        open={!!searchItem}
        item={searchItem}
        onClose={() =>
          setSearchItem(null)
        }
        searchProducts={
          onSearchProducts
        }
        onSelect={(
          product,
          petpoojaItemId
        ) => {
          onConfirm(
            searchItem,
            petpoojaItemId
          );

          setSearchItem(null);
        }}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  green = false,
}: {
  label: string;
  value: number;
  green?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100",
        green
          ? "ring-green-100"
          : "",
      ].join(" ")}
    >
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-xl font-bold",
          green
            ? "text-green-600"
            : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
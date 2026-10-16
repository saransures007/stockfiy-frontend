import React from "react";

interface MappingItemCardProps {
  item: any;
  confirmingId: number | null;
  onConfirm: (
    item: any,
    petpoojaItemId: number
  ) => void;
  onSearch: (item: any) => void;
}

export default function MappingItemCard({
  item,
  confirmingId,
  onConfirm,
  onSearch,
}: MappingItemCardProps) {
  const itemMapping =
    item.mapping || {};

  const invoiceProduct =
    item.invoiceProduct || {};

  const candidates =
    itemMapping.candidates || [];

  const selected =
    itemMapping.petpoojaItem ||
    candidates[0]?.item;

  const status =
    itemMapping.status ||
    "UNMATCHED";

  const confidence =
    itemMapping.confidence ?? 0;

  const alreadyMapped =
    status === "ALREADY_MAPPED";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
              {invoiceProduct.lineNumber ||
                "#"}
            </span>

            <p className="text-xs font-medium uppercase text-slate-400">
              Invoice Product
            </p>
          </div>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {invoiceProduct.description ||
              "Unknown Product"}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>
              HSN: {invoiceProduct.hsn || "—"}
            </Badge>

            <Badge>
              Qty:{" "}
              {invoiceProduct.quantity ?? "—"}
            </Badge>

            <Badge>
              MRP:{" "}
              {formatMoney(invoiceProduct.mrp)}
            </Badge>

            <Badge>
              Rate:{" "}
              {formatMoney(invoiceProduct.rate)}
            </Badge>
          </div>
        </div>

        <StatusBadge
          status={status}
          confidence={confidence}
        />
      </div>

      {/* ALREADY MAPPED */}

      {alreadyMapped && selected && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                ✓
              </div>

              <div>
                <p className="font-semibold text-green-800">
                  Already Mapped
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {selected.itemName ||
                    selected.name ||
                    "Petpooja Product"}
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-green-700">
                  <span>
                    ID: {selected.id}
                  </span>

                  <span>
                    MRP:{" "}
                    {formatMoney(
                      selected.mrp
                    )}
                  </span>

                  <span>
                    Sales:{" "}
                    {formatMoney(
                      selected.salesRate
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* IMPORTANT: CHANGE */}

            <button
              type="button"
              onClick={() =>
                onSearch(item)
              }
              className="rounded-xl border border-green-300 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              Change Mapping
            </button>
          </div>
        </div>
      )}

      {/* SUGGESTION */}

      {!alreadyMapped && selected && (
        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-orange-600">
                  Suggested Petpooja Product
                </p>

                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                  {confidence}%
                </span>
              </div>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {selected.itemName ||
                  "Unnamed Product"}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <PriceInfo
                  label="MRP"
                  value={selected.mrp}
                />

                <PriceInfo
                  label="Purchase"
                  value={
                    selected.purchaseRate
                  }
                />

                <PriceInfo
                  label="Sales"
                  value={
                    selected.salesRate
                  }
                />

                <PriceInfo
                  label="HSN"
                  value={
                    selected.hsn || "—"
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  onConfirm(
                    item,
                    selected.id
                  )
                }
                disabled={
                  confirmingId === selected.id
                }
                className="flex-1 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {confirmingId === selected.id
                  ? "Confirming..."
                  : "✓ Confirm Mapping"}
              </button>

              <button
                type="button"
                onClick={() =>
                  onSearch(item)
                }
                className="flex-1 rounded-xl border border-orange-300 bg-white px-5 py-3 font-semibold text-orange-700 hover:bg-orange-50"
              >
                🔍 Search / Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NO MATCH */}

      {!selected && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            No matching Petpooja product found
          </p>

          <p className="mt-1 text-sm text-red-600">
            Search for the product manually.
          </p>

          <button
            type="button"
            onClick={() =>
              onSearch(item)
            }
            className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
          >
            🔍 Search Petpooja Product
          </button>
        </div>
      )}

      {/* MATCH REASONS */}

      {itemMapping.reasons?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Match Reasons
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {itemMapping.reasons.map(
              (
                reason: string,
                index: number
              ) => (
                <span
                  key={index}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {formatReason(reason)}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* OTHER SUGGESTIONS */}

      {candidates.length > 1 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-semibold text-slate-600">
            View other suggestions (
            {candidates.length - 1})
          </summary>

          <div className="mt-3 space-y-2">
            {candidates
              .slice(1)
              .map(
                (
                  candidate: any,
                  index: number
                ) => {
                  const candidateItem =
                    candidate.item;

                  if (!candidateItem) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        candidateItem.id ||
                        index
                      }
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {
                            candidateItem.itemName
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span>
                            MRP:{" "}
                            {formatMoney(
                              candidateItem.mrp
                            )}
                          </span>

                          <span>
                            Confidence:{" "}
                            {candidate.confidence ??
                              candidate.score ??
                              0}
                            %
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onConfirm(
                            item,
                            candidateItem.id
                          )
                        }
                        disabled={
                          confirmingId ===
                          candidateItem.id
                        }
                        className="rounded-lg border border-orange-300 px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                      >
                        {confirmingId ===
                        candidateItem.id
                          ? "Confirming..."
                          : "Use This"}
                      </button>
                    </div>
                  );
                }
              )}
          </div>
        </details>
      )}

      {/* ALWAYS AVAILABLE */}

      {alreadyMapped && (
        <button
          type="button"
          onClick={() =>
            onSearch(item)
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          🔍 Search different Petpooja item
        </button>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  confidence,
}: {
  status: string;
  confidence: number;
}) {
  if (status === "ALREADY_MAPPED") {
    return (
      <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase text-green-600">
          Mapped
        </p>

        <p className="mt-1 text-xl font-bold text-green-700">
          ✓
        </p>
      </div>
    );
  }

  if (confidence >= 90) {
    return (
      <div className="rounded-xl bg-green-50 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase text-green-600">
          High Match
        </p>

        <p className="mt-1 text-xl font-bold text-green-700">
          {confidence}%
        </p>
      </div>
    );
  }

  if (confidence >= 60) {
    return (
      <div className="rounded-xl bg-yellow-50 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase text-yellow-600">
          Medium Match
        </p>

        <p className="mt-1 text-xl font-bold text-yellow-700">
          {confidence}%
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
      <p className="text-xs font-semibold uppercase text-red-600">
        Low Match
      </p>

      <p className="mt-1 text-xl font-bold text-red-700">
        {confidence}%
      </p>
    </div>
  );
}

function PriceInfo({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-800">
        {label === "HSN"
          ? value || "—"
          : formatMoney(value)}
      </p>
    </div>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
      {children}
    </span>
  );
}

function formatReason(reason: string) {
  const labels: Record<string, string> = {
    description_exact: "Description matches",
    invoice_name_inside_itemName:
      "Name found in product name",
    hsn_match: "HSN matches",
    mrp_match: "MRP matches",
    purchase_rate_match:
      "Purchase rate matches",
  };

  return (
    labels[reason] ||
    reason.replaceAll("_", " ")
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
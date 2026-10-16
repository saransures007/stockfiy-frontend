import React from "react";

interface ReviewItemsStepProps {
  invoice: any;
  loading?: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export default function ReviewItemsStep({
  invoice,
  loading,
  onBack,
  onContinue,
}: ReviewItemsStepProps) {
  const detail =
    invoice?.data ||
    invoice?.invoice ||
    invoice;

  const products =
    detail?.products ||
    detail?.extra_products ||
    detail?.items ||
    [];

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to invoices
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Review Invoice
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Verify the invoice information before
            mapping products.
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 px-4 py-3">
          <p className="text-xs text-orange-600">
            Invoice Items
          </p>

          <p className="text-xl font-bold text-orange-700">
            {products.length}
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InfoCard
          title="Invoice Number"
          value={
            detail.invoice_no ||
            detail.invoice_number ||
            detail.number
          }
        />

        <InfoCard
          title="Invoice Date"
          value={
            detail.invoice_date ||
            detail.date
          }
        />

        <InfoCard
          title="Supplier"
          value={
            detail.seller?.company_name ||
            detail.supplier?.name ||
            detail.supplier_name
          }
        />

        <InfoCard
          title="GSTIN"
          value={
            detail.seller?.gst_no ||
            detail.supplier?.gstin
          }
        />
      </div>

      {/* ITEMS */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <h2 className="font-semibold text-slate-900">
            Invoice Items
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review quantity, price and tax details.
          </p>
        </div>

        {/* DESKTOP */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  #
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  HSN
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Qty
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Rate
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  MRP
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  GST
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products.map(
                (product: any, index: number) => (
                  <tr
                    key={product.id || index}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {index + 1}
                    </td>

                    <td className="min-w-[280px] px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {product.description ||
                          product.name ||
                          product.item_name ||
                          "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {product.hsn || "—"}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      {product.quantity ?? "—"}
                      {product.unit && (
                        <span className="ml-1 text-xs text-slate-400">
                          {product.unit}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      {formatMoney(product.rate)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      {formatMoney(product.mrp)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      {product.gst_rate ??
                        product.gstRate ??
                        "—"}
                      {(product.gst_rate ??
                        product.gstRate) != null &&
                        "%"}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-semibold">
                      {formatMoney(
                        product.total_amount ??
                          product.totalAmount ??
                          product.amount ??
                          product.total ??
                          product.taxable_amount ??
                          product.taxableAmount
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}

        <div className="divide-y divide-slate-100 md:hidden">
          {products.map(
            (product: any, index: number) => (
              <div
                key={product.id || index}
                className="p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {product.description ||
                        product.name ||
                        product.item_name ||
                        "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      HSN: {product.hsn || "—"}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    #{index + 1}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MobileValue
                    label="Quantity"
                    value={`${product.quantity ?? "—"} ${
                      product.unit || ""
                    }`}
                  />

                  <MobileValue
                    label="Rate"
                    value={formatMoney(
                      product.rate
                    )}
                  />

                  <MobileValue
                    label="MRP"
                    value={formatMoney(
                      product.mrp
                    )}
                  />

                  <MobileValue
                    label="GST"
                    value={
                      product.gst_rate ??
                      product.gstRate
                        ? `${
                            product.gst_rate ??
                            product.gstRate
                          }%`
                        : "—"
                    }
                  />

                  <MobileValue
                    label="Amount"
                    value={formatMoney(
                      product.total_amount ??
                        product.totalAmount ??
                        product.amount ??
                        product.total ??
                        product.taxable_amount ??
                        product.taxableAmount
                    )}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* TOTAL */}

      <div className="ml-auto max-w-md rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 font-semibold text-slate-900">
          Invoice Summary
        </h2>

        <SummaryRow
          label="Subtotal"
          value={
            detail.subtotal ||
            detail.taxable_amount ||
            detail.taxableValue
          }
        />

        <SummaryRow
          label="CGST"
          value={
            detail.cgst ||
            detail.cgst_amount
          }
        />

        <SummaryRow
          label="SGST"
          value={
            detail.sgst ||
            detail.sgst_amount
          }
        />

        <div className="my-3 border-t border-slate-100" />

        <SummaryRow
          label="Grand Total"
          value={
            detail.grand_total ||
            detail.total_amount ||
            detail.total
          }
          bold
        />
      </div>

      {/* ACTION */}

      <div className="sticky bottom-3 flex justify-end">
        <button
          onClick={onContinue}
          disabled={
            loading ||
            products.length === 0
          }
          className="w-full rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading
            ? "Finding Products..."
            : "Continue to Product Mapping →"}
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-medium uppercase text-slate-400">
        {title}
      </p>

      <p className="mt-2 truncate font-semibold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function MobileValue({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: any;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 py-2 ${
        bold
          ? "text-lg font-bold text-slate-900"
          : "text-sm text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span>{formatMoney(value)}</span>
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
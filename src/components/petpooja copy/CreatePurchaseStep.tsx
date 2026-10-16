interface CreatePurchaseStepProps {
  invoice: any;
  purchaseItems: any[];
  onBack: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export default function CreatePurchaseStep({
  invoice,
  purchaseItems,
  onBack,
  onSubmit,
  submitting = false,
}: CreatePurchaseStepProps) {
  const detail =
    invoice?.data ||
    invoice?.invoice ||
    invoice;

  const subtotal =
    purchaseItems.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(
            item.purchaseRate || 0
          ),
      0
    );

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={onBack}
          className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Purchase Review
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Create Purchase Bill
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Verify everything before submitting
          the purchase.
        </p>
      </div>

      {/* INVOICE */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Invoice"
          value={
            detail.invoice_no ||
            detail.invoice_number ||
            detail.number ||
            "—"
          }
        />

        <SummaryCard
          label="Supplier"
          value={
            detail.seller?.company_name ||
            detail.supplier?.name ||
            detail.supplier_name ||
            "—"
          }
        />

        <SummaryCard
          label="Items"
          value={purchaseItems.length}
        />

        <SummaryCard
          label="Total"
          value={formatMoney(subtotal)}
        />
      </div>

      {/* CHECKLIST */}

      <div className="rounded-2xl bg-green-50 p-5 ring-1 ring-green-100">
        <h2 className="font-semibold text-green-900">
          Ready to create purchase
        </h2>

        <div className="mt-4 space-y-3 text-sm text-green-800">
          <Check text="All invoice items mapped" />

          <Check text="Purchase quantities reviewed" />

          <Check text="Purchase prices reviewed" />

          <Check text="MRP and sales prices reviewed" />

          <Check text="Stock changes prepared" />
        </div>
      </div>

      {/* ITEMS */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b p-4">
          <h2 className="font-semibold">
            Final Purchase Items
          </h2>
        </div>

        <div className="divide-y">
          {purchaseItems.map(
            (item, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {
                      item.invoiceProduct
                        ?.description
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    →
                    {" "}
                    {
                      item.petpoojaItem
                        ?.itemName
                    }
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-right text-sm">
                  <div>
                    <p className="text-xs text-slate-400">
                      Qty
                    </p>
                    <p className="font-semibold">
                      {item.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Purchase
                    </p>
                    <p className="font-semibold">
                      {formatMoney(
                        item.purchaseRate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      MRP
                    </p>
                    <p className="font-semibold">
                      {formatMoney(
                        item.mrp
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* SUBMIT */}

      <div className="sticky bottom-3 flex flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:flex-row sm:justify-end">
        <button
          onClick={onBack}
          disabled={submitting}
          className="w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 sm:w-auto"
        >
          ← Back
        </button>

        <button
          onClick={onSubmit}
          disabled={
            submitting ||
            purchaseItems.length === 0
          }
          className="w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 sm:w-auto"
        >
          {submitting
            ? "Creating Purchase..."
            : "✓ Create Purchase Bill"}
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate font-semibold">
        {value}
      </p>
    </div>
  );
}

function Check({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-700">
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
}

function formatMoney(value: any) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
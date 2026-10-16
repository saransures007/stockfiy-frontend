import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  Card,
  Alert,
} from "antd";

import type {
  ColumnsType,
} from "antd/es/table";

import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
} from "@ant-design/icons";


// ============================================================
// TYPES
// ============================================================

interface ReviewItemsStepProps {
  invoice: any;

  loading?: boolean;

  suppliers: any[];

  selectedSupplier: any | null;

  onSupplierChange: (
    supplier: any | null
  ) => void;

  loadingSuppliers?: boolean;

  onBack: () => void;

  onContinue: (
    products?: any[]
  ) => void;
}


interface ReviewProduct {
  id?: any;

  description?: string;
  name?: string;
  item_name?: string;
  item_code?: string;

  hsn?: string;

  quantity?: number;
  unit?: string;

  rate?: number;
  mrp?: number;

  gst_rate?: number;
  gstRate?: number;

  discount_rate?: number;
  discountRate?: number;

  discount_amount?: number;
  discountAmount?: number;

  total_amount?: number;
  totalAmount?: number;
  amount?: number;
  total?: number;

  taxable_amount?: number;
  taxableAmount?: number;

  // Original invoice amount for the row.
  _invoiceAmount?: number | null;

  // Original invoice quantity.
  _invoiceQuantity?: number | null;

  // Whether the row was commercially edited.
  _amountEdited?: boolean;

  lineNumber?: number;

  _canonicalLine?: any;
  _validation?: any;
  _intelligence?: any;

  [key: string]: any;
}


// ============================================================
// UNITS
// ============================================================
//
// Important:
//
// We DO NOT convert BOX -> PCS.
//
// For aggregate/container units, the invoice's extracted
// total_amount is treated as the amount for that UOM.
//
// Example:
//
//   1 BOX = ₹540.04
//
// Then:
//
//   2 BOX = ₹1,080.08
//
// Only the quantity changes.
//
// ============================================================

const AGGREGATE_UNITS = new Set([
  "BOX",
  "PACK",
  "PAC",
  "PKT",
  "CASE",
  "CARTON",
  "CTN",
  "BUNDLE",
  "BAG",
  "DOZEN",
  "DOZ",
  "SET",
]);


// ============================================================
// COMPONENT
// ============================================================

export default function ReviewItemsStep({
  invoice,

  loading = false,

  suppliers = [],

  selectedSupplier,

  onSupplierChange,

  loadingSuppliers = false,

  onBack,

  onContinue,
}: ReviewItemsStepProps) {


  // ==========================================================
  // CANONICAL INVOICE
  // ==========================================================

  const canonical =
    invoice?.canonical ||
    invoice?.data?.canonical ||
    null;


  const canonicalLines =
    Array.isArray(
      canonical?.lines
    )
      ? canonical.lines
      : [];


  // ==========================================================
  // RESOLVED FIELD HELPERS
  // ==========================================================

  const valueOf = <T,>(
    field: T | {
      value?: T | null;
      [key: string]: any;
    } | null | undefined
  ): T | null => {

    if (
      field &&
      typeof field === "object" &&
      Object.prototype.hasOwnProperty.call(
        field,
        "value"
      )
    ) {
      return (
        (field as any).value ?? null
      );
    }

    return (
      field as T | null | undefined
    ) ?? null;
  };


  const numberOf = (
    field: any
  ): number | null => {

    const value =
      valueOf<any>(field);

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  };


  const stringOf = (
    field: any
  ): string => {

    const value =
      valueOf<any>(field);

    return value === null ||
      value === undefined
      ? ""
      : String(value);
  };


  // ==========================================================
  // UNIT HELPERS
  // ==========================================================

  function normalizeUnit(
    unit: any
  ): string {

    return String(
      unit ?? ""
    )
      .trim()
      .toUpperCase();
  }


  function isAggregateUnit(
    unit: any
  ): boolean {

    return AGGREGATE_UNITS.has(
      normalizeUnit(unit)
    );
  }


  // ==========================================================
  // CANONICAL → EDITABLE ROW
  // ==========================================================

  const canonicalProducts =
    useMemo<ReviewProduct[]>(
      () =>
        canonicalLines.map(
          (
            line: any,
            index: number
          ) => {

            const product =
              line?.product || {};

            const purchase =
              line?.purchase || {};

            const tax =
              line?.tax || {};

            const totals =
              line?.totals || {};


            const invoiceAmount =
              numberOf(
                totals.totalAmount
              );


            const invoiceQuantity =
              numberOf(
                purchase.quantity
              );


            return {

              // ------------------------------------------------
              // Keep canonical identity
              // ------------------------------------------------

              _rowId:
                line?.id ||
                `canonical-line-${index + 1}`,

              _canonicalLine:
                line,

              lineNumber:
                line?.lineNumber ||
                index + 1,


              // ------------------------------------------------
              // Preserve original invoice amount
              // ------------------------------------------------

              _invoiceAmount:
                invoiceAmount,

              _invoiceQuantity:
                invoiceQuantity,

              _amountEdited:
                false,


              // ------------------------------------------------
              // Product
              // ------------------------------------------------

              description:
                stringOf(
                  product.name
                ),

              name:
                stringOf(
                  product.name
                ),

              item_code:
                stringOf(
                  product.code
                ),

              hsn:
                stringOf(
                  product.hsn
                ),

              unit:
                stringOf(
                  product.unit
                ),

              mrp:
                numberOf(
                  product.mrp
                ) ?? 0,


              // ------------------------------------------------
              // Purchase
              // ------------------------------------------------

              quantity:
                numberOf(
                  purchase.quantity
                ) ?? 0,

              rate:
                numberOf(
                  purchase.purchaseRate
                ) ?? 0,

              discount_rate:
                numberOf(
                  purchase.discountRate
                ) ?? 0,

              discount_amount:
                numberOf(
                  purchase.discountAmount
                ),


              // ------------------------------------------------
              // Tax
              // ------------------------------------------------

              gst_rate:
                numberOf(
                  tax.gstRate
                ) ?? 0,


              // ------------------------------------------------
              // Amounts
              // ------------------------------------------------

              taxable_amount:
                numberOf(
                  totals.taxableAmount
                ),

              total_amount:
                invoiceAmount,

              amount:
                invoiceAmount,


              // ------------------------------------------------
              // Intelligence / validation
              // ------------------------------------------------

              _validation:
                line?.validation,

              _intelligence:
                line?.intelligence,
            };
          }
        ),
      [canonical]
    );


  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const [
    products,
    setProducts,
  ] =
    useState<ReviewProduct[]>(
      canonicalProducts
    );


  // ==========================================================
  // ROW EDIT / SELECTION STATE
  // ==========================================================

  const [
    editingKey,
    setEditingKey,
  ] = useState<any>(null);


  const [
    selectedRowKeys,
    setSelectedRowKeys,
  ] = useState<React.Key[]>([]);


  // ==========================================================
  // REBUILD WHEN INVOICE CHANGES
  // ==========================================================

  useEffect(() => {

    setProducts(
      canonicalProducts
    );

    setEditingKey(null);

    setSelectedRowKeys([]);

  }, [canonicalProducts]);


  // ==========================================================
  // CALCULATE STANDARD UNIT AMOUNT
  // ==========================================================
  //
  // Used for:
  //
  // PCS
  // PC
  // UNIT
  // EA
  //
  // Formula:
  //
  // Qty × Purchase Rate
  //      ↓
  // Discount
  //      ↓
  // GST
  //
  // ==========================================================

  function calculateStandardLine(
    product: ReviewProduct
  ) {

    const qty =
      Number(
        product.quantity ?? 0
      );

    const rate =
      Number(
        product.rate ?? 0
      );

    const discountRate =
      Number(
        product.discount_rate ??
        product.discountRate ??
        0
      );

    const discountAmount =
      product.discount_amount ??
      product.discountAmount;

    const gst =
      Number(
        product.gst_rate ??
        product.gstRate ??
        0
      );


    const gross =
      qty * rate;


    let discount = 0;

    if (
      discountAmount !== null &&
      discountAmount !== undefined &&
      Number.isFinite(
        Number(discountAmount)
      )
    ) {

      discount =
        Number(
          discountAmount
        );

    } else {

      discount =
        gross *
        discountRate /
        100;

    }


    const taxable =
      gross -
      discount;


    const gstAmount =
      taxable *
      gst /
      100;


    const total =
      taxable +
      gstAmount;


    return {

      gross,

      discount,

      taxable,

      gstAmount,

      total,
    };
  }


  // ==========================================================
  // CALCULATE AGGREGATE UOM
  // ==========================================================
  //
  // Example:
  //
  // Original:
  //
  //   1 BOX = ₹540.04
  //
  // User changes:
  //
  //   1 BOX → 2 BOX
  //
  // Result:
  //
  //   ₹540.04 × 2 = ₹1,080.08
  //
  // NO BOX → PCS conversion.
  //
  // ==========================================================

  function calculateAggregateLine(
    product: ReviewProduct
  ) {

    const qty =
      Number(
        product.quantity ?? 0
      );


    const originalQty =
      Number(
        product._invoiceQuantity ?? 0
      );


    const originalAmount =
      Number(
        product._invoiceAmount ?? 0
      );


    if (
      !Number.isFinite(
        originalQty
      ) ||
      originalQty <= 0 ||
      !Number.isFinite(
        originalAmount
      )
    ) {

      return {

        gross: 0,

        discount: 0,

        taxable: 0,

        gstAmount: 0,

        total:
          originalAmount,

      };

    }


    const amountPerOriginalUom =
      originalAmount /
      originalQty;


    const total =
      amountPerOriginalUom *
      qty;


    return {

      gross:
        total,

      discount:
        0,

      taxable:
        total,

      gstAmount:
        0,

      total,

    };
  }


  // ==========================================================
  // CALCULATE LINE
  // ==========================================================

  function calculateLine(
    product: ReviewProduct
  ) {

    if (
      isAggregateUnit(
        product.unit
      )
    ) {

      return calculateAggregateLine(
        product
      );

    }


    return calculateStandardLine(
      product
    );
  }


  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  function updateProduct(
    key: any,
    field: string,
    value: any
  ) {

    setProducts(
      current =>
        current.map(
          product => {

            if (
              product._rowId !== key
            ) {
              return product;
            }


            const updated: ReviewProduct = {
              ...product,
              [field]: value,
              _amountEdited:
                true,
            };


            // --------------------------------------------------
            // If quantity changes
            // --------------------------------------------------

            if (
              field ===
              "quantity"
            ) {

              const result =
                calculateLine(
                  updated
                );


              updated.taxable_amount =
                result.taxable;


              updated.total_amount =
                result.total;


              updated.amount =
                result.total;

            }


            // --------------------------------------------------
            // For standard units, changing rate/GST/discount
            // recalculates normally.
            //
            // For BOX/PACK/etc., changing rate/GST does NOT
            // silently destroy the invoice UOM amount.
            // --------------------------------------------------

            if (
              field === "rate" ||
              field === "gst_rate" ||
              field === "discount_rate" ||
              field === "discountRate" ||
              field === "discount_amount" ||
              field === "discountAmount"
            ) {

              if (
                isAggregateUnit(
                  updated.unit
                )
              ) {

                const result =
                  calculateAggregateLine(
                    updated
                  );


                updated.taxable_amount =
                  result.taxable;


                updated.total_amount =
                  result.total;


                updated.amount =
                  result.total;

              } else {

                const result =
                  calculateStandardLine(
                    updated
                  );


                updated.taxable_amount =
                  result.taxable;


                updated.total_amount =
                  result.total;


                updated.amount =
                  result.total;

              }

            }


            // --------------------------------------------------
            // Unit changed
            // --------------------------------------------------

            if (
              field === "unit"
            ) {

              const result =
                calculateLine(
                  updated
                );


              updated.taxable_amount =
                result.taxable;


              updated.total_amount =
                result.total;


              updated.amount =
                result.total;

            }


            return updated;
          }
        )
    );
  }


  // ==========================================================
  // TABLE DATA
  // ==========================================================

  const tableData =
    useMemo(() => {

      return products.map(
        product => {

          const calculation =
            calculateLine(
              product
            );


          return {

            ...product,

            key:
              product._rowId,


            calculatedTaxable:
              calculation.taxable,


            calculatedGst:
              calculation.gstAmount,


            calculatedTotal:
              calculation.total,


            // ------------------------------------------------
            // Display amount
            //
            // We use product.total_amount, which initially comes
            // from the backend invoice amount.
            //
            // After editing, updateProduct() changes it.
            // ------------------------------------------------

            displayAmount:
              product.total_amount,

          };
        }
      );

    }, [products]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

const summary =
  useMemo(() => {

    let subtotal = 0;
    let gst = 0;
    let total = 0;

    products.forEach(product => {

      const amount =
        Number(
          product.total_amount ?? 0
        );

      const gstRate =
        Number(
          product.gst_rate ??
          product.gstRate ??
          0
        );

      // ------------------------------------------------------
      // For aggregate UOM:
      //
      // total_amount is the invoice amount for the UOM.
      // Calculate GST from the amount according to the GST rate.
      //
      // Example:
      // taxable = ₹1000
      // GST 2.5% = ₹25
      // total = ₹1025
      // ------------------------------------------------------

      if (isAggregateUnit(product.unit)) {

        const gstAmount =
          amount *
          gstRate /
          100;

        subtotal += amount;

        gst += gstAmount;

        total +=
          amount + gstAmount;

        return;
      }

      // ------------------------------------------------------
      // Standard units
      // ------------------------------------------------------

      const result =
        calculateStandardLine(
          product
        );

      subtotal +=
        result.taxable;

      gst +=
        result.gstAmount;

      total +=
        result.total;

    });

    return {
      subtotal,
      gst,
      total,
    };

  }, [products]);

  // ==========================================================
  // DELETE SELECTED
  // ==========================================================

  const deleteSelected = () => {

    if (
      selectedRowKeys.length === 0
    ) {
      return;
    }


    setProducts(
      current =>
        current.filter(
          product =>
            !selectedRowKeys.includes(
              product._rowId
            )
        )
    );


    setSelectedRowKeys([]);

    setEditingKey(null);


    message.success(
      "Selected items removed"
    );
  };


  // ==========================================================
  // DELETE ONE
  // ==========================================================

  const deleteProduct = (
    key: any
  ) => {

    setProducts(
      current =>
        current.filter(
          product =>
            product._rowId !== key
        )
    );


    if (
      editingKey === key
    ) {

      setEditingKey(
        null
      );

    }


    setSelectedRowKeys(
      current =>
        current.filter(
          item =>
            item !== key
        )
    );

  };


  // ==========================================================
  // BULK EDIT
  // ==========================================================

  const [
    bulkField,
    setBulkField,
  ] = useState<
    | "hsn"
    | "quantity"
    | "unit"
    | "rate"
    | "mrp"
    | "gst_rate"
    | "description"
    | ""
  >("");


  const [
    bulkValue,
    setBulkValue,
  ] = useState<
    string | number | null
  >(null);


  const [
    editMode,
    setEditMode,
  ] = useState(false);


  const bulkFieldOptions = [
    {
      label: "HSN",
      value: "hsn",
    },
    {
      label: "Qty",
      value: "quantity",
    },
    {
      label: "Unit",
      value: "unit",
    },
    {
      label: "Purchase Rate",
      value: "rate",
    },
    {
      label: "MRP",
      value: "mrp",
    },
    {
      label: "GST %",
      value: "gst_rate",
    },
    {
      label: "Product",
      value: "description",
    },
  ];


  const applyBulkEdit = () => {

    if (
      selectedRowKeys.length === 0
    ) {

      message.warning(
        "Select at least one item."
      );

      return;
    }


    if (!bulkField) {

      message.warning(
        "Select a field to edit."
      );

      return;
    }


    if (
      bulkValue === null ||
      bulkValue === undefined ||
      (
        typeof bulkValue === "string" &&
        bulkValue.trim() === ""
      )
    ) {

      message.warning(
        "Enter a value."
      );

      return;
    }


    setProducts(
      current =>
        current.map(
          product => {

            if (
              !selectedRowKeys.includes(
                product._rowId
              )
            ) {

              return product;

            }


            const updated: ReviewProduct = {

              ...product,

              [bulkField]:
                bulkField ===
                  "quantity" ||
                bulkField ===
                  "rate" ||
                bulkField ===
                  "mrp" ||
                bulkField ===
                  "gst_rate"

                  ? Number(
                      bulkValue
                    )

                  : String(
                      bulkValue
                    ),

              _amountEdited:
                true,

            };


            // --------------------------------------------------
            // Recalculate only when commercial field changes.
            // --------------------------------------------------

            if (
              bulkField ===
                "quantity" ||
              bulkField ===
                "unit" ||
              bulkField ===
                "rate" ||
              bulkField ===
                "gst_rate"
            ) {

              const result =
                calculateLine(
                  updated
                );


              updated.taxable_amount =
                result.taxable;


              updated.total_amount =
                result.total;


              updated.amount =
                result.total;

            }


            return updated;
          }
        )
    );


    message.success(
      `${selectedRowKeys.length} item${
        selectedRowKeys.length > 1
          ? "s"
          : ""
      } updated`
    );


    setBulkValue(null);

  };


  // ==========================================================
  // BULK VALUE CONTROL
  // ==========================================================

  const bulkValueControl =
    (() => {

      if (
        bulkField ===
          "unit"
      ) {

        return (
          <Select
            value={
              bulkValue ??
              undefined
            }

            placeholder="Select unit"

            className="min-w-[150px]"

            showSearch

            allowClear

            options={[
              "PCS",
              "PC",
              "BOX",
              "PAC",
              "PKT",
              "PACK",
              "BAG",
              "BOTTLE",
              "BTL",
              "CAN",
              "CASE",
              "CTN",
              "KG",
              "G",
              "GM",
              "L",
              "LTR",
              "ML",
              "DOZ",
              "SET",
              "UNIT",
            ].map(
              unit => ({
                label: unit,
                value: unit,
              })
            )}

            onChange={
              value =>
                setBulkValue(
                  value ||
                  null
                )
            }
          />
        );

      }


      if (
        bulkField ===
          "description" ||
        bulkField ===
          "hsn"
      ) {

        return (
          <Input
            value={
              bulkValue == null
                ? ""
                : String(
                    bulkValue
                  )
            }

            placeholder={
              bulkField ===
              "hsn"
                ? "Enter HSN"
                : "Enter product"
            }

            className="min-w-[180px]"

            onChange={
              event =>
                setBulkValue(
                  event.target.value
                )
            }
          />
        );

      }


      return (
        <InputNumber
          value={
            typeof bulkValue ===
            "number"
              ? bulkValue
              : null
          }

          min={0}

          precision={
            bulkField ===
            "quantity"
              ? 3
              : 2
          }

          placeholder="Value"

          className="min-w-[140px]"

          onChange={
            value =>
              setBulkValue(
                value
              )
          }
        />
      );

    })();


  // ==========================================================
  // EDIT
  // ==========================================================

  const startEdit = (
    key: any
  ) => {

    setEditingKey(
      key
    );

  };


  const saveEdit = () => {

    setEditingKey(
      null
    );

  };


  // ==========================================================
  // SUPPLIER
  // ==========================================================

  const supplierOptions =
    useMemo(() => {

      if (
        !Array.isArray(
          suppliers
        )
      ) {
        return [];
      }


      return suppliers
        .filter(
          (
            supplier: any
          ) =>
            supplier?.isActive !==
            false
        )
        .map(
          (
            supplier: any
          ) => {

            const company =
              supplier.companyName;


            const name =
              supplier.name ||
              "Unnamed Supplier";


            const partyCode =
              supplier.partyCode ||
              "";


            return {

              value:
                supplier.id,

              label: (

                <div className="flex min-w-0 items-center justify-between gap-3">

                  <div className="min-w-0">

                    <div className="truncate font-medium text-slate-900">

                      {name}

                    </div>


                    {company && (

                      <div className="truncate text-xs text-slate-400">

                        {company}

                      </div>

                    )}

                  </div>


                  {partyCode && (

                    <Tag
                      color="orange"
                      className="mr-0"
                    >

                      {partyCode}

                    </Tag>

                  )}

                </div>

              ),

              supplier,

            };

          }
        );

    }, [suppliers]);


  const handleSupplierChange = (
    supplierId: any
  ) => {

    if (
      supplierId ===
      undefined ||
      supplierId === null
    ) {

      onSupplierChange(
        null
      );

      return;

    }


    const supplier =
      suppliers.find(
        (
          item: any
        ) =>
          String(
            item?.id
          ) ===
          String(
            supplierId
          )
      );


    onSupplierChange(
      supplier ||
      null
    );

  };


  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue = () => {

    // --------------------------------------------------------
    // SUPPLIER REQUIRED
    // --------------------------------------------------------

    if (!selectedSupplier) {

      message.error(
        "Please select a supplier before continuing."
      );

      return;

    }


    // --------------------------------------------------------
    // PARTY CODE REQUIRED
    // --------------------------------------------------------

    if (
      !selectedSupplier.partyCode?.trim()
    ) {

      message.error(
        `Supplier "${selectedSupplier.name}" does not have a party code.`
      );

      return;

    }


    // --------------------------------------------------------
    // PRODUCTS
    // --------------------------------------------------------

    const finalProducts =
      products.map(
        product => {

          // IMPORTANT:
          //
          // Do NOT recalculate every untouched row.
          //
          // The backend invoice amount is authoritative for the
          // initial review value.
          //
          // Edited rows already have total_amount updated by
          // updateProduct/applyBulkEdit.

          return {

            ...product,

            gst_rate:
              Number(
                product.gst_rate ??
                product.gstRate ??
                0
              ),

            taxable_amount:
              product.taxable_amount ??
              null,

            total_amount:
              product.total_amount ??
              null,

            amount:
              product.total_amount ??
              null,

          };

        }
      );


    onContinue(
      finalProducts
    );

  };


  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns:
    ColumnsType<any> =
    [

      // ------------------------------------------------------
      // #
      // ------------------------------------------------------

      {
        title: "#",

        width: 55,

        render: (
          _: any,
          __: any,
          index: number
        ) =>
          index + 1,
      },


      // ------------------------------------------------------
      // PRODUCT
      // ------------------------------------------------------

      {
        title: "Product",

        dataIndex:
          "description",

        width: 280,

        render: (
          _: any,
          record: any
        ) => {

          const name =
            record.description ||
            record.name ||
            record.item_name ||
            "—";


          const editing =
            editingKey ===
            record._rowId;


          return (

            <div>

              {editing &&
              editMode ? (

                <Input

                  value={
                    name
                  }

                  onChange={
                    e =>
                      updateProduct(
                        record._rowId,
                        "description",
                        e.target.value
                      )
                  }

                  size="small"

                />

              ) : (

                <div>

                  <div className="font-semibold text-slate-900">

                    {name}

                  </div>


                  {record.item_code && (

                    <div className="mt-1 text-xs text-slate-400">

                      {record.item_code}

                    </div>

                  )}

                </div>

              )}

            </div>

          );

        },

      },


      // ------------------------------------------------------
      // HSN
      // ------------------------------------------------------

      {
        title: "HSN",

        dataIndex:
          "hsn",

        width: 110,

        render: (
          value: any,
          record: any
        ) => {

          if (
            editingKey ===
            record._rowId
          ) {

            return (

              <Input

                size="small"

                value={
                  value ||
                  ""
                }

                onChange={
                  e =>
                    updateProduct(
                      record._rowId,
                      "hsn",
                      e.target.value
                    )
                }

              />

            );

          }


          return (

            <span className="text-slate-600">

              {value ||
                "—"}

            </span>

          );

        },

      },


      // ------------------------------------------------------
      // QTY
      // ------------------------------------------------------

      {
        title: "Qty",

        dataIndex:
          "quantity",

        width: 100,

        align: "right",

        render: (
          value: any,
          record: any
        ) => {

          if (
            editingKey ===
            record._rowId
          ) {

            return (

              <InputNumber

                size="small"

                min={0}

                value={
                  Number(
                    value ||
                    0
                  )
                }

                onChange={
                  v =>
                    updateProduct(
                      record._rowId,
                      "quantity",
                      Number(
                        v || 0
                      )
                    )
                }

                className="w-full"

              />

            );

          }


          return (

            <span>

              {value ??
                0}

              {record.unit && (

                <span className="ml-1 text-xs text-slate-400">

                  {record.unit}

                </span>

              )}

            </span>

          );

        },

      },


      // ------------------------------------------------------
      // UNIT
      // ------------------------------------------------------

      {
        title: "Unit",

        dataIndex:
          "unit",

        width: 110,

        render: (
          value: any,
          record: any
        ) => {

          if (
            editingKey ===
            record._rowId
          ) {

            return (

              <Select

                size="small"

                value={
                  value ||
                  undefined
                }

                className="w-full"

                showSearch

                allowClear

                options={[
                  "PCS",
                  "PC",
                  "BOX",
                  "PAC",
                  "PKT",
                  "PACK",
                  "BAG",
                  "BOTTLE",
                  "BTL",
                  "CAN",
                  "CASE",
                  "CTN",
                  "KG",
                  "G",
                  "GM",
                  "L",
                  "LTR",
                  "ML",
                  "DOZ",
                  "SET",
                  "UNIT",
                ].map(
                  unit => ({
                    label: unit,
                    value: unit,
                  })
                )}

                onChange={
                  unit =>
                    updateProduct(
                      record._rowId,
                      "unit",
                      unit ||
                      ""
                    )
                }

              />

            );

          }


          return (

            <span className="text-slate-600">

              {value ||
                "—"}

            </span>

          );

        },

      },


      // ------------------------------------------------------
      // PURCHASE RATE
      // ------------------------------------------------------

      {
        title:
          "Purchase Rate",

        dataIndex:
          "rate",

        width: 140,

        align: "right",

        render: (
          value: any,
          record: any
        ) => {

          if (
            editingKey ===
            record._rowId
          ) {

            return (

              <InputNumber

                size="small"

                min={0}

                precision={2}

                value={
                  Number(
                    value ||
                    0
                  )
                }

                onChange={
                  v =>
                    updateProduct(
                      record._rowId,
                      "rate",
                      Number(
                        v || 0
                      )
                    )
                }

                className="w-full"

              />

            );

          }


          return formatMoney(
            value
          );

        },

      },


      // ------------------------------------------------------
      // MRP
      // ------------------------------------------------------

      {
        title: "MRP",

        dataIndex:
          "mrp",

        width: 110,

        align: "right",

        render: (
          value: any,
          record: any
        ) => {

          if (
            editingKey ===
            record._rowId
          ) {

            return (

              <InputNumber

                size="small"

                min={0}

                precision={2}

                value={
                  Number(
                    value ||
                    0
                  )
                }

                onChange={
                  v =>
                    updateProduct(
                      record._rowId,
                      "mrp",
                      Number(
                        v || 0
                      )
                    )
                }

                className="w-full"

              />

            );

          }


          return formatMoney(
            value
          );

        },

      },


      // ------------------------------------------------------
      // GST
      // ------------------------------------------------------

      {
        title: "GST %",

        dataIndex:
          "gst_rate",

        width: 100,

        align: "right",

        render: (
          value: any,
          record: any
        ) => {

          if (
            editingKey ===
            record._rowId
          ) {

            return (

              <Select

                size="small"

                value={
                  Number(
                    value ||
                    0
                  )
                }

                className="w-full"

                options={[
                  {
                    label: "0%",
                    value: 0,
                  },
                  {
                    label: "5%",
                    value: 5,
                  },
                  {
                    label: "12%",
                    value: 12,
                  },
                  {
                    label: "18%",
                    value: 18,
                  },
                  {
                    label: "28%",
                    value: 28,
                  },
                ]}

                onChange={
                  v =>
                    updateProduct(
                      record._rowId,
                      "gst_rate",
                      Number(v)
                    )
                }

              />

            );

          }


          return (

            <Tag
              color="blue"
              className="mr-0"
            >

              {Number(
                value ||
                0
              )}

              %

            </Tag>

          );

        },

      },


      // ------------------------------------------------------
      // AMOUNT
      // ------------------------------------------------------

      {
        title: "Amount",

        width: 130,

        align: "right",

        render: (
          _: any,
          record: any
        ) => (

          <span className="font-semibold text-slate-900">

            {formatMoney(
              record.total_amount
            )}

          </span>

        ),

      },


      // ------------------------------------------------------
      // ACTION
      // ------------------------------------------------------

      {
        title: "Action",

        width: 110,

        fixed: "right",

        render: (
          _: any,
          record: any
        ) => {

          const editing =
            editingKey ===
            record._rowId;


          if (!editMode) {

            return null;

          }


          return (

            <Space size="small">

              {editing ? (

                <Button

                  type="primary"

                  size="small"

                  icon={
                    <CheckOutlined />
                  }

                  onClick={
                    saveEdit
                  }

                />

              ) : (

                <Button

                  size="small"

                  icon={
                    <EditOutlined />
                  }

                  onClick={() =>
                    startEdit(
                      record._rowId
                    )
                  }

                />

              )}


              <Popconfirm

                title="Delete this item?"

                onConfirm={() =>
                  deleteProduct(
                    record._rowId
                  )
                }

                okText="Delete"

                cancelText="Cancel"

              >

                <Button

                  danger

                  size="small"

                  icon={
                    <DeleteOutlined />
                  }

                />

              </Popconfirm>

            </Space>

          );

        },

      },

    ];


  // ==========================================================
  // CANONICAL DATA GUARD
  // ==========================================================

  if (
    !canonical ||
    canonicalLines.length === 0
  ) {

    return (

      <div className="space-y-4">

        <Alert

          type="warning"

          showIcon

          message="No canonical invoice items found"

          description="The backend did not return canonical invoice lines for this invoice."

        />


        <div className="flex justify-end">

          <Button
            onClick={
              onBack
            }
          >

            Back to invoices

          </Button>

        </div>

      </div>

    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-5">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <button

            onClick={
              onBack
            }

            className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-900"

          >

            ← Back to invoices

          </button>


          <h1 className="text-2xl font-bold text-slate-900">

            Review Invoice

          </h1>


          <p className="mt-1 text-sm text-slate-500">

            Select supplier and review invoice items before product mapping.

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


      {/* INVOICE SUMMARY */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <InfoCard
          title="Invoice Number"
          value={
            stringOf(
              canonical?.invoiceNumber
            ) || "—"
          }
        />


        <InfoCard
          title="Invoice Date"
          value={
            stringOf(
              canonical?.invoiceDate
            ) || "—"
          }
        />


        <InfoCard
          title="Invoice Supplier"
          value={
            stringOf(
              canonical?.supplier?.name
            ) || "—"
          }
        />


        <InfoCard
          title="GSTIN"
          value={
            stringOf(
              canonical?.supplier?.gstin
            ) || "—"
          }
        />

      </div>


      {/* SUPPLIER SELECTION */}

      <Card

        size="small"

        className="!rounded-2xl !border-slate-200"

        title={

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">

              <ShopOutlined />

            </div>


            <div>

              <div className="font-bold text-slate-900">

                Select Supplier

              </div>


              <div className="text-xs font-normal text-slate-500">

                Required for product mapping

              </div>

            </div>

          </div>

        }

      >

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">

          <div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">

              Supplier{" "}

              <span className="text-red-500">

                *

              </span>

            </label>


            <Select

              showSearch

              allowClear

              size="large"

              className="w-full"

              placeholder={
                loadingSuppliers
                  ? "Loading suppliers..."
                  : "Select supplier"
              }

              loading={
                loadingSuppliers
              }

              value={
                selectedSupplier?.id ??
                undefined
              }

              optionFilterProp="label"

              filterOption={(
                input,
                option
              ) => {

                const supplier =
                  (
                    option as any
                  )?.supplier;


                const search =
                  input
                    .toLowerCase()
                    .trim();


                if (
                  !supplier
                ) {

                  return true;

                }


                return [

                  supplier.name,

                  supplier.companyName,

                  supplier.partyCode,

                  supplier.mobile,

                  supplier.gstn,

                ]
                  .filter(Boolean)
                  .some(
                    (
                      value: any
                    ) =>
                      String(
                        value
                      )
                        .toLowerCase()
                        .includes(
                          search
                        )
                  );

              }}

              options={
                supplierOptions
              }

              onChange={
                handleSupplierChange
              }

              notFoundContent={
                loadingSuppliers
                  ? "Loading suppliers..."
                  : "No suppliers found"
              }

            />


            <p className="mt-2 text-xs text-slate-400">

              Search by supplier name, company, party code, mobile or GSTIN.

            </p>

          </div>


          {selectedSupplier ? (

            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4">

              <div className="mb-3 flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">

                    <UserOutlined />

                  </div>


                  <div className="min-w-0">

                    <div className="truncate font-bold text-slate-900">

                      {selectedSupplier.name ||
                        "Unnamed Supplier"}

                    </div>


                    {selectedSupplier.companyName && (

                      <div className="truncate text-xs text-slate-500">

                        {selectedSupplier.companyName}

                      </div>

                    )}

                  </div>

                </div>


                {selectedSupplier.partyCode ? (

                  <Tag
                    color="orange"
                    className="mr-0 shrink-0 font-semibold"
                  >

                    {selectedSupplier.partyCode}

                  </Tag>

                ) : (

                  <Tag
                    color="red"
                    className="mr-0 shrink-0"
                  >

                    No Party Code

                  </Tag>

                )}

              </div>


              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                {selectedSupplier.mobile && (

                  <SupplierDetail
                    icon={
                      <PhoneOutlined />
                    }
                    label="Mobile"
                    value={
                      selectedSupplier.mobile
                    }
                  />

                )}


                {selectedSupplier.email && (

                  <SupplierDetail
                    icon={
                      <MailOutlined />
                    }
                    label="Email"
                    value={
                      selectedSupplier.email
                    }
                  />

                )}


                {selectedSupplier.gstn && (

                  <SupplierDetail
                    icon={
                      <span className="text-[10px] font-bold">
                        GST
                      </span>
                    }
                    label="GSTIN"
                    value={
                      selectedSupplier.gstn
                    }
                  />

                )}


                {selectedSupplier.gstType && (

                  <SupplierDetail
                    icon={
                      <span className="text-[10px] font-bold">
                        TAX
                      </span>
                    }
                    label="GST Type"
                    value={
                      selectedSupplier.gstType
                    }
                  />

                )}

              </div>

            </div>

          ) : (

            <div className="flex items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">

              <div>

                <div className="font-semibold text-slate-700">

                  Supplier selection required

                </div>


                <div className="mt-1 text-xs text-slate-500">

                  Select the supplier whose party code should be used for product mapping.

                </div>

              </div>

            </div>

          )}

        </div>


        {selectedSupplier &&
          !selectedSupplier.partyCode && (

            <Alert

              className="mt-4"

              type="warning"

              showIcon

              message="This supplier cannot be used for product mapping"

              description="The selected supplier does not have a party code. Please select another supplier."

            />

          )}

      </Card>


      {/* TOOLBAR */}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <span className="text-sm font-semibold text-slate-800">

              {selectedRowKeys.length}

            </span>


            <span className="text-sm text-slate-500">

              selected

            </span>


            <Button

              size="small"

              icon={
                <EditOutlined />
              }

              type={
                editMode
                  ? "primary"
                  : "default"
              }

              onClick={() => {

                setEditMode(
                  current =>
                    !current
                );

                setEditingKey(
                  null
                );

              }}

            >

              {editMode
                ? "Editing"
                : "Edit"}

            </Button>

          </div>


          <Popconfirm

            title="Delete selected items?"

            description="The selected invoice items will be removed."

            onConfirm={
              deleteSelected
            }

            okText="Delete"

            cancelText="Cancel"

            disabled={
              selectedRowKeys.length ===
              0
            }

          >

            <Button

              danger

              icon={
                <DeleteOutlined />
              }

              disabled={
                selectedRowKeys.length ===
                0
              }

            >

              Delete Selected

            </Button>

          </Popconfirm>

        </div>


        {editMode && (

          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">

            <span className="text-xs font-semibold text-slate-500">

              Bulk Edit

            </span>


            <Select

              value={
                bulkField ||
                undefined
              }

              placeholder="Select field"

              className="min-w-[160px]"

              options={
                bulkFieldOptions
              }

              onChange={
                value => {

                  setBulkField(
                    value
                  );

                  setBulkValue(
                    null
                  );

                }
              }

            />


            {bulkField &&
              bulkValueControl}


            <Button

              type="primary"

              size="small"

              onClick={
                applyBulkEdit
              }

              disabled={
                selectedRowKeys.length ===
                  0 ||
                !bulkField
              }

            >

              Apply

            </Button>

          </div>

        )}

      </div>


      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

        <Table

          size="small"

          bordered

          loading={
            loading
          }

          columns={
            columns
          }

          dataSource={
            tableData
          }

          pagination={false}

          scroll={{
            x: 1380,
          }}

          rowSelection={{

            selectedRowKeys,

            onChange:
              setSelectedRowKeys,

          }}

        />

      </div>


      {/* SUMMARY */}

      <div className="ml-auto max-w-md rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">

        <h2 className="mb-4 text-base font-bold text-slate-900">

          Invoice Summary

        </h2>


        <SummaryRow

          label="Items"

          value={
            products.length
          }

        />


        <SummaryRow

          label="Subtotal"

          value={
            summary.subtotal
          }

        />


        <SummaryRow

          label="GST"

          value={
            summary.gst
          }

        />


        <div className="my-3 border-t border-slate-100" />


        <SummaryRow

          label="Grand Total"

          value={
            summary.total
          }

          bold

        />

      </div>


      {/* ACTION */}

      <div className="sticky bottom-3 z-10 flex justify-end rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur">

        <Button

          type="primary"

          size="large"

          loading={
            loading
          }

          disabled={
            products.length ===
              0 ||
            !selectedSupplier ||
            !selectedSupplier.partyCode?.trim()
          }

          onClick={
            handleContinue
          }

          className="!bg-orange-500"

        >

          Continue to Product Mapping →

        </Button>

      </div>

    </div>

  );
}


// ============================================================
// INFO CARD
// ============================================================

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


// ============================================================
// SUPPLIER DETAIL
// ============================================================

function SupplierDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {

  return (

    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-white/70 px-3 py-2">

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">

        {icon}

      </div>


      <div className="min-w-0">

        <div className="text-[10px] uppercase text-slate-400">

          {label}

        </div>


        <div className="truncate text-xs font-medium text-slate-700">

          {value}

        </div>

      </div>

    </div>

  );

}


// ============================================================
// SUMMARY ROW
// ============================================================

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

      className={[

        "flex justify-between gap-4 py-2",

        bold
          ? "text-lg font-bold text-slate-900"
          : "text-sm text-slate-600",

      ].join(" ")}

    >

      <span>

        {label}

      </span>


      <span>

        {typeof value === "number" &&
        label !== "Items"

          ? formatMoney(
              value
            )

          : value}

      </span>

    </div>

  );

}


// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(
  value: any
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "—";

  }


  const number =
    Number(value);


  if (
    Number.isNaN(
      number
    )
  ) {

    return String(
      value
    );

  }


  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(number);

}
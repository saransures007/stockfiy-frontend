import React, {
  useMemo,
  useState,
} from "react";

import {
  Table,
  InputNumber,
  Button,
  Space,
  Tag,
  Select,
  Input,
  Card,
  Divider,
  Typography,
  Tooltip,
  message,
} from "antd";

import type {
  ColumnsType,
} from "antd/es/table";

import {
  DeleteOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RightOutlined,
  LeftOutlined,
  DownOutlined,
} from "@ant-design/icons";

// ============================================================
// TYPES
// ============================================================

interface PurchaseReviewStepProps {
  invoice: any;

  mappingData: any;

  purchaseItems: any[];

  setPurchaseItems: (
    items: any[]
  ) => void;

  onBack: () => void;

  onContinue: () => void;
}

// ============================================================
// HELPERS
// ============================================================

const n = (
  value: any
): number => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const money = (
  value: any
): string => {
  return `₹${n(value).toFixed(2)}`;
};

const getStock = (
  item: any
): number => {
  if (
    item?.currentStock !== undefined &&
    item?.currentStock !== null
  ) {
    return n(
      item.currentStock
    );
  }

  if (
    item?.stock?.available !== undefined &&
    item?.stock?.available !== null
  ) {
    return n(
      item.stock.available
    );
  }

  if (
    item?.stock?.total !== undefined &&
    item?.stock?.total !== null
  ) {
    return n(
      item.stock.total
    );
  }

  if (
    item?.availableStockQty !== undefined &&
    item?.availableStockQty !== null
  ) {
    return n(
      item.availableStockQty
    );
  }

  if (
    item?.availableStock?.total !== undefined &&
    item?.availableStock?.total !== null
  ) {
    return n(
      item.availableStock.total
    );
  }

  if (
    item?.totalStock !== undefined &&
    item?.totalStock !== null
  ) {
    return n(
      item.totalStock
    );
  }

  return 0;
};

const getUnitId = (
  item: any
): number | null => {
  if (item?.unitId != null) {
    return n(item.unitId);
  }

  if (item?.unit?.id != null) {
    return n(item.unit.id);
  }

  return null;
};

const getUnitCode = (
  item: any
): string => {
  return (
    item?.unit?.code ||
    item?.unitCode ||
    "UNT"
  );
};

const getBatchId = (
  item: any
): number | null => {
  if (item?.batchId != null) {
    return n(item.batchId);
  }

  if (item?.primaryBatchId != null) {
    return n(
      item.primaryBatchId
    );
  }

  if (
    Array.isArray(item?.batches) &&
    item.batches.length > 0
  ) {
    return n(
      item.batches[0]?.id
    );
  }

  return null;
};

const getLocationId = (
  item: any
): number | null => {
  if (item?.locationId != null) {
    return n(item.locationId);
  }

  if (item?.mainLocationId != null) {
    return n(
      item.mainLocationId
    );
  }

  if (
    Array.isArray(item?.locations)
  ) {
    const location =
      item.locations[0];

    if (location?.id != null) {
      return n(location.id);
    }
  }

  return null;
};

const getBatchName = (
  item: any
): string => {
  if (item?.batchNumber) {
    return String(
      item.batchNumber
    );
  }

  if (item?.batch?.batchNumber) {
    return String(
      item.batch.batchNumber
    );
  }

  if (
    Array.isArray(item?.batches) &&
    item.batches.length
  ) {
    return String(
      item.batches[0]
        ?.batchNumber ||
      "Primary"
    );
  }

  return "Primary";
};

// ============================================================
// COMPONENT
// ============================================================

export default function PurchaseReviewStep({
  invoice,
  mappingData,
  purchaseItems,
  setPurchaseItems,
  onBack,
  onContinue,
}: PurchaseReviewStepProps) {

  // ==========================================================
  // SOURCE DATA
  // ==========================================================

  const detail =
    invoice?.data ||
    invoice?.invoice ||
    invoice ||
    {};

  const mapping =
    mappingData?.mapping ||
    {};

  const mappingItems =
    Array.isArray(mapping.items)
      ? mapping.items
      : [];

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    additionalOpen,
    setAdditionalOpen,
  ] = useState(false);

  const [
    selectedProductKeys,
    setSelectedProductKeys,
  ] = useState<React.Key[]>([]);

  const [
    billNumber,
    setBillNumber,
  ] = useState(
    detail?.voucherNumber ||
    detail?.billNumber ||
    ""
  );

  const [
    billDate,
    setBillDate,
  ] = useState(
    detail?.date ||
    new Date()
      .toISOString()
      .slice(0, 10)
  );

  const [
    mrnNumber,
    setMrnNumber,
  ] = useState(
    detail?.mrnNumber ||
    ""
  );

  const [
    dueDate,
    setDueDate,
  ] = useState(
    detail?.dueDate ||
    ""
  );

  // ==========================================================
  // PREPARE ITEMS
  // ==========================================================

  const preparedItems =
    useMemo(() => {

      return mappingItems.map(
        (
          row: any,
          index: number
        ) => {

          const invoiceProduct =
            row?.invoiceProduct ||
            {};

          const rowMapping =
            row?.mapping ||
            {};

          let mappedProducts =
            Array.isArray(
              rowMapping?.petpoojaItems
            )
              ? rowMapping.petpoojaItems
              : [];

          if (
            mappedProducts.length === 0 &&
            rowMapping?.petpoojaItem
          ) {
            mappedProducts = [
              rowMapping.petpoojaItem,
            ];
          }

          const lineNumber =
            invoiceProduct?.lineNumber ??
            row?.lineNumber ??
            index + 1;

          const existingRow =
            purchaseItems.find(
              (purchaseRow: any) =>
                String(
                  purchaseRow?.invoiceLineNumber ??
                  purchaseRow?.lineNumber ??
                  purchaseRow?.key
                ) ===
                String(lineNumber)
            );

          const existingProducts =
            Array.isArray(
              existingRow?.mappedProducts
            )
              ? existingRow.mappedProducts
              : [];

          const invoiceQuantity =
            n(
              invoiceProduct?.quantity
            );

          const invoiceRate =
            n(
              invoiceProduct?.rate
            );

          const invoiceMrp =
            n(
              invoiceProduct?.mrp
            );

          const products =
            mappedProducts.map(
              (
                product: any,
                productIndex: number
              ) => {

                const productId =
                  n(
                    product?.petpoojaItemId ??
                    product?.id
                  );

                const existingProduct =
                  existingProducts.find(
                    (p: any) =>
                      n(
                        p?.petpoojaItemId
                      ) ===
                      productId
                  );

                // ==================================================
                // QUANTITY
                //
                // Existing user edit wins.
                //
                // If exactly ONE mapped item:
                // invoice quantity becomes default.
                //
                // If multiple:
                // use mapping quantity.
                // ==================================================

                const quantity =
                  existingProduct?.quantity != null
                    ? n(
                        existingProduct.quantity
                      )
                    : mappedProducts.length === 1
                      ? invoiceQuantity
                      : n(
                          product?.quantity
                        );

                // ==================================================
                // PURCHASE RATE
                //
                // Existing user edit wins.
                //
                // Otherwise invoice rate is default.
                // ==================================================

                const purchaseRate =
                  existingProduct?.purchaseRate != null
                    ? n(
                        existingProduct.purchaseRate
                      )
                    : invoiceRate;

                // ==================================================
                // PETPOOJA PURCHASE RATE
                //
                // Used only for comparison UI.
                // ==================================================

                const petpoojaPurchaseRate =
                  n(
                    product?.purchaseRate ??
                    product?.purchase_price ??
                    product?.purchasePrice
                  );

                const discountType =
                  existingProduct?.discountType ||
                  "percentage";

                const discountRate =
                  n(
                    existingProduct?.discountRate
                  );

                const discountAmount =
                  n(
                    existingProduct?.discountAmount
                  );

                const currentStock =
                  existingProduct?.currentStock != null
                    ? n(
                        existingProduct.currentStock
                      )
                    : getStock(product);

                const stockAction =
                  existingProduct?.stockAction ||
                  "none";

                // Normal stock calculation.
                const stockAfterPurchase =
                  currentStock +
                  quantity;

                // When reset:
                //
                // existing stock → 0
                // purchase → +quantity
                //
                // final stock = quantity

                const stockAfterReset =
                  quantity;

                const batchId =
                  existingProduct?.batchId ??
                  getBatchId(product);

                const locationId =
                  existingProduct?.locationId ??
                  getLocationId(product);

                const unitId =
                  existingProduct?.unitId ??
                  getUnitId(product);

                return {

                  key:
                    `${lineNumber}-${productId}-${productIndex}`,

                  petpoojaItemId:
                    productId,

                  itemId:
                    productId,

                  itemCode:
                    product?.itemCode ||
                    product?.code ||
                    "",

                  itemName:
                    product?.itemName ||
                    product?.name ||
                    "",

                  description:
                    product?.description ||
                    "",

                  quantity,

                  purchaseRate,

                  // Keep Petpooja rate separately.
                  petpoojaPurchaseRate,

                  discountType,

                  discountRate,

                  discountAmount,

                  mrp:
                    n(
                      product?.mrp ??
                      invoiceMrp
                    ),

                  salesRate:
                    n(
                      product?.salesRate ??
                      product?.salesPrice
                    ),

                  unitId,

                  unitCode:
                    getUnitCode(product),

                  batchId,

                  batchNumber:
                    existingProduct?.batchNumber ||
                    getBatchName(product),

                  locationId,

                  currentStock,

                  stockAfterPurchase,

                  stockAfterReset,

                  stockAction,

                  stockAdjustment:
                    stockAction === "zero"
                      ? {
                          itemId:
                            productId,

                          batchId,

                          locationId,

                          existingQuantity:
                            currentStock,

                          newQuantityOnHand:
                            0,

                          adjustedQuantity:
                            currentStock,

                          unitId,

                          serialNumbers:
                            [],

                          serialNumberIds:
                            [],
                        }
                      : null,

                  petpoojaItem:
                    product,
                };
              }
            );

          // Preserve existing products that
          // may no longer exist in mapping response.

          const preservedProducts =
            existingProducts.filter(
              (
                existingProduct: any
              ) =>
                !products.some(
                  (
                    product: any
                  ) =>
                    n(
                      product.petpoojaItemId
                    ) ===
                    n(
                      existingProduct
                        .petpoojaItemId
                    )
                )
            );

          const allProducts = [
            ...products,
            ...preservedProducts,
          ];

          return {

            key:
              lineNumber,

            lineNumber,

            invoiceProduct,

            description:
              invoiceProduct?.description ||
              "",

            invoiceQuantity,

            invoiceRate,

            invoiceMrp,

            mappedProducts:
              allProducts,
          };
        }
      );

    }, [
      mappingItems,
      purchaseItems,
    ]);

  // ==========================================================
  // UPDATE PARENT STATE
  // ==========================================================

  const updateRows = (
    updatedRows: any[]
  ) => {
    setPurchaseItems(
      updatedRows
    );
  };

  // ==========================================================
  // UPDATE MAPPED PRODUCT
  // ==========================================================

  const updateMappedProduct = (
    rowKey: React.Key,
    productKey: React.Key,
    patch: any
  ) => {

    const updated =
      preparedItems.map(
        (row: any) => {

          if (
            row.key !== rowKey
          ) {
            return row;
          }

          return {

            ...row,

            mappedProducts:
              row.mappedProducts.map(
                (
                  product: any
                ) =>
                  product.key ===
                  productKey
                    ? {
                        ...product,
                        ...patch,
                      }
                    : product
              ),
          };
        }
      );

    updateRows(
      updated
    );
  };

  // ==========================================================
  // UPDATE QUANTITY
  // ==========================================================

  const updateQuantity = (
    rowKey: React.Key,
    productKey: React.Key,
    quantity: number
  ) => {

    const newQuantity =
      Math.max(
        0,
        n(quantity)
      );

    const row =
      preparedItems.find(
        (r: any) =>
          r.key === rowKey
      );

    const product =
      row?.mappedProducts?.find(
        (p: any) =>
          p.key === productKey
      );

    const currentStock =
      n(
        product?.currentStock
      );

    updateMappedProduct(
      rowKey,
      productKey,
      {
        quantity:
          newQuantity,

        stockAfterPurchase:
          currentStock +
          newQuantity,

        stockAfterReset:
          newQuantity,
      }
    );
  };

  // ==========================================================
  // UPDATE RATE
  // ==========================================================

  const updateRate = (
    rowKey: React.Key,
    productKey: React.Key,
    rate: number
  ) => {

    updateMappedProduct(
      rowKey,
      productKey,
      {
        purchaseRate:
          Math.max(
            0,
            n(rate)
          ),
      }
    );
  };

  // ==========================================================
  // STOCK ACTION
  // ==========================================================

  const updateStockAction = (
    rowKey: React.Key,
    productKey: React.Key,
    action:
      | "none"
      | "zero"
  ) => {

    const row =
      preparedItems.find(
        (r: any) =>
          r.key === rowKey
      );

    if (!row) {
      return;
    }

    const product =
      row.mappedProducts.find(
        (p: any) =>
          p.key === productKey
      );

    if (!product) {
      return;
    }

    const currentStock =
      n(
        product.currentStock
      );

    const quantity =
      n(
        product.quantity
      );

    if (
      action === "none"
    ) {

      updateMappedProduct(
        rowKey,
        productKey,
        {

          stockAction:
            "none",

          stockAdjustment:
            null,

          stockAfterPurchase:
            currentStock +
            quantity,

          stockAfterReset:
            quantity,
        }
      );

      return;
    }

    updateMappedProduct(
      rowKey,
      productKey,
      {

        stockAction:
          "zero",

        quantity,

        stockAfterPurchase:
          currentStock +
          quantity,

        stockAfterReset:
          quantity,

        stockAdjustment: {

          itemId:
            n(
              product.petpoojaItemId
            ),

          batchId:
            product.batchId ??
            null,

          locationId:
            product.locationId ??
            null,

          existingQuantity:
            currentStock,

          newQuantityOnHand:
            0,

          adjustedQuantity:
            currentStock,

          unitId:
            product.unitId ??
            null,

          serialNumbers:
            [],

          serialNumberIds:
            [],
        },
      }
    );
  };

  // ==========================================================
  // DISCOUNT
  // ==========================================================

  const updateDiscount = (
    rowKey: React.Key,
    productKey: React.Key,
    type:
      | "percentage"
      | "amount",
    value: number
  ) => {

    const updated =
      preparedItems.map(
        (row: any) => {

          if (
            row.key !== rowKey
          ) {
            return row;
          }

          return {

            ...row,

            mappedProducts:
              row.mappedProducts.map(
                (
                  product: any
                ) => {

                  if (
                    product.key !==
                    productKey
                  ) {
                    return product;
                  }

                  const gross =
                    n(
                      product.quantity
                    ) *
                    n(
                      product.purchaseRate
                    );

                  if (
                    type ===
                    "percentage"
                  ) {

                    const discountRate =
                      Math.min(
                        100,
                        Math.max(
                          0,
                          n(value)
                        )
                      );

                    return {

                      ...product,

                      discountType:
                        "percentage",

                      discountRate,

                      discountAmount:
                        gross *
                        discountRate /
                        100,
                    };
                  }

                  const discountAmount =
                    Math.min(
                      gross,
                      Math.max(
                        0,
                        n(value)
                      )
                    );

                  return {

                    ...product,

                    discountType:
                      "amount",

                    discountRate:
                      0,

                    discountAmount,
                  };
                }
              ),
          };
        }
      );

    updateRows(
      updated
    );
  };

  const zeroDiscount = (
    rowKey: React.Key,
    productKey: React.Key
  ) => {

    updateDiscount(
      rowKey,
      productKey,
      "percentage",
      0
    );
  };

  // ==========================================================
  // CALCULATE ROWS
  // ==========================================================

  const calculatedRows =
    useMemo(() => {

      return preparedItems.map(
        (row: any) => {

          const mappedProducts =
            row.mappedProducts.map(
              (product: any) => {

                const gross =
                  n(
                    product.quantity
                  ) *
                  n(
                    product.purchaseRate
                  );

                let discountAmount =
                  0;

                if (
                  product.discountType ===
                  "percentage"
                ) {

                  discountAmount =
                    gross *
                    Math.min(
                      100,
                      Math.max(
                        0,
                        n(
                          product.discountRate
                        )
                      )
                    ) /
                    100;

                } else {

                  discountAmount =
                    Math.min(
                      gross,
                      Math.max(
                        0,
                        n(
                          product.discountAmount
                        )
                      )
                    );
                }

                const lineTotal =
                  gross -
                  discountAmount;

                return {

                  ...product,

                  gross,

                  discountAmount,

                  allocatedDiscount:
                    discountAmount,

                  lineTotal,
                };
              }
            );

          const gross =
            mappedProducts.reduce(
              (
                total: number,
                product: any
              ) =>
                total +
                n(
                  product.gross
                ),
              0
            );

          const discountAmount =
            mappedProducts.reduce(
              (
                total: number,
                product: any
              ) =>
                total +
                n(
                  product.discountAmount
                ),
              0
            );

          return {

            ...row,

            gross,

            discountAmount,

            net:
              gross -
              discountAmount,

            mappedProducts,
          };
        }
      );

    }, [
      preparedItems,
    ]);

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validationRows =
    calculatedRows.map(
      (row: any) => {

        const mappedQuantity =
          row.mappedProducts.reduce(
            (
              total: number,
              product: any
            ) =>
              total +
              n(
                product.quantity
              ),
            0
          );

        const invoiceQuantity =
          n(
            row.invoiceQuantity
          );

        return {

          ...row,

          mappedQuantity,

          valid:
            Math.abs(
              mappedQuantity -
              invoiceQuantity
            ) < 0.0001,
        };
      }
    );

  const invalidRows =
    validationRows.filter(
      (row: any) =>
        !row.valid
    );

  // ==========================================================
  // TOTALS
  // ==========================================================

  const subtotal =
    calculatedRows.reduce(
      (
        total: number,
        row: any
      ) =>
        total +
        n(
          row.gross
        ),
      0
    );

  const totalDiscount =
    calculatedRows.reduce(
      (
        total: number,
        row: any
      ) =>
        total +
        n(
          row.discountAmount
        ),
      0
    );

  const taxableAmount =
    subtotal -
    totalDiscount;

  const tax = 0;

  const expenseCharge = 0;

  const roundOff = 0;

  const total =
    taxableAmount +
    tax +
    expenseCharge +
    roundOff;

  // ==========================================================
  // STOCK ADJUSTMENTS
  //
  // IMPORTANT:
  // Only selected "zero" products.
  //
  // No API call here.
  // ==========================================================

  const stockAdjustments =
    calculatedRows.flatMap(
      (row: any) =>
        row.mappedProducts
          .filter(
            (product: any) =>
              product.stockAction ===
              "zero"
          )
          .map(
            (product: any) => {

              const adjustment =
                product.stockAdjustment;

              if (!adjustment) {
                return null;
              }

              return {

                itemId:
                  n(
                    product.petpoojaItemId
                  ),

                batchId:
                  product.batchId ??
                  null,

                locationId:
                  product.locationId ??
                  null,

                existingQuantity:
                  n(
                    adjustment.existingQuantity
                  ),

                newQuantityOnHand:
                  0,

                adjustedQuantity:
                  n(
                    adjustment.adjustedQuantity
                  ),

                unitId:
                  product.unitId ??
                  null,

                serialNumbers:
                  [],

                serialNumberIds:
                  [],
              };
            }
          )
    ).filter(Boolean);

  // ==========================================================
  // BUILD FINAL PURCHASE ITEMS
  // ==========================================================

  const buildFinalPurchaseItems =
    () => {

      return calculatedRows.map(
        (row: any) => ({

          key:
            row.key,

          lineNumber:
            row.lineNumber,

          invoiceProduct:
            row.invoiceProduct,

          description:
            row.description,

          invoiceQuantity:
            row.invoiceQuantity,

          invoiceRate:
            row.invoiceRate,

          mappedQuantity:
            row.mappedQuantity,

          valid:
            row.valid,

          discountAmount:
            n(
              row.discountAmount
            ),

          gross:
            n(
              row.gross
            ),

          net:
            n(
              row.net
            ),

          mappedProducts:
            row.mappedProducts.map(
              (product: any) => ({

                ...product,

                quantity:
                  n(
                    product.quantity
                  ),

                purchaseRate:
                  n(
                    product.purchaseRate
                  ),

                petpoojaPurchaseRate:
                  n(
                    product.petpoojaPurchaseRate
                  ),

                gross:
                  n(
                    product.gross
                  ),

                allocatedDiscount:
                  n(
                    product.allocatedDiscount
                  ),

                lineTotal:
                  n(
                    product.lineTotal
                  ),

                discountType:
                  product.discountType ||
                  "percentage",

                discountRate:
                  n(
                    product.discountRate
                  ),

                discountAmount:
                  n(
                    product.discountAmount
                  ),

                currentStock:
                  n(
                    product.currentStock
                  ),

                stockAfterPurchase:
                  n(
                    product.stockAfterPurchase
                  ),

                stockAfterReset:
                  n(
                    product.stockAfterReset
                  ),

                stockAction:
                  product.stockAction ||
                  "none",

                stockAdjustment:
                  product.stockAdjustment ||
                  null,
              })
            ),
        })
      );
    };

  // ==========================================================
  // CONTINUE
  //
  // NO STOCK API CALL.
  // ==========================================================

  const handleContinue =
    () => {

      if (
        !billNumber.trim()
      ) {

        message.error(
          "Bill number is required"
        );

        return;
      }

      if (!billDate) {

        message.error(
          "Bill date is required"
        );

        return;
      }

      if (
        calculatedRows.length ===
        0
      ) {

        message.error(
          "No mapped purchase items"
        );

        return;
      }

      if (
        invalidRows.length >
        0
      ) {

        message.error(
          "Mapped quantities must exactly match invoice quantities"
        );

        return;
      }

      const finalItems =
        buildFinalPurchaseItems();

      setPurchaseItems(
        finalItems
      );

      console.log(
        "PURCHASE REVIEW",
        {
          billNumber,
          billDate,
          mrnNumber,
          dueDate,
          stockAdjustments,
          items:
            finalItems,
        }
      );

      onContinue();
    };

    const hasMultiMapping = calculatedRows.some(
  (row: any) =>
    (row.mappedProducts || []).length > 1
);
  // ==========================================================
  // MAPPED PRODUCT CELL
  // ==========================================================

  const renderMappedProduct =
    (
      product: any,
      row: any
    ) => {

      const rateDifferent =
        product.petpoojaPurchaseRate >
          0 &&
        Math.abs(
          product.petpoojaPurchaseRate -
          product.purchaseRate
        ) > 0.0001;

      return (

        <div className="space-y-1">

          <div className="flex items-center gap-1.5">

            <ShoppingCartOutlined
              className="text-blue-500"
            />

            <Typography.Text
              strong
              ellipsis
              className="!text-xs"
            >
              {product.itemCode
                ? `${product.itemCode} · `
                : ""}
              {product.itemName || "-"}
            </Typography.Text>

          </div>

          <div className="flex items-center gap-1 flex-wrap">

            <Tag
              bordered={false}
              className="!m-0 !px-1.5 !py-0 !text-[10px]"
            >
              {product.unitCode || "UNT"}
            </Tag>

            <Typography.Text
              type="secondary"
              className="!text-[10px]"
            >
              Batch:{" "}
              {product.batchNumber ||
                "Primary"}
            </Typography.Text>

          </div>

          {rateDifferent && (

            <Typography.Text
              type="warning"
              className="!text-[10px]"
            >
              Petpooja price{" "}
              {money(
                product.petpoojaPurchaseRate
              )}
            </Typography.Text>

          )}

        </div>
      );
    };

  // ==========================================================
  // MAPPED PRODUCT TABLE
  // ==========================================================

  const mappedColumns:
    ColumnsType<any> = [

      {
        title: "Mapped Item",
        key: "item",
        width: 220,

        render:
          (
            _: any,
            product: any,
            index: number
          ) => {

            const parent =
              calculatedRows.find(
                (row: any) =>
                  row.mappedProducts.some(
                    (p: any) =>
                      p.key ===
                      product.key
                  )
              );

            return (
              <div className="py-0.5">
                {renderMappedProduct(
                  product,
                  parent
                )}
              </div>
            );
          },
      },

      {
        title: "Qty",
        key: "quantity",
        width: 90,

        render:
          (
            _: any,
            product: any
          ) => {

            const parent =
              calculatedRows.find(
                (row: any) =>
                  row.mappedProducts.some(
                    (p: any) =>
                      p.key ===
                      product.key
                  )
              );

            return (

              <InputNumber
                size="small"
                min={0}
                precision={2}
                className="!w-[72px]"
                value={
                  product.quantity
                }
                onChange={
                  value =>
                    updateQuantity(
                      parent?.key,
                      product.key,
                      n(value)
                    )
                }
              />

            );
          },
      },

      {
        title: "Purchase",
        key: "rate",
        width: 125,

        render:
          (
            _: any,
            product: any
          ) => {

            const parent =
              calculatedRows.find(
                (row: any) =>
                  row.mappedProducts.some(
                    (p: any) =>
                      p.key ===
                      product.key
                  )
              );

            const rateDifferent =
              product.petpoojaPurchaseRate >
                0 &&
              Math.abs(
                product.petpoojaPurchaseRate -
                product.purchaseRate
              ) > 0.0001;

            return (

              <div>

                <InputNumber
                  size="small"
                  min={0}
                  precision={2}
                  prefix="₹"
                  className="!w-[105px]"
                  value={
                    product.purchaseRate
                  }
                  onChange={
                    value =>
                      updateRate(
                        parent?.key,
                        product.key,
                        n(value)
                      )
                  }
                />

                {rateDifferent && (

                  <div className="mt-0.5 text-[10px] text-orange-500">
                    Petpooja{" "}
                    {money(
                      product.petpoojaPurchaseRate
                    )}
                  </div>

                )}

              </div>

            );
          },
      },

      {
        title: "Discount",
        key: "discount",
        width: 165,

        render:
          (
            _: any,
            product: any
          ) => {

            const parent =
              calculatedRows.find(
                (row: any) =>
                  row.mappedProducts.some(
                    (p: any) =>
                      p.key ===
                      product.key
                  )
              );

            const type =
              product.discountType ||
              "percentage";

            return (

              <Space.Compact>

                <Select
                  size="small"
                  value={type}
                  className="!w-[52px]"
                  onChange={
                    discountType =>
                      updateDiscount(
                        parent?.key,
                        product.key,
                        discountType,
                        discountType ===
                        "percentage"
                          ? n(
                              product.discountRate
                            )
                          : n(
                              product.discountAmount
                            )
                      )
                  }
                  options={[
                    {
                      value:
                        "percentage",
                      label: "%",
                    },
                    {
                      value:
                        "amount",
                      label: "₹",
                    },
                  ]}
                />

                <InputNumber
                  size="small"
                  min={0}
                  max={
                    type ===
                    "percentage"
                      ? 100
                      : n(
                          product.gross
                        )
                  }
                  precision={2}
                  className="!w-[65px]"
                  value={
                    type ===
                    "percentage"
                      ? n(
                          product.discountRate
                        )
                      : n(
                          product.discountAmount
                        )
                  }
                  onChange={
                    value =>
                      updateDiscount(
                        parent?.key,
                        product.key,
                        type,
                        n(value)
                      )
                  }
                />

                <Tooltip title="Zero discount">

                  <Button
                    size="small"
                    onClick={() =>
                      zeroDiscount(
                        parent?.key,
                        product.key
                      )
                    }
                  >
                    0
                  </Button>

                </Tooltip>

              </Space.Compact>

            );
          },
      },

      {
        title: "Discount",
        key: "discountValue",
        width: 95,

        render:
          (
            _: any,
            product: any
          ) => (

            <Typography.Text
              type="danger"
              className="!text-xs"
            >
              - {money(
                product.discountAmount
              )}
            </Typography.Text>

          ),
      },

      {
        title: "Value",
        key: "value",
        width: 110,

        render:
          (
            _: any,
            product: any
          ) => (

            <Typography.Text
              strong
              className="!text-xs"
            >
              {money(
                product.lineTotal
              )}
            </Typography.Text>

          ),
      },

      {
        title: "Stock",
        key: "stock",
        width: 170,

        render:
          (
            _: any,
            product: any
          ) => {

            const isZero =
              product.stockAction ===
              "zero";

            return (

              <div className="leading-tight">

                <div className="flex items-center gap-1">

                  <Typography.Text
                    type="secondary"
                    className="!text-[10px]"
                  >
                    Before
                  </Typography.Text>

                  <Tag
                    color={
                      product.currentStock < 0
                        ? "red"
                        : undefined
                    }
                    className="!m-0 !px-1.5 !py-0 !text-[10px]"
                  >
                    {product.currentStock}
                  </Tag>

                  <Typography.Text
                    type="secondary"
                    className="!text-[10px]"
                  >
                    →
                  </Typography.Text>

                  <Tag
                    color={
                      isZero
                        ? "green"
                        : undefined
                    }
                    className="!m-0 !px-1.5 !py-0 !text-[10px]"
                  >
                    {isZero
                      ? product.stockAfterReset
                      : product.stockAfterPurchase}
                  </Tag>

                </div>

                {isZero && (

                  <Typography.Text
                    type="success"
                    className="!text-[10px]"
                  >
                    Reset → 0, then +
                    {product.quantity}
                  </Typography.Text>

                )}

              </div>

            );
          },
      },

      {
        title: "Stock Action",
        key: "stockAction",
        width: 145,

        render:
          (
            _: any,
            product: any
          ) => {

            const parent =
              calculatedRows.find(
                (row: any) =>
                  row.mappedProducts.some(
                    (p: any) =>
                      p.key ===
                      product.key
                  )
              );

            return (

              <Select
                size="small"
                className="!w-[135px]"
                value={
                  product.stockAction ||
                  "none"
                }
                onChange={
                  value =>
                    updateStockAction(
                      parent?.key,
                      product.key,
                      value
                    )
                }
                options={[
                  {
                    value: "none",
                    label: "No Action",
                  },
                  {
                    value: "zero",
                    label: "Mark Stock Zero",
                  },
                ]}
              />

            );
          },
      },

      {
        title: "",
        key: "action",
        width: 45,
        fixed: "right",

        render:
          (
            _: any,
            product: any
          ) => {

            const parent =
              calculatedRows.find(
                (row: any) =>
                  row.mappedProducts.some(
                    (p: any) =>
                      p.key ===
                      product.key
                  )
              );

            return (

              <Tooltip title="Remove">

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={
                    <DeleteOutlined />
                  }
                  onClick={() => {

                    if (!parent) {
                      return;
                    }

                    const updated =
                      preparedItems.map(
                        (row: any) => {

                          if (
                            row.key !==
                            parent.key
                          ) {
                            return row;
                          }

                          return {

                            ...row,

                            mappedProducts:
                              row.mappedProducts.filter(
                                (p: any) =>
                                  p.key !==
                                  product.key
                              ),
                          };
                        }
                      );

                    updateRows(
                      updated
                    );
                  }}
                />

              </Tooltip>

            );
          },
      },
    ];

  // ==========================================================
  // INVOICE TABLE
  //
  // ONE MAPPING:
  // directly displayed.
  //
  // MULTIPLE MAPPINGS:
  // expandable.
  // ==========================================================

const invoiceColumns: ColumnsType<any> = [
  {
    title: "#",
    width: 40,
    render: (
      _: any,
      __: any,
      index: number
    ) => index + 1,
  },

  {
    title: "Invoice",
    key: "invoiceItem",
    width: 280,
    render: (
      _: any,
      row: any
    ) => (
      <div className="min-w-0">
        <Typography.Text
          strong
          ellipsis
          className="!text-xs"
        >
          {row.description || "-"}
        </Typography.Text>

        <div className="flex gap-1">
          <Typography.Text
            type="secondary"
            className="!text-[10px]"
          >
            Qty {row.invoiceQuantity}
          </Typography.Text>

          <span className="text-slate-300">
            ·
          </span>

          <Typography.Text
            type="secondary"
            className="!text-[10px]"
          >
            {money(row.invoiceRate)}
          </Typography.Text>
        </div>
      </div>
    ),
  },

  {
    title: "Mapped Item",
    key: "mappedItem",
    width: 240,
    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (products.length === 0) {
        return (
          <Tag
            color="red"
            className="!m-0 !text-[10px]"
          >
            Unmapped
          </Tag>
        );
      }

      if (products.length === 1) {
        return renderMappedProduct(
          products[0],
          row
        );
      }

      return (
        <Tag
          color="blue"
          className="!m-0 !text-[10px]"
        >
          {products.length} mapped
        </Tag>
      );
    },
  },

  // =====================================================
  // ONLY SHOW THESE COLUMNS WHEN THE INVOICE IS SINGLE
  // MAPPED
  // =====================================================

  {
    title: "Qty",
    key: "quantity",
    width: 85,

    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (products.length !== 1) {
        return null;
      }

      const product =
        products[0];

      return (
        <InputNumber
          size="small"
          min={0}
          precision={2}
          className="!w-[68px]"
          value={
            product.quantity
          }
          onChange={
            value =>
              updateQuantity(
                row.key,
                product.key,
                n(value)
              )
          }
        />
      );
    },
  },

  {
    title: "Purchase",
    key: "purchase",
    width: 120,

    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (products.length !== 1) {
        return null;
      }

      const product =
        products[0];

      return (
        <InputNumber
          size="small"
          min={0}
          precision={2}
          prefix="₹"
          className="!w-[100px]"
          value={
            product.purchaseRate
          }
          onChange={
            value =>
              updateRate(
                row.key,
                product.key,
                n(value)
              )
          }
        />
      );
    },
  },

  {
    title: "Discount",
    key: "discount",
    width: 150,

    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (products.length !== 1) {
        return null;
      }

      const product =
        products[0];

      const type =
        product.discountType ||
        "percentage";

      return (
        <Space.Compact>

          <Select
            size="small"
            value={type}
            className="!w-[48px]"
            options={[
              {
                value: "percentage",
                label: "%",
              },
              {
                value: "amount",
                label: "₹",
              },
            ]}
            onChange={
              discountType =>
                updateDiscount(
                  row.key,
                  product.key,
                  discountType,
                  discountType ===
                  "percentage"
                    ? n(
                        product.discountRate
                      )
                    : n(
                        product.discountAmount
                      )
                )
            }
          />

          <InputNumber
            size="small"
            min={0}
            precision={2}
            className="!w-[65px]"
            value={
              type === "percentage"
                ? n(
                    product.discountRate
                  )
                : n(
                    product.discountAmount
                  )
            }
            onChange={
              value =>
                updateDiscount(
                  row.key,
                  product.key,
                  type,
                  n(value)
                )
            }
          />

        </Space.Compact>
      );
    },
  },

  // =====================================================
  // VALUE
  // =====================================================

  {
    title: "Value",
    key: "invoiceValue",
    width: 110,

    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (
        products.length === 0
      ) {
        return "—";
      }

      const value =
        products.reduce(
          (
            sum: number,
            product: any
          ) =>
            sum +
            n(product.lineTotal),
          0
        );

      return (
        <Typography.Text
          strong
          className="!text-xs"
        >
          {money(value)}
        </Typography.Text>
      );
    },
  },

  // =====================================================
  // STOCK
  // =====================================================

  {
    title: "Stock",
    key: "stock",
    width: 160,

    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (products.length !== 1) {
        return null;
      }

      const product =
        products[0];

      const isZero =
        product.stockAction ===
        "zero";

      return (
        <div className="leading-tight">

          <div className="flex gap-1">

            <Typography.Text
              type="secondary"
              className="!text-[10px]"
            >
              {product.currentStock}
            </Typography.Text>

            <span>→</span>

            <Tag
              color={
                isZero
                  ? "green"
                  : undefined
              }
              className="!m-0 !text-[10px]"
            >
              {isZero
                ? product.stockAfterReset
                : product.stockAfterPurchase}
            </Tag>

          </div>

        </div>
      );
    },
  },

  // =====================================================
  // ACTION
  // =====================================================

  {
    title: "Action",
    key: "stockAction",
    width: 130,

    render: (
      _: any,
      row: any
    ) => {
      const products =
        row.mappedProducts || [];

      if (products.length !== 1) {
        return null;
      }

      const product =
        products[0];

      return (
        <Select
          size="small"
          className="!w-[125px]"
          value={
            product.stockAction ||
            "none"
          }
          options={[
            {
              value: "none",
              label: "No Action",
            },
            {
              value: "zero",
              label: "Mark Stock Zero",
            },
          ]}
          onChange={
            value =>
              updateStockAction(
                row.key,
                product.key,
                value
              )
          }
        />
      );
    },
  },
];

  // ==========================================================
  // STOCK RESET COUNT
  // ==========================================================

  const stockResetCount =
    calculatedRows.reduce(
      (
        count: number,
        row: any
      ) =>
        count +
        row.mappedProducts.filter(
          (product: any) =>
            product.stockAction ===
            "zero"
        ).length,
      0
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        space-y-2
        pb-4
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Card
        size="small"
        styles={{
          body: {
            padding: "10px 12px",
          },
        }}
      >

        <div
          className="
            flex
            flex-col
            gap-2
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div>

            <Typography.Title
              level={4}
              className="!mb-0"
            >
              Purchase Review
            </Typography.Title>

            <Typography.Text
              type="secondary"
              className="!text-xs"
            >
              Review quantity, purchase price,
              discount and stock reset.
            </Typography.Text>

          </div>

          <Space
            size={4}
            wrap
          >

            <Tag
              color="blue"
              className="!m-0"
            >
              {calculatedRows.length}
              {" "}Invoice
            </Tag>

            <Tag
              color="green"
              className="!m-0"
            >
              {
                calculatedRows.reduce(
                  (
                    total: number,
                    row: any
                  ) =>
                    total +
                    row.mappedProducts
                      .length,
                  0
                )
              } Mapped
            </Tag>

            {stockResetCount >
              0 && (

              <Tag
                color="orange"
                className="!m-0"
              >
                {stockResetCount}
                {" "}Stock Reset
              </Tag>

            )}

          </Space>

        </div>

      </Card>

      {/* ======================================================
          BILL DETAILS
      ====================================================== */}

      <Card
        size="small"
        styles={{
          body: {
            padding: "10px 12px",
          },
        }}
      >

        <div
          className="
            grid
            grid-cols-2
            gap-2
            md:grid-cols-5
          "
        >

          <div>

            <Typography.Text
              type="secondary"
              className="block !text-[10px]"
            >
              Party Name
            </Typography.Text>

            <Input
              size="small"
              disabled
              value={
                mappingData?.supplier
                  ?.name ||
                detail?.supplier
                  ?.name ||
                ""
              }
            />

          </div>

          <div>

            <Typography.Text
              type="secondary"
              className="block !text-[10px]"
            >
              Bill No. *
            </Typography.Text>

            <Input
              size="small"
              value={
                billNumber
              }
              onChange={
                e =>
                  setBillNumber(
                    e.target.value
                  )
              }
            />

          </div>

          <div>

            <Typography.Text
              type="secondary"
              className="block !text-[10px]"
            >
              MRN No.
            </Typography.Text>

            <Input
              size="small"
              value={
                mrnNumber
              }
              onChange={
                e =>
                  setMrnNumber(
                    e.target.value
                  )
              }
            />

          </div>

          <div>

            <Typography.Text
              type="secondary"
              className="block !text-[10px]"
            >
              Date *
            </Typography.Text>

            <Input
              size="small"
              type="date"
              value={
                billDate
              }
              onChange={
                e =>
                  setBillDate(
                    e.target.value
                  )
              }
            />

          </div>

          <div>

            <Typography.Text
              type="secondary"
              className="block !text-[10px]"
            >
              Due Date
            </Typography.Text>

            <Input
              size="small"
              type="date"
              value={
                dueDate
              }
              onChange={
                e =>
                  setDueDate(
                    e.target.value
                  )
              }
            />

          </div>

        </div>

      </Card>

      {/* ======================================================
          ADDITIONAL FIELDS
      ====================================================== */}

      <Card
        size="small"
        styles={{
          body: {
            padding: "4px 10px",
          },
        }}
      >

        <Button
          type="text"
          block
          className="
            !flex
            !items-center
            !justify-between
            !text-xs
          "
          onClick={() =>
            setAdditionalOpen(
              value =>
                !value
            )
          }
        >

          <span>
            Additional Fields
          </span>

          {
            additionalOpen
              ? <DownOutlined />
              : <RightOutlined />
          }

        </Button>

        {additionalOpen && (

          <div
            className="
              mt-2
              grid
              grid-cols-2
              gap-2
              md:grid-cols-4
            "
          >

            <div>

              <Typography.Text
                type="secondary"
                className="!text-[10px]"
              >
                Source of Supply
              </Typography.Text>

              <InputNumber
                size="small"
                className="!w-full"
                value={
                  detail?.sourceOfSupplyId ??
                  33
                }
                disabled
              />

            </div>

            <div>

              <Typography.Text
                type="secondary"
                className="!text-[10px]"
              >
                Destination of Supply
              </Typography.Text>

              <InputNumber
                size="small"
                className="!w-full"
                value={
                  detail?.destinationOfSupplyId ??
                  33
                }
                disabled
              />

            </div>

            <div>

              <Typography.Text
                type="secondary"
                className="!text-[10px]"
              >
                Billing Address
              </Typography.Text>

              <InputNumber
                size="small"
                className="!w-full"
                value={
                  detail?.billingAddressId ??
                  undefined
                }
                disabled
              />

            </div>

            <div>

              <Typography.Text
                type="secondary"
                className="!text-[10px]"
              >
                Template
              </Typography.Text>

              <InputNumber
                size="small"
                className="!w-full"
                value={
                  detail?.templateId ??
                  undefined
                }
                disabled
              />

            </div>

          </div>

        )}

      </Card>

      {/* ======================================================
          STOCK INFORMATION
      ====================================================== */}

      <Card
        size="small"
        className="
          !border-blue-200
          !bg-blue-50
        "
        styles={{
          body: {
            padding: "8px 10px",
          },
        }}
      >

        <div
          className="
            flex
            items-start
            gap-2
          "
        >

          <CheckCircleOutlined
            className="
              mt-0.5
              !text-blue-600
            "
          />

          <div>

            <Typography.Text
              strong
              className="!text-xs"
            >
              Stock reset is optional
            </Typography.Text>

            <div
              className="
                mt-0.5
                text-[10px]
                text-slate-600
              "
            >

              Purchase quantity never changes
              because of stock reset.

              {" "}

              Example:

              {" "}

              Stock -6 + Purchase 7
              = 1 normally.

              {" "}

              If reset is selected:

              {" "}

              -6 → 0 → +7 = 7.

            </div>

          </div>

        </div>

      </Card>

      {/* ======================================================
          INVOICE ITEMS
      ====================================================== */}

      <Card
        size="small"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >

        <Table
          rowKey="key"

          size="small"

          bordered

          columns={
            invoiceColumns
          }

          dataSource={
            validationRows
          }

          pagination={
            false
          }

          scroll={{
            x: 1180,
          }}

          expandable={{

            // Only allow expansion when
            // there are multiple mappings.

            rowExpandable:
              (record: any) =>
                record.mappedProducts
                  ?.length > 1,

            expandIcon:
              ({
                expanded,
                onExpand,
                record,
              }) => {

                if (
                  record.mappedProducts
                    ?.length <= 1
                ) {
                  return (
                    <span
                      className="
                        inline-block
                        w-4
                      "
                    />
                  );
                }

                return (

                  <Button
                    type="text"
                    size="small"
                    icon={
                      expanded
                        ? <DownOutlined />
                        : <RightOutlined />
                    }
                    onClick={
                      event =>
                        onExpand(
                          record,
                          event
                        )
                    }
                  />

                );
              },

            expandedRowRender:
              (
                record: any
              ) => (

                <div
                  className="
                    rounded
                    border
                    border-slate-200
                    bg-slate-50
                    p-1
                  "
                >

                  <div
                    className="
                      mb-1
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <Typography.Text
                      strong
                      className="!text-xs"
                    >
                      Mapped Petpooja Items
                    </Typography.Text>

                    {record.valid ? (

                      <Tag
                        color="green"
                        icon={
                          <CheckCircleOutlined />
                        }
                        className="
                          !m-0
                          !text-[10px]
                        "
                      >
                        Quantity Matched
                      </Tag>

                    ) : (

                      <Tag
                        color="red"
                        icon={
                          <CloseCircleOutlined />
                        }
                        className="
                          !m-0
                          !text-[10px]
                        "
                      >
                        Quantity Mismatch
                      </Tag>

                    )}

                  </div>

                  <Table
                    rowKey="key"

                    size="small"

                    bordered

                    pagination={false}

                    columns={
                      mappedColumns
                    }

                    dataSource={
                      record.mappedProducts
                    }

                    scroll={{
                      x: 1100,
                    }}

                    rowSelection={{
                      selectedRowKeys:
                        selectedProductKeys,

                      onChange:
                        keys =>
                          setSelectedProductKeys(
                            keys
                          ),
                    }}
                  />

                </div>

              ),

          }}

        />

      </Card>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <Card
        size="small"
        styles={{
          body: {
            padding: "10px 12px",
          },
        }}
      >

        <div
          className="
            ml-auto
            w-full
            max-w-sm
          "
        >

          <div className="space-y-1.5">

            <div
              className="
                flex
                justify-between
                text-xs
              "
            >

              <Typography.Text>
                Subtotal
              </Typography.Text>

              <Typography.Text
                strong
              >
                {money(
                  subtotal
                )}
              </Typography.Text>

            </div>

            <div
              className="
                flex
                justify-between
                text-xs
              "
            >

              <Typography.Text>
                Item Discounts
              </Typography.Text>

              <Typography.Text
                type="danger"
              >
                -{" "}
                {money(
                  totalDiscount
                )}
              </Typography.Text>

            </div>

            <div
              className="
                flex
                justify-between
                text-xs
              "
            >

              <Typography.Text>
                Taxable Amount
              </Typography.Text>

              <Typography.Text
                strong
              >
                {money(
                  taxableAmount
                )}
              </Typography.Text>

            </div>

            <div
              className="
                flex
                justify-between
                text-xs
              "
            >

              <Typography.Text>
                Tax
              </Typography.Text>

              <Typography.Text>
                {money(
                  tax
                )}
              </Typography.Text>

            </div>

            <div
              className="
                flex
                justify-between
                text-xs
              "
            >

              <Typography.Text>
                Expense Charge
              </Typography.Text>

              <Typography.Text>
                {money(
                  expenseCharge
                )}
              </Typography.Text>

            </div>

            <div
              className="
                flex
                justify-between
                text-xs
              "
            >

              <Typography.Text>
                Round Off
              </Typography.Text>

              <Typography.Text>
                {money(
                  roundOff
                )}
              </Typography.Text>

            </div>

            <Divider
              className="!my-1.5"
            />

            <div
              className="
                flex
                justify-between
                text-base
                font-bold
              "
            >

              <span>
                Total
              </span>

              <span>
                {money(
                  total
                )}
              </span>

            </div>

          </div>

        </div>

      </Card>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Card
        size="small"
        styles={{
          body: {
            padding: "8px 10px",
          },
        }}
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <Button
            size="small"
            icon={
              <LeftOutlined />
            }
            onClick={
              onBack
            }
          >
            Back
          </Button>

          <Space
            size={8}
          >

            {stockResetCount >
              0 && (

              <Typography.Text
                type="warning"
                className="!text-xs"
              >
                {stockResetCount}
                {" "}stock reset
              </Typography.Text>

            )}

            {invalidRows.length >
              0 && (

              <Typography.Text
                type="danger"
                className="!text-xs"
              >
                Fix quantity mismatch
              </Typography.Text>

            )}

            <Button
              type="primary"
              size="small"
              icon={
                <RightOutlined />
              }
              disabled={
                invalidRows.length >
                0
              }
              onClick={
                handleContinue
              }
            >
              Continue to Create Bill
            </Button>

          </Space>

        </div>

      </Card>

    </div>
  );
}
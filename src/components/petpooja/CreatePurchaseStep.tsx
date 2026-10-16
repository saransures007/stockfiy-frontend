import { apiService } from "@/lib/api";
import React, { useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
} from "@ant-design/icons";


const { Title, Text } = Typography;

// ============================================================
// TYPES
// ============================================================

export interface CreatePurchaseStepProps {
  invoice: any;
  purchaseItems: any[];

  onBack: () => void;

  /*
   * Existing purchase bill submit.
   *
   * This should continue to call your existing
   * /api/v1/bills flow.
   */
  onSubmit: () => void | Promise<void>;

  submitting?: boolean;
}

interface FlatPurchaseItem {
  key: React.Key;

  invoiceDescription: string;

  itemId: number;

  itemCode: string;

  itemName: string;

  quantity: number;

  unitCode: string;

  purchaseRate: number;

  mrp: number;

  discountType: "percentage" | "amount";

  discountRate: number;

  discountAmount: number;

  gross: number;

  lineTotal: number;

  /*
   * Stock BEFORE the purchase operation.
   */
  currentStock: number;

  /*
   * What the final stock will be after:
   *
   * reset, if selected
   * +
   * purchase quantity
   */
  finalStock: number;

  /*
   * true when user selected Mark Stock Zero
   */
  stockAction: "none" | "zero";

  /*
   * Original stock information from
   * Purchase Review.
   */
  stockAdjustment: any;

  batchId: number | null;

  batchNumber: string;

  locationId: number | null;

  unitId: number | null;
}

// ============================================================
// HELPERS
// ============================================================

const numberValue = (
  value: any
): number => {
  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
};


const formatMoney = (
  value: any
): string => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(numberValue(value));
};


const getInvoiceDetail = (
  invoice: any
) => {
  return (
    invoice?.data ||
    invoice?.invoice ||
    invoice ||
    {}
  );
};


// ============================================================
// COMPONENT
// ============================================================

export default function CreatePurchaseStep({
  invoice,
  purchaseItems,
  onBack,
  onSubmit,
  submitting = false,
}: CreatePurchaseStepProps) {

  const [
    processingStock,
    setProcessingStock,
  ] = useState(false);


  const detail =
    getInvoiceDetail(invoice);


  // ==========================================================
  // FLATTEN PURCHASE ITEMS
  //
  // Purchase Review can contain:
  //
  // Invoice Item
  //    ↓
  // Multiple mapped Petpooja Items
  //
  // Here we flatten everything into one final table.
  // ==========================================================

  const flatItems =
    useMemo<FlatPurchaseItem[]>(
      () => {

        const result:
          FlatPurchaseItem[] = [];


        purchaseItems.forEach(
          (
            row: any,
            rowIndex: number
          ) => {

            const invoiceProduct =
              row?.invoiceProduct ||
              {};


            const mappedProducts =
              Array.isArray(
                row?.mappedProducts
              )
                ? row.mappedProducts
                : [];


            // ==================================================
            // MULTI MAPPING
            // ==================================================

            mappedProducts.forEach(
              (
                product: any,
                productIndex: number
              ) => {

                const quantity =
                  numberValue(
                    product?.quantity
                  );


                const purchaseRate =
                  numberValue(
                    product?.purchaseRate
                  );


                const gross =
                  product?.gross != null
                    ? numberValue(
                        product.gross
                      )
                    : quantity *
                      purchaseRate;


                const discountType =
                  product?.discountType ||
                  "percentage";


                let discountAmount =
                  numberValue(
                    product?.discountAmount
                  );


                /*
                 * Discount is LINE ITEM LEVEL.
                 */
                if (
                  discountType ===
                  "percentage"
                ) {

                  discountAmount =
                    gross *
                    numberValue(
                      product?.discountRate
                    ) /
                    100;

                }


                discountAmount =
                  Math.min(
                    gross,
                    Math.max(
                      0,
                      discountAmount
                    )
                  );


                const lineTotal =
                  product?.lineTotal != null
                    ? numberValue(
                        product.lineTotal
                      )
                    : gross -
                      discountAmount;


                // =================================================
                // STOCK
                // =================================================

                const currentStock =
                  numberValue(
                    product?.currentStock
                  );


                const stockAction =
                  product?.stockAction ===
                  "zero"
                    ? "zero"
                    : "none";


                /*
                 * IMPORTANT:
                 *
                 * If stock is reset:
                 *
                 *     current → 0
                 *     0 + purchaseQty
                 *
                 * Therefore:
                 *
                 *     finalStock = quantity
                 *
                 * Otherwise:
                 *
                 *     currentStock + quantity
                 */

                const finalStock =
                  stockAction ===
                  "zero"
                    ? quantity
                    : currentStock +
                      quantity;


                result.push({

                  key:
                    product?.key ??
                    `${rowIndex}-${productIndex}`,

                  invoiceDescription:
                    invoiceProduct?.description ||
                    row?.description ||
                    "—",

                  itemId:
                    numberValue(
                      product?.petpoojaItemId ??
                      product?.itemId ??
                      product?.id
                    ),

                  itemCode:
                    product?.itemCode ||
                    "—",

                  itemName:
                    product?.itemName ||
                    product?.name ||
                    "—",

                  quantity,

                  unitCode:
                    product?.unitCode ||
                    product?.unit?.code ||
                    "UNT",

                  purchaseRate,

                  mrp:
                    numberValue(
                      product?.mrp
                    ),

                  discountType,

                  discountRate:
                    numberValue(
                      product?.discountRate
                    ),

                  discountAmount,

                  gross,

                  lineTotal,

                  currentStock,

                  finalStock,

                  stockAction,

                  stockAdjustment:
                    product?.stockAdjustment ||
                    null,

                  batchId:
                    product?.batchId != null
                      ? numberValue(
                          product.batchId
                        )
                      : null,

                  batchNumber:
                    product?.batchNumber ||
                    "Primary",

                  locationId:
                    product?.locationId != null
                      ? numberValue(
                          product.locationId
                        )
                      : null,

                  unitId:
                    product?.unitId != null
                      ? numberValue(
                          product.unitId
                        )
                      : null,

                });

              }
            );


            // ==================================================
            // BACKWARD COMPATIBILITY
            //
            // Old single mapping structure.
            // ==================================================

            if (
              mappedProducts.length === 0 &&
              row?.petpoojaItem
            ) {

              const product =
                row.petpoojaItem;


              const quantity =
                numberValue(
                  row?.quantity ??
                  invoiceProduct?.quantity
                );


              const purchaseRate =
                numberValue(
                  row?.purchaseRate ??
                  invoiceProduct?.rate
                );


              const gross =
                quantity *
                purchaseRate;


              const stockAction =
                row?.stockAction ===
                "zero"
                  ? "zero"
                  : "none";


              const currentStock =
                numberValue(
                  row?.currentStock
                );


              const finalStock =
                stockAction === "zero"
                  ? quantity
                  : currentStock +
                    quantity;


              result.push({

                key:
                  row?.key ??
                  rowIndex,

                invoiceDescription:
                  invoiceProduct?.description ||
                  "—",

                itemId:
                  numberValue(
                    product?.id ??
                    product?.itemId
                  ),

                itemCode:
                  product?.itemCode ||
                  "—",

                itemName:
                  product?.itemName ||
                  "—",

                quantity,

                unitCode:
                  product?.unitCode ||
                  "UNT",

                purchaseRate,

                mrp:
                  numberValue(
                    row?.mrp ??
                    invoiceProduct?.mrp
                  ),

                discountType:
                  "percentage",

                discountRate: 0,

                discountAmount: 0,

                gross,

                lineTotal:
                  gross,

                currentStock,

                finalStock,

                stockAction,

                stockAdjustment:
                  row?.stockAdjustment ||
                  null,

                batchId:
                  row?.batchId != null
                    ? numberValue(
                        row.batchId
                      )
                    : null,

                batchNumber:
                  row?.batchNumber ||
                  "Primary",

                locationId:
                  row?.locationId != null
                    ? numberValue(
                        row.locationId
                      )
                    : null,

                unitId:
                  row?.unitId != null
                    ? numberValue(
                        row.unitId
                      )
                    : null,

              });

            }

          }
        );


        return result;

      },
      [purchaseItems]
    );


  // ==========================================================
  // BILL TOTALS
  // ==========================================================

  const totals =
    useMemo(() => {

      const subtotal =
        flatItems.reduce(
          (
            sum,
            item
          ) =>
            sum +
            numberValue(
              item.gross
            ),
          0
        );


      const itemDiscounts =
        flatItems.reduce(
          (
            sum,
            item
          ) =>
            sum +
            numberValue(
              item.discountAmount
            ),
          0
        );


      const taxableAmount =
        subtotal -
        itemDiscounts;


      const tax = 0;

      const expenseCharge = 0;

      const roundOff = 0;


      const total =
        taxableAmount +
        tax +
        expenseCharge +
        roundOff;


      return {
        subtotal,
        itemDiscounts,
        taxableAmount,
        tax,
        expenseCharge,
        roundOff,
        total,
      };

    }, [
      flatItems,
    ]);


  // ==========================================================
  // STOCK ZERO ITEMS
  // ==========================================================

  const stockZeroItems =
    useMemo(
      () =>
        flatItems.filter(
          item =>
            item.stockAction ===
            "zero"
        ),
      [flatItems]
    );


  // ==========================================================
  // BUILD STOCK ADJUSTMENT LINE
  //
  // This ONLY resets existing stock to zero.
  //
  // It DOES NOT include purchase quantity.
  // ==========================================================

  const buildStockAdjustmentLine = (
    item: FlatPurchaseItem
  ) => {

    const existingQuantity =
      numberValue(
        item
          ?.stockAdjustment
          ?.existingQuantity ??
        item.currentStock
      );


    return {

      itemId:
        numberValue(
          item.itemId
        ),


      batchId:
        item
          ?.stockAdjustment
          ?.batchId ??
        item.batchId ??
        null,


      locationId:
        item
          ?.stockAdjustment
          ?.locationId ??
        item.locationId ??
        null,


      existingQuantity,


      /*
       * Always reset to zero.
       */
      newQuantityOnHand:
        0,


      /*
       * Example:
       *
       * -8 → 0
       *
       * 0 - (-8) = +8
       *
       * 2 → 0
       *
       * 0 - 2 = -2
       */
      adjustedQuantity:
        0 -
        existingQuantity,


      unitId:
        item
          ?.stockAdjustment
          ?.unitId ??
        item.unitId ??
        null,


      serialNumbers: [],

      serialNumberIds: [],

    };
  };


  // ==========================================================
  // CREATE PURCHASE BILL
  //
  // ORDER:
  //
  // 1. Stock adjustment ONLY for marked-zero items
  // 2. If successful
  // 3. Existing purchase bill submit
  // ==========================================================

const handleCreatePurchase = async () => {

  try {

    setProcessingStock(true);

    // ========================================================
    // 1. STOCK RESET
    // ========================================================

    if (
      stockZeroItems.length > 0
    ) {

      const lineItems =
        stockZeroItems.map(
          item =>
            buildStockAdjustmentLine(
              item
            )
        );


      const stockPayload = {

        date:
          detail?.date ||
          new Date()
            .toISOString()
            .slice(0, 10),

        isAutoNumber:
          true,

        notes:
          "Stock Update By Stockify System",

        status:
          "approved",

        reasonId:
          254606186,

        attachment:
          "",

        lineItems,

      };

      console.log("stockPayload", stockPayload);

      const stockResponse =
        await apiService.createStockAdjustment(
          stockPayload
        );


      if (
        stockResponse?.success ===
        false
      ) {

        throw new Error(
          stockResponse?.message ||
          "Stock adjustment failed"
        );

      }

    }


    // ========================================================
    // 2. STOCK SUCCESS
    // ========================================================

    console.log(
      "Stock adjustment successful", 
    );


    // ========================================================
    // 3. CREATE BILL
    // ========================================================

    await onSubmit();


  } catch (error) {

    console.error(
      "Create purchase failed:",
      error
    );

  } finally {

    setProcessingStock(false);

  }

};


  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns = [

    {
      title: "#",

      width: 50,

      render:
        (
          _: any,
          __: any,
          index: number
        ) =>
          index + 1,
    },


    {
      title:
        "Invoice Item",

      dataIndex:
        "invoiceDescription",

      width: 220,

      render:
        (
          value: string
        ) => (

          <div>

            <Text strong>
              {value}
            </Text>

            <div className="text-xs text-slate-400">
              Invoice item
            </div>

          </div>

        ),
    },


    {
      title:
        "Mapped Item",

      key:
        "mappedItem",

      width: 280,

      render:
        (
          _: any,
          item: FlatPurchaseItem
        ) => (

          <div>

            <div className="font-semibold text-slate-900">
              {item.itemCode}
              {" · "}
              {item.itemName}
            </div>

            <div className="mt-1 flex flex-wrap gap-1">

              <Tag>
                {item.unitCode}
              </Tag>

              <Tag>
                Batch:{" "}
                {item.batchNumber}
              </Tag>

            </div>

          </div>

        ),
    },


    {
      title:
        "Qty",

      dataIndex:
        "quantity",

      width: 80,

      align:
        "right" as const,

      render:
        (value: number) => (
          <Text strong>
            {value}
          </Text>
        ),
    },


    {
      title:
        "Purchase Price",

      dataIndex:
        "purchaseRate",

      width: 130,

      align:
        "right" as const,

      render:
        (value: number) =>
          formatMoney(value),
    },


    {
      title:
        "Discount",

      key:
        "discount",

      width: 130,

      align:
        "right" as const,

      render:
        (
          _: any,
          item: FlatPurchaseItem
        ) => (

          <div>

            <Text type="danger">
              -{" "}
              {formatMoney(
                item.discountAmount
              )}
            </Text>


            {item.discountType ===
              "percentage" &&
              item.discountRate > 0 && (

                <div className="text-xs text-slate-400">
                  {item.discountRate}%
                </div>

              )}

          </div>

        ),
    },


    {
      title:
        "Purchase Value",

      key:
        "lineTotal",

      width: 140,

      align:
        "right" as const,

      render:
        (
          _: any,
          item: FlatPurchaseItem
        ) => (

          <Text strong>
            {formatMoney(
              item.lineTotal
            )}
          </Text>

        ),
    },


    {
      title:
        "Stock",

      key:
        "stock",

      width: 230,

      render:
        (
          _: any,
          item: FlatPurchaseItem
        ) => (

          <div className="text-xs">

            <div>
              <span className="text-slate-400">
                Before:
              </span>{" "}

              <strong>
                {item.currentStock}
              </strong>
            </div>


            <div>
              <span className="text-slate-400">
                Purchase:
              </span>{" "}

              <strong>
                +{item.quantity}
              </strong>
            </div>


            {item.stockAction ===
              "zero" ? (

              <>

                <div className="mt-1">
                  <span className="text-slate-400">
                    Reset:
                  </span>{" "}

                  <strong>
                    0
                  </strong>
                </div>


                <Tag
                  color="orange"
                  className="mt-1"
                >
                  Reset to Zero
                </Tag>


                <div className="mt-1 font-semibold text-green-600">
                  Final Stock:{" "}
                  {item.finalStock}
                </div>

              </>

            ) : (

              <div className="mt-1 font-semibold text-green-600">
                Final Stock:{" "}
                {item.finalStock}
              </div>

            )}

          </div>

        ),
    },

  ];


  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (
    flatItems.length === 0
  ) {

    return (

      <Card
        className="!rounded-2xl"
      >

        <Empty
          description=
            "No purchase items found"
        />


        <div className="mt-5 text-center">

          <Button
            icon={
              <ArrowLeftOutlined />
            }
            onClick={
              onBack
            }
          >
            Back to Purchase Review
          </Button>

        </div>

      </Card>

    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="space-y-4 pb-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div>

          <Button
            type="text"
            icon={
              <ArrowLeftOutlined />
            }
            onClick={
              onBack
            }
            disabled={
              submitting ||
              processingStock
            }
            className="!px-0"
          >
            Back to Purchase Review
          </Button>


          <Title
            level={3}
            className="!mb-1 !mt-1"
          >
            Create Purchase Bill
          </Title>


          <Text type="secondary">
            Final read-only review before creating the purchase bill.
          </Text>

        </div>


        <Tag
          color="green"
          icon={
            <CheckCircleOutlined />
          }
          className="w-fit px-3 py-1"
        >
          Ready
        </Tag>

      </div>


      {/* ======================================================
          BILL INFORMATION
      ====================================================== */}

      <Card
        size="small"
        className="!rounded-xl"
      >

        <Descriptions
          bordered
          size="small"
          column={{
            xs: 1,
            sm: 2,
            md: 4,
          }}
        >

          <Descriptions.Item
            label="Party Name"
          >

            {detail?.seller?.company_name ||
              detail?.supplier?.name ||
              detail?.supplier_name ||
              "—"}

          </Descriptions.Item>


          <Descriptions.Item
            label="Bill No."
          >

            {detail?.invoice_no ||
              detail?.invoice_number ||
              detail?.number ||
              detail?.voucherNumber ||
              "—"}

          </Descriptions.Item>


          <Descriptions.Item
            label="MRN No."
          >

            {detail?.mrnNumber ||
              "—"}

          </Descriptions.Item>


          <Descriptions.Item
            label="Date"
          >

            {detail?.date ||
              "—"}

          </Descriptions.Item>

        </Descriptions>

      </Card>


      {/* ======================================================
          STOCK NOTICE
      ====================================================== */}

      <Alert
        type={
          stockZeroItems.length > 0
            ? "warning"
            : "success"
        }
        showIcon
        icon={
          stockZeroItems.length > 0
            ? <WarningOutlined />
            : <CheckCircleOutlined />
        }
        message={
          stockZeroItems.length > 0
            ? `${stockZeroItems.length} item${
                stockZeroItems.length > 1
                  ? "s"
                  : ""
              } will be reset to zero`
            : "No stock reset required"
        }
        description={
          stockZeroItems.length > 0
            ? "The selected stock will be reset to zero only when you click Create Purchase Bill. The purchase quantity is then added to the reset stock."
            : "No stock adjustment API call will be made."
        }
      />


      {/* ======================================================
          ITEMS
      ====================================================== */}

      <Card
        size="small"
        className="!rounded-xl"
        title={

          <div className="
            flex
            items-center
            justify-between
          ">

            <Space>

              <ShoppingCartOutlined />

              <span className="font-semibold">
                Final Purchase Items
              </span>

            </Space>


            <Tag>
              {flatItems.length}
            </Tag>

          </div>

        }
      >

        <Table
          rowKey="key"
          columns={columns}
          dataSource={
            flatItems
          }
          pagination={false}
          size="middle"
          bordered
          scroll={{
            x: 1250,
          }}
        />

      </Card>


      {/* ======================================================
          STOCK RESET DETAILS
      ====================================================== */}

      {stockZeroItems.length > 0 && (

        <Card
          size="small"
          className="
            !rounded-xl
            !border-orange-200
            !bg-orange-50
          "
          title={
            <Space>

              <WarningOutlined />

              <span className="font-semibold text-orange-800">
                Stock Reset on Create
              </span>

            </Space>
          }
        >

          <div className="space-y-2">

            {stockZeroItems.map(
              item => {

                const payload =
                  buildStockAdjustmentLine(
                    item
                  );


                return (

                  <div
                    key={
                      item.key
                    }
                    className="
                      rounded-xl
                      bg-white
                      p-4
                      ring-1
                      ring-orange-100
                    "
                  >

                    <div className="
                      flex
                      flex-col
                      gap-3
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    ">

                      <div>

                        <div className="font-semibold text-slate-900">
                          {item.itemCode}
                          {" · "}
                          {item.itemName}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Purchase Qty:{" "}
                          <strong>
                            {item.quantity}
                          </strong>
                        </div>

                      </div>


                      <div className="flex flex-wrap gap-2">

                        <Tag>
                          Before{" "}
                          {payload.existingQuantity}
                        </Tag>


                        <Tag color="orange">
                          Reset → 0
                        </Tag>


                        <Tag color="blue">
                          Adjustment{" "}
                          {payload.adjustedQuantity > 0
                            ? "+"
                            : ""}
                          {
                            payload.adjustedQuantity
                          }
                        </Tag>


                        <Tag color="green">
                          Final Stock{" "}
                          {item.finalStock}
                        </Tag>

                      </div>

                    </div>


                    <div className="mt-3 border-t pt-3 text-xs text-slate-500">

                      <span>
                        Stock reset:
                      </span>{" "}

                      <strong>
                        {payload.existingQuantity}
                      </strong>

                      {" → "}

                      <strong>
                        0
                      </strong>


                      <span className="mx-2">
                        +
                      </span>


                      <span>
                        Purchase:
                      </span>{" "}

                      <strong>
                        {item.quantity}
                      </strong>


                      <span className="mx-2">
                        =
                      </span>


                      <strong className="text-green-600">
                        Final Stock{" "}
                        {item.finalStock}
                      </strong>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </Card>

      )}


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <Card
        size="small"
        className="!rounded-xl"
      >

        <Row
          gutter={[
            16,
            16,
          ]}
        >

          <Col
            xs={12}
            sm={8}
            md={6}
          >

            <Statistic
              title="Subtotal"
              value={
                totals.subtotal
              }
              precision={2}
              prefix="₹"
            />

          </Col>


          <Col
            xs={12}
            sm={8}
            md={6}
          >

            <Statistic
              title="Item Discounts"
              value={
                totals.itemDiscounts
              }
              precision={2}
              prefix="- ₹"
            />

          </Col>


          <Col
            xs={12}
            sm={8}
            md={6}
          >

            <Statistic
              title="Taxable Amount"
              value={
                totals.taxableAmount
              }
              precision={2}
              prefix="₹"
            />

          </Col>


          <Col
            xs={12}
            sm={8}
            md={6}
          >

            <Statistic
              title="Tax"
              value={
                totals.tax
              }
              precision={2}
              prefix="₹"
            />

          </Col>

        </Row>


        <Divider
          className="!my-4"
        />


        <div className="space-y-2">

          <div className="
            flex
            justify-end
            gap-10
            text-sm
          ">

            <span className="text-slate-500">
              Expense Charge
            </span>

            <span>
              {formatMoney(
                totals.expenseCharge
              )}
            </span>

          </div>


          <div className="
            flex
            justify-end
            gap-10
            text-sm
          ">

            <span className="text-slate-500">
              Round Off
            </span>

            <span>
              {formatMoney(
                totals.roundOff
              )}
            </span>

          </div>


          <div className="
            mt-3
            flex
            items-center
            justify-end
            gap-10
            border-t
            pt-4
          ">

            <span className="text-lg font-semibold">
              Total
            </span>


            <span className="
              text-2xl
              font-bold
              text-green-600
            ">
              {formatMoney(
                totals.total
              )}
            </span>

          </div>

        </div>

      </Card>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="
        sticky
        bottom-3
        z-20
        rounded-xl
        bg-white/95
        p-3
        shadow-xl
        ring-1
        ring-slate-200
        backdrop-blur
      ">

        <div className="
          flex
          flex-col-reverse
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-end
        ">

          <Button
            size="large"
            icon={
              <ArrowLeftOutlined />
            }
            onClick={
              onBack
            }
            disabled={
              submitting ||
              processingStock
            }
          >
            Back
          </Button>


          <Button
            type="primary"
            size="large"
            icon={
              <ShoppingCartOutlined />
            }
            loading={
              submitting ||
              processingStock
            }
            disabled={
              flatItems.length === 0
            }
            onClick={
              handleCreatePurchase
            }
            className="!bg-green-600"
          >

            {processingStock
              ? "Updating Stock..."
              : submitting
                ? "Creating Purchase..."
                : "Create Purchase Bill"}

          </Button>

        </div>

      </div>

    </div>

  );
}
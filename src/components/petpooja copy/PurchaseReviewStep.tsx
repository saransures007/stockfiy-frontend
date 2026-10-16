import { useMemo, useState } from "react";

import {
  Table,
  InputNumber,
  Button,
  Space,
  Popconfirm,
  Tag,
  Dropdown,
  message,
} from "antd";

import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";

import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ShoppingCartOutlined,
  StopOutlined,
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
  // INVOICE
  // ==========================================================

  const detail =
    invoice?.data ||
    invoice?.invoice ||
    invoice;


  // ==========================================================
  // MAPPING
  // ==========================================================

  const mapping =
    mappingData?.mapping || {};

  const items =
    Array.isArray(mapping.items)
      ? mapping.items
      : [];


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    selectedRowKeys,
    setSelectedRowKeys,
  ] = useState<React.Key[]>([]);

  const [
    editingKey,
    setEditingKey,
  ] = useState<
    string | number | null
  >(null);


  // ==========================================================
  // PREPARE ITEMS
  // ==========================================================

  const preparedItems = useMemo(() => {

    return items.map(
      (
        item: any,
        index: number
      ) => {

        const invoiceProduct =
          item?.invoiceProduct || {};

        const itemMapping =
          item?.mapping || {};

        const petpoojaItem =
          itemMapping?.petpoojaItem || {};


        // ----------------------------------------------------
        // QUANTITY
        // ----------------------------------------------------

        const quantity =
          Number(
            invoiceProduct.quantity || 0
          );


        // ----------------------------------------------------
        // PURCHASE RATE
        // ----------------------------------------------------

        const purchaseRate =
          Number(
            invoiceProduct.rate || 0
          );


        // ----------------------------------------------------
        // MRP
        // ----------------------------------------------------

        const mrp =
          Number(
            invoiceProduct.mrp || 0
          );


        // ----------------------------------------------------
        // SALES RATE
        // ----------------------------------------------------

        const salesRate =
          Number(
            petpoojaItem.salesRate ??
            petpoojaItem.salesPrice ??
            0
          );


        // ----------------------------------------------------
        // GST
        // ----------------------------------------------------

        const gstRate =
          Number(
            invoiceProduct.gst_rate ??
            invoiceProduct.gstRate ??
            0
          );


        // ----------------------------------------------------
        // CURRENT STOCK
        //
        // Different API responses can contain:
        //
        // stock.available
        // stock.total
        // availableStockQty
        // availableStock.total
        // totalStock
        // ----------------------------------------------------

        const currentStock =
          getCurrentStock(
            petpoojaItem
          );


        // ----------------------------------------------------
        // STOCK AFTER PURCHASE
        // ----------------------------------------------------

        const stockAfterPurchase =
          currentStock +
          quantity;


        // ----------------------------------------------------
        // UNIQUE KEY
        // ----------------------------------------------------

        const key =
          petpoojaItem?.id ??
          invoiceProduct?.id ??
          invoiceProduct?.lineNumber ??
          index;


        return {

          key,

          invoiceProduct,

          petpoojaItem,

          quantity,

          purchaseRate,

          mrp,

          salesRate,

          gstRate,

          currentStock,

          stockAfterPurchase,

        };
      }
    );

  }, [items]);


  // ==========================================================
  // DISPLAYED ITEMS
  // ==========================================================

  const displayedItems =
    purchaseItems.length > 0
      ? purchaseItems
      : preparedItems;


  // ==========================================================
  // UPDATE ROW
  // ==========================================================

  const updateRow = (
    key: React.Key,
    field: string,
    value: any
  ) => {

    const updated =
      displayedItems.map(
        (item: any) => {

          if (
            item.key !== key
          ) {
            return item;
          }


          const updatedItem = {
            ...item,
            [field]: value,
          };


          // --------------------------------------------------
          // Recalculate stock after quantity change
          // --------------------------------------------------

          if (
            field === "quantity"
          ) {

            updatedItem.stockAfterPurchase =
              Number(
                item.currentStock || 0
              ) +
              Number(
                value || 0
              );
          }


          return updatedItem;
        }
      );


    setPurchaseItems(
      updated
    );
  };


  // ==========================================================
  // DELETE SINGLE ROW
  // ==========================================================

  const deleteRow = (
    key: React.Key
  ) => {

    const updated =
      displayedItems.filter(
        (item: any) =>
          item.key !== key
      );


    setPurchaseItems(
      updated
    );


    setSelectedRowKeys(
      selectedRowKeys.filter(
        selectedKey =>
          selectedKey !== key
      )
    );


    if (
      editingKey === key
    ) {
      setEditingKey(null);
    }


    message.success(
      "Item deleted"
    );
  };


  // ==========================================================
  // MAKE CURRENT STOCK ZERO
  // ==========================================================

  const makeCurrentStockZero =
    () => {

      if (
        selectedRowKeys.length === 0
      ) {
        return;
      }


      const updated =
        displayedItems.map(
          (item: any) => {

            if (
              selectedRowKeys.includes(
                item.key
              )
            ) {

              return {

                ...item,

                currentStock: 0,

                stockAfterPurchase:
                  Number(
                    item.quantity || 0
                  ),

              };
            }


            return item;
          }
        );


      setPurchaseItems(
        updated
      );


      message.success(
        `${selectedRowKeys.length} item(s) stock set to zero`
      );
  };


  // ==========================================================
  // DELETE SELECTED
  // ==========================================================

  const deleteSelected =
    () => {

      if (
        selectedRowKeys.length === 0
      ) {
        return;
      }


      const count =
        selectedRowKeys.length;


      const updated =
        displayedItems.filter(
          (item: any) =>
            !selectedRowKeys.includes(
              item.key
            )
        );


      setPurchaseItems(
        updated
      );


      setSelectedRowKeys(
        []
      );


      setEditingKey(
        null
      );


      message.success(
        `${count} item(s) deleted`
      );
  };


  // ==========================================================
  // BULK MENU
  // ==========================================================

  const bulkActionItems:
    MenuProps["items"] = [

    {
      key: "stock-zero",

      label:
        "Make Current Stock Zero",

      icon:
        <StopOutlined />,

      onClick:
        makeCurrentStockZero,
    },

    {
      key: "delete",

      label:
        "Delete Selected",

      danger: true,

      icon:
        <DeleteOutlined />,

      onClick:
        deleteSelected,
    },

  ];


  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns:
    ColumnsType<any> = [

    // ========================================================
    // # 
    // FIXED LEFT
    // ========================================================

    {
      title: "#",

      width: 50,

      fixed: "left",

      align: "center",

      render:
        (
          _value,
          _record,
          index
        ) =>
          index + 1,
    },


    // ========================================================
    // INVOICE ITEM
    // FIXED LEFT
    // ========================================================

    {
      title:
        "Invoice Item",

      dataIndex:
        "invoiceProduct",

      width: 220,

      fixed: "left",

      render:
        (
          invoiceProduct
        ) => (

          <div
            className="
              min-w-0
              leading-tight
            "
          >

            <div
              className="
                truncate
                font-semibold
                text-slate-900
              "
              title={
                invoiceProduct?.description
              }
            >
              {
                invoiceProduct?.description ||
                "-"
              }
            </div>


            <div
              className="
                mt-1
                flex
                gap-2
                text-[10px]
                text-slate-400
              "
            >

              {invoiceProduct?.hsn && (

                <span>
                  HSN {invoiceProduct.hsn}
                </span>

              )}


              {invoiceProduct?.quantity != null && (

                <span>
                  Qty {invoiceProduct.quantity}
                </span>

              )}

            </div>

          </div>
        ),
    },


    // ========================================================
    // PETPOOJA ITEM
    // FIXED LEFT
    // ========================================================

    {
      title:
        "Petpooja Item",

      dataIndex:
        "petpoojaItem",

      width: 230,

      fixed: "left",

      render:
        (
          petpoojaItem
        ) => (

          <div
            className="
              min-w-0
              leading-tight
            "
          >

            <div
              className="
                truncate
                font-semibold
                text-slate-800
              "
              title={
                petpoojaItem?.itemName
              }
            >
              {
                petpoojaItem?.itemName ||
                "-"
              }
            </div>


            <div
              className="
                mt-1
                flex
                flex-wrap
                gap-2
                text-[10px]
                text-slate-400
              "
            >

              {petpoojaItem?.itemCode && (

                <span>
                  {petpoojaItem.itemCode}
                </span>

              )}


              {petpoojaItem?.hsn && (

                <span>
                  HSN {petpoojaItem.hsn}
                </span>

              )}

            </div>

          </div>
        ),
    },


    // ========================================================
    // QUANTITY
    // SCROLLABLE
    // ========================================================

    {
      title:
        "Qty",

      dataIndex:
        "quantity",

      width: 100,

      render:
        (
          value,
          record
        ) => {

          const editing =
            editingKey ===
            record.key;


          if (editing) {

            return (

              <InputNumber
                min={0}
                precision={2}
                size="small"
                className="!w-full"
                value={value}
                onChange={
                  newValue =>
                    updateRow(
                      record.key,
                      "quantity",
                      Number(
                        newValue || 0
                      )
                    )
                }
              />

            );
          }


          return (

            <span
              className="
                font-semibold
                text-slate-800
              "
            >
              {value}
            </span>

          );
        },
    },


    // ========================================================
    // PURCHASE RATE
    // SCROLLABLE
    // ========================================================

    {
      title:
        "Purchase Rate",

      dataIndex:
        "purchaseRate",

      width: 140,

      render:
        (
          value,
          record
        ) => {

          const editing =
            editingKey ===
            record.key;


          if (editing) {

            return (

              <InputNumber
                min={0}
                precision={2}
                size="small"
                className="!w-full"
                value={value}
                onChange={
                  newValue =>
                    updateRow(
                      record.key,
                      "purchaseRate",
                      Number(
                        newValue || 0
                      )
                    )
                }
              />

            );
          }


          return (
            <span className="font-medium">
              {formatMoney(value)}
            </span>
          );
        },
    },


    // ========================================================
    // MRP
    // SCROLLABLE
    // ========================================================

    {
      title:
        "MRP",

      dataIndex:
        "mrp",

      width: 110,

      render:
        (
          value,
          record
        ) => {

          const editing =
            editingKey ===
            record.key;


          if (editing) {

            return (

              <InputNumber
                min={0}
                precision={2}
                size="small"
                className="!w-full"
                value={value}
                onChange={
                  newValue =>
                    updateRow(
                      record.key,
                      "mrp",
                      Number(
                        newValue || 0
                      )
                    )
                }
              />

            );
          }


          return (
            <span>
              {formatMoney(value)}
            </span>
          );
        },
    },


    // ========================================================
    // SALES PRICE
    // SCROLLABLE
    // ========================================================

    {
      title:
        "Sales Price",

      dataIndex:
        "salesRate",

      width: 120,

      render:
        (
          value,
          record
        ) => {

          const editing =
            editingKey ===
            record.key;


          if (editing) {

            return (

              <InputNumber
                min={0}
                precision={2}
                size="small"
                className="!w-full"
                value={value}
                onChange={
                  newValue =>
                    updateRow(
                      record.key,
                      "salesRate",
                      Number(
                        newValue || 0
                      )
                    )
                }
              />

            );
          }


          return (
            <span>
              {formatMoney(value)}
            </span>
          );
        },
    },


    // ========================================================
    // GST
    // SCROLLABLE
    // ========================================================

    {
      title:
        "GST",

      dataIndex:
        "gstRate",

      width: 80,

      align: "center",

      render:
        value => (

          <Tag color="blue">
            {value || 0}%
          </Tag>

        ),
    },


    // ========================================================
    // BEFORE STOCK
    // FIXED RIGHT
    // ========================================================

    {
      title:
        "Before Stock",

      dataIndex:
        "currentStock",

      width: 115,

      fixed: "right",

      align: "center",

      render:
        value => {

          const stock =
            Number(value || 0);


          return (

            <span
              className={
                stock < 0
                  ? "font-semibold text-red-500"
                  : "font-semibold text-slate-700"
              }
            >
              {stock}
            </span>

          );
        },
    },


    // ========================================================
    // AFTER PURCHASE
    // FIXED RIGHT
    // ========================================================

    {
      title:
        "After Purchase",

      dataIndex:
        "stockAfterPurchase",

      width: 125,

      fixed: "right",

      align: "center",

      render:
        (
          _value,
          record
        ) => {

          const after =
            Number(
              record.currentStock || 0
            ) +
            Number(
              record.quantity || 0
            );


          return (

            <span
              className={
                after < 0
                  ? "font-semibold text-red-500"
                  : "font-bold text-green-600"
              }
            >
              {after}
            </span>

          );
        },
    },


    // ========================================================
    // ACTIONS
    // FIXED RIGHT
    // ========================================================

    {
      title:
        "Actions",

      key:
        "actions",

      width: 105,

      fixed: "right",

      align: "center",

      render:
        (
          _value,
          record
        ) => {

          const editing =
            editingKey ===
            record.key;


          return (

            <Space size={2}>

              {editing ? (

                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    setEditingKey(
                      null
                    )
                  }
                >
                  Done
                </Button>

              ) : (

                <Button
                  type="text"
                  size="small"
                  icon={
                    <EditOutlined />
                  }
                  onClick={() =>
                    setEditingKey(
                      record.key
                    )
                  }
                />

              )}


              <Popconfirm
                title={
                  "Delete this item?"
                }
                description={
                  "This item will be removed from the purchase."
                }
                okText="Delete"
                cancelText="Cancel"
                onConfirm={() =>
                  deleteRow(
                    record.key
                  )
                }
              >

                <Button
                  type="text"
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
  // RETURN
  // ==========================================================

  return (

    <div
      className="
        space-y-4
        pb-4
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <button
            onClick={onBack}
            className="
              mb-2
              text-sm
              font-medium
              text-slate-500
              hover:text-slate-900
            "
          >
            ← Back to Mapping
          </button>


          <h1
            className="
              text-xl
              font-bold
              text-slate-900
              sm:text-2xl
            "
          >
            Purchase Review
          </h1>


          <p
            className="
              mt-1
              text-xs
              text-slate-500
              sm:text-sm
            "
          >
            Review and edit purchase items
            before creating the final bill.
          </p>

        </div>


        {/* ITEM COUNT */}

        <div
          className="
            self-start
            rounded-xl
            bg-orange-50
            px-4
            py-2
            text-sm
          "
        >

          <span
            className="
              text-slate-500
            "
          >
            Items:
          </span>{" "}

          <span
            className="
              font-bold
              text-orange-600
            "
          >
            {displayedItems.length}
          </span>

        </div>

      </div>


      {/* =====================================================
          INFO
      ====================================================== */}

      <div
        className="
          rounded-xl
          border
          border-blue-100
          bg-blue-50
          px-3
          py-2.5
          text-xs
          text-blue-700
          sm:text-sm
        "
      >

        Select items using the checkboxes
        for bulk actions. Use ✎ to edit
        quantity, purchase rate, MRP or
        sales price.

      </div>


      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          rounded-xl
          bg-white
          p-3
          shadow-sm
          ring-1
          ring-slate-100
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div
          className="
            text-xs
            text-slate-500
            sm:text-sm
          "
        >

          {selectedRowKeys.length > 0 ? (

            <>
              <span
                className="
                  font-semibold
                  text-slate-900
                "
              >
                {selectedRowKeys.length}
              </span>{" "}

              item(s) selected

            </>

          ) : (

            "Select items for bulk actions"

          )}

        </div>


        <div
          className="
            flex
            w-full
            gap-2
            sm:w-auto
          "
        >

          <Dropdown
            menu={{
              items:
                bulkActionItems,
            }}
            disabled={
              selectedRowKeys.length ===
              0
            }
          >

            <Button
              icon={
                <MoreOutlined />
              }
              disabled={
                selectedRowKeys.length ===
                0
              }
              className="flex-1 sm:flex-none"
            >
              Bulk Actions
            </Button>

          </Dropdown>


          <Button
            danger
            icon={
              <DeleteOutlined />
            }
            disabled={
              selectedRowKeys.length ===
              0
            }
            onClick={
              deleteSelected
            }
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">
              Delete Selected
            </span>

            <span className="sm:hidden">
              Delete
            </span>
          </Button>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ====================================================== */}

      <div
        className="
          overflow-hidden
          rounded-xl
          bg-white
          shadow-sm
          ring-1
          ring-slate-100
        "
      >

        <Table
          rowKey="key"

          columns={
            columns
          }

          dataSource={
            displayedItems
          }

          rowSelection={{
            selectedRowKeys,

            onChange:
              keys =>
                setSelectedRowKeys(
                  keys
                ),
          }}

          pagination={
            false
          }

          size="small"

          bordered={false}

          sticky

          scroll={{
            x: 1400,
          }}

          rowClassName={() =>
            "purchase-review-row"
          }
        />

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <PurchaseSummary
        items={
          displayedItems
        }
        detail={
          detail
        }
      />


      {/* =====================================================
          BOTTOM ACTION
      ====================================================== */}

      <div
        className="
          sticky
          bottom-2
          z-20
          flex
          flex-col
          gap-2
          rounded-xl
          bg-white/95
          p-2
          shadow-xl
          ring-1
          ring-slate-200
          backdrop-blur
          sm:flex-row
          sm:justify-end
        "
      >

        <Button
          size="large"
          onClick={
            onBack
          }
          className="w-full sm:w-auto"
        >
          ← Back
        </Button>


        <Button
          type="primary"
          size="large"
          icon={
            <ShoppingCartOutlined />
          }
          onClick={
            onContinue
          }
          className="
            w-full
            !bg-orange-500
            hover:!bg-orange-600
            sm:w-auto
          "
        >
          Continue to Create Bill →
        </Button>

      </div>

    </div>
  );
}


// ============================================================
// PURCHASE SUMMARY
// ============================================================

function PurchaseSummary({
  items,
  detail,
}: {
  items: any[];
  detail: any;
}) {

  const subtotal =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity || 0
        ) *
        Number(
          item.purchaseRate || 0
        ),

      0
    );


  const totalQuantity =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity || 0
        ),

      0
    );


  return (

    <div
      className="
        ml-auto
        w-full
        max-w-md
        rounded-xl
        bg-white
        p-4
        shadow-sm
        ring-1
        ring-slate-100
      "
    >

      <h2
        className="
          font-semibold
          text-slate-900
        "
      >
        Purchase Summary
      </h2>


      <div
        className="
          mt-3
          flex
          justify-between
          text-sm
          text-slate-600
        "
      >

        <span>
          Items
        </span>

        <span
          className="
            font-medium
            text-slate-900
          "
        >
          {items.length}
        </span>

      </div>


      <div
        className="
          mt-2
          flex
          justify-between
          text-sm
          text-slate-600
        "
      >

        <span>
          Total Quantity
        </span>

        <span
          className="
            font-medium
            text-slate-900
          "
        >
          {totalQuantity}
        </span>

      </div>


      <div
        className="
          mt-2
          flex
          justify-between
          text-sm
          text-slate-600
        "
      >

        <span>
          Purchase Value
        </span>

        <span
          className="
            font-medium
            text-slate-900
          "
        >
          {formatMoney(
            subtotal
          )}
        </span>

      </div>


      <div
        className="
          my-3
          border-t
          border-slate-100
        "
      />


      <div
        className="
          flex
          justify-between
          text-lg
          font-bold
          text-slate-900
        "
      >

        <span>
          Purchase Total
        </span>

        <span>
          {formatMoney(
            subtotal
          )}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// CURRENT STOCK HELPER
// ============================================================

function getCurrentStock(
  petpoojaItem: any
): number {

  if (
    !petpoojaItem
  ) {
    return 0;
  }


  /*
   * Full Petpooja detail response:
   *
   * stock: {
   *   total: -14,
   *   reserved: 0,
   *   available: -14
   * }
   */

  const stockAvailable =
    petpoojaItem?.stock?.available;


  if (
    stockAvailable !==
      null &&
    stockAvailable !==
      undefined &&
    stockAvailable !== ""
  ) {

    return Number(
      stockAvailable
    );
  }


  // ----------------------------------------------------------
  // Search/list response
  // ----------------------------------------------------------

  const availableStockQty =
    petpoojaItem?.availableStockQty;


  if (
    availableStockQty !==
      null &&
    availableStockQty !==
      undefined &&
    availableStockQty !== ""
  ) {

    return Number(
      availableStockQty
    );
  }


  // ----------------------------------------------------------
  // availableStock.total
  // ----------------------------------------------------------

  const availableStockTotal =
    petpoojaItem?.availableStock?.total;


  if (
    availableStockTotal !==
      null &&
    availableStockTotal !==
      undefined &&
    availableStockTotal !== ""
  ) {

    return Number(
      availableStockTotal
    );
  }


  // ----------------------------------------------------------
  // totalStock
  // ----------------------------------------------------------

  if (
    petpoojaItem?.totalStock !==
      null &&
    petpoojaItem?.totalStock !==
      undefined
  ) {

    return Number(
      petpoojaItem.totalStock
    );
  }


  return 0;
}


// ============================================================
// MONEY
// ============================================================

function formatMoney(
  value: any
) {

  const number =
    Number(
      value || 0
    );


  if (
    Number.isNaN(
      number
    )
  ) {

    return "₹0.00";
  }


  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        2,
    }
  ).format(
    number
  );
}
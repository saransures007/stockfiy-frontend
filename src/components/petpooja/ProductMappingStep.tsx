import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Dropdown,
  message,
  Tabs,
} from "antd";

import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";

import {
  DeleteOutlined,
  LinkOutlined,
  PlusOutlined,
  DisconnectOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import CreateNewProductModal from "./CreateNewProductModal";

interface ProductMappingStepProps {
  mappingData: any;

  confirmingId: number | null;

  onConfirm: (
    item: any,
    petpoojaItemIds: number[]
  ) => void | Promise<void>;

  onSearchProducts?: (
    query: string
  ) => Promise<any[]>;

  onCreateNew?: (
    item: any,
    payload: any
  ) => Promise<any>;

  onContinue: () => void;

  onBack: () => void;
}

type MappingStatus =
  | "MAPPED"
  | "UNMAPPED"
  | "NEW";

interface MappingSelection {
  id: number;
  item: any;
  confidence?: number;
}

export default function ProductMappingStep({
  mappingData,
  confirmingId,
  onConfirm,
  onCreateNew,
  onSearchProducts,
  onContinue,
  onBack,
}: ProductMappingStepProps) {
  // ==========================================================
  // SOURCE
  // ==========================================================

  const mapping =
    mappingData?.mapping || {};

  const sourceItems =
    Array.isArray(mapping.items)
      ? mapping.items
      : [];

  // ==========================================================
  // NORMALIZE
  // ==========================================================

const initialRows = useMemo(() => {
  return sourceItems.map(
    (item: any, index: number) => {

      const itemMapping =
        item?.mapping || {};

      const candidates =
        Array.isArray(
          itemMapping.candidates
        )
          ? itemMapping.candidates
          : [];

      // =====================================================
      // ONLY REAL CONFIRMED MAPPINGS
      // =====================================================
      //
      // Do NOT use candidates to decide mapped status.
      //
      // Backend confirmed mapping:
      // mapping.status === "ALREADY_MAPPED"
      //
      // Multi mapping:
      // mapping.petpoojaItems[]
      // =====================================================

      let mappings: MappingSelection[] = [];

      if (
        itemMapping.status ===
        "ALREADY_MAPPED"
      ) {

        const petpoojaItems =
          Array.isArray(
            itemMapping.petpoojaItems
          )
            ? itemMapping.petpoojaItems
            : [];

        mappings =
          petpoojaItems
            .map(
              (product: any) => {

                const id =
                  Number(
                    product?.petpoojaItemId ??
                    product?.id
                  );

                if (
                  !Number.isFinite(id)
                ) {
                  return null;
                }

                return {
                  id,

                  item:
                    product,

                  confidence:
                    Number(
                      itemMapping.confidence ||
                      100
                    ),
                };
              }
            )
            .filter(
              Boolean
            ) as MappingSelection[];
      }

      // =====================================================
      // STATUS
      // =====================================================

      const status: MappingStatus =
        itemMapping.status ===
          "ALREADY_MAPPED" &&
        mappings.length > 0
          ? "MAPPED"
          : "UNMAPPED";

      // =====================================================
      // RETURN ROW
      // =====================================================

      return {

        ...item,

        key:
          item.invoiceProduct
            ?.lineNumber ??
          item.invoiceProduct
            ?.id ??
          index,

        mappingStatus:
          status,

        mappings,

        selectedPetpoojaItem:
          mappings[0]?.item ||
          null,

        confidence:
          Number(
            itemMapping.confidence ??
            candidates[0]?.confidence ??
            candidates[0]?.score ??
            0
          ),

        // IMPORTANT:
        // candidates are suggestions only
        candidates,

      };
    }
  );
}, [sourceItems]);

  // ==========================================================
  // ROW STATE
  // ==========================================================

  const [
    rows,
    setRows,
  ] = useState<any[]>(
    initialRows
  );

  /*
   * Important:
   * If mappingData changes after backend mapping,
   * refresh local rows.
   */
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // ==========================================================
  // TAB
  // ==========================================================

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "mapped" | "unmapped"
  >("mapped");

  // ==========================================================
  // ROW SELECTION
  // ==========================================================

  const [
    selectedRowKeys,
    setSelectedRowKeys,
  ] = useState<React.Key[]>([]);

  // ==========================================================
  // MULTI PRODUCT SELECTION
  // Per invoice row
  // ==========================================================

  const [
    multiSelections,
    setMultiSelections,
  ] = useState<
    Record<
      string,
      MappingSelection[]
    >
  >({});

  // ==========================================================
  // ADD MAPPING ROW
  // ==========================================================

  const [
    addMappingRow,
    setAddMappingRow,
  ] = useState<any>(null);

  // ==========================================================
  // CREATE NEW
  // ==========================================================

  const [
    createItem,
    setCreateItem,
  ] = useState<any>(null);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const mappedItems =
    rows.filter(
      (item) =>
        item.mappingStatus ===
        "MAPPED"
    );

  const unmappedItems =
    rows.filter(
      (item) =>
        item.mappingStatus !==
        "MAPPED"
    );

  const total =
    rows.length;

  // ==========================================================
  // SELECTED PRODUCTS FOR CURRENT ROW
  // ==========================================================

  const getSelectedProducts = (
    row: any
  ): MappingSelection[] => {
    return (
      multiSelections[
        String(row.key)
      ] || []
    );
  };

  // ==========================================================
  // TOGGLE PRODUCT
  // ==========================================================

  const toggleProduct = (
    row: any,
    product: any
  ) => {
    const id =
      Number(product?.id);

    if (
      !Number.isFinite(id)
    ) {
      message.error(
        "Invalid Petpooja item"
      );
      return;
    }

    const key =
      String(row.key);

    setMultiSelections(
      (previous) => {
        const current =
          previous[key] || [];

        const exists =
          current.some(
            (x) =>
              Number(x.id) === id
          );

        if (exists) {
          return {
            ...previous,

            [key]:
              current.filter(
                (x) =>
                  Number(x.id) !==
                  id
              ),
          };
        }

        return {
          ...previous,

          [key]: [
            ...current,
            {
              id,
              item: product,
              confidence:
                Number(
                  product?.confidence ??
                    product?.score ??
                    0
                ),
            },
          ],
        };
      }
    );
  };

  // ==========================================================
  // IS PRODUCT SELECTED
  // ==========================================================

  const isProductSelected = (
    row: any,
    product: any
  ) => {
    const selected =
      getSelectedProducts(row);

    return selected.some(
      (x) =>
        Number(x.id) ===
        Number(product?.id)
    );
  };

  // ==========================================================
  // MAP MULTIPLE PRODUCTS
  // ==========================================================

const mapMultiple = async (row: any) => {
  const selected = getSelectedProducts(row);

  if (selected.length === 0) {
    message.warning(
      "Select at least one Petpooja item"
    );
    return;
  }

  try {
    // ONE API call with ALL selected IDs
    await onConfirm(
      row,
      selected.map((product) => product.id)
    );

    // Update local row
    setRows((previous) =>
      previous.map((item) => {
        if (item.key !== row.key) {
          return item;
        }

        return {
          ...item,
          mappingStatus: "MAPPED",
          mappings: selected,
          selectedPetpoojaItem:
            selected[0]?.item || null,
          confidence:
            Number(
              selected[0]?.confidence ||
                row.confidence ||
                0
            ),
        };
      })
    );

    // Clear selection
    setMultiSelections((previous) => {
      const next = {
        ...previous,
      };

      delete next[String(row.key)];

      return next;
    });

    setSelectedRowKeys((previous) =>
      previous.filter(
        (key) => key !== row.key
      )
    );

    //setActiveTab("mapped");

    message.success(
      `${selected.length} Petpooja item(s) mapped`
    );

  } catch (error: any) {
    console.error(
      "Multi mapping failed:",
      error
    );

    message.error(
      error?.message ||
        "Failed to map selected products"
    );
  }
};

  // ==========================================================
  // ADD MAPPING TO EXISTING MAPPED ROW
  // ==========================================================

  const addMappingsToMappedRow =
    async (
      row: any,
      products: MappingSelection[]
    ) => {
      if (
        products.length === 0
      ) {
        return;
      }

      const existing =
        Array.isArray(
          row.mappings
        )
          ? row.mappings
          : [];

      const existingIds =
        new Set(
          existing.map(
            (x: any) =>
              Number(
                x.id ??
                  x.petpoojaItemId ??
                  x.item?.id
              )
          )
        );

      const newProducts =
        products.filter(
          (product) =>
            !existingIds.has(
              Number(product.id)
            )
        );

      if (
        newProducts.length === 0
      ) {
        message.info(
          "Selected products are already mapped"
        );

        return;
      }

      try {
        /*
         * Existing backend endpoint.
         */

        await onConfirm(
          row,
          newProducts.map(
            (product) => product.id
          )
        );

        const combined = [
          ...existing,
          ...newProducts,
        ];

        setRows(
          (previous) =>
            previous.map(
              (item) =>
                item.key ===
                row.key
                  ? {
                      ...item,

                      mappingStatus:
                        "MAPPED",

                      mappings:
                        combined,

                      selectedPetpoojaItem:
                        combined[0]
                          ?.item ||
                        null,
                    }
                  : item
            )
        );

        setAddMappingRow(
          null
        );

        setMultiSelections(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next[
              String(row.key)
            ];

            return next;
          }
        );

        message.success(
          `${newProducts.length} mapping(s) added`
        );
      } catch (
        error: any
      ) {
        console.error(
          "Add mapping failed:",
          error
        );

        message.error(
          error?.message ||
            "Failed to add mapping"
        );
      }
    };

  // ==========================================================
  // UNMAP SELECTED ROWS
  // ==========================================================

  const unmapSelected = () => {
    if (
      selectedRowKeys.length ===
      0
    ) {
      return;
    }

    setRows(
      (previous) =>
        previous.map(
          (item) =>
            selectedRowKeys.includes(
              item.key
            )
              ? {
                  ...item,

                  mappingStatus:
                    "UNMAPPED",

                  mappings: [],

                  selectedPetpoojaItem:
                    null,
                }
              : item
        )
    );

    setSelectedRowKeys(
      []
    );

    setActiveTab(
      "unmapped"
    );

    message.success(
      "Selected items moved to Unmapped"
    );
  };

  // ==========================================================
  // DELETE SELECTED
  // ==========================================================

  const deleteSelected = () => {
    if (
      selectedRowKeys.length ===
      0
    ) {
      return;
    }

    setRows(
      (previous) =>
        previous.filter(
          (item) =>
            !selectedRowKeys.includes(
              item.key
            )
        )
    );

    setSelectedRowKeys(
      []
    );

    message.success(
      "Selected items deleted"
    );
  };

  // ==========================================================
  // DELETE ONE
  // ==========================================================

  const deleteOne = (
    key: React.Key
  ) => {
    setRows(
      (previous) =>
        previous.filter(
          (item) =>
            item.key !== key
        )
    );

    setSelectedRowKeys(
      (previous) =>
        previous.filter(
          (x) =>
            x !== key
        )
    );
  };

  // ==========================================================
  // CREATE NEW
  // ==========================================================

  const handleCreateNew =
    async (
      row: any,
      payload: any
    ) => {
      try {
        if (
          onCreateNew
        ) {
          await onCreateNew(
            row,
            payload
          );
        }

        const newProduct = {
          ...payload,

          id:
            payload?.id ??
            payload?.itemId ??
            Date.now(),

          itemName:
            payload?.itemName,
        };

        setRows(
          (previous) =>
            previous.map(
              (item) => {
                if (
                  item.key !==
                  row.key
                ) {
                  return item;
                }

                const currentMappings =
                  Array.isArray(
                    item.mappings
                  )
                    ? item.mappings
                    : [];

                const newMapping = {
                  id:
                    Number(
                      newProduct.id
                    ),

                  item:
                    newProduct,

                  confidence: 100,
                };

                return {
                  ...item,

                  mappingStatus:
                    "MAPPED",

                  mappings: [
                    ...currentMappings,
                    newMapping,
                  ],

                  selectedPetpoojaItem:
                    currentMappings
                      .length > 0
                      ? currentMappings[0]
                          ?.item
                      : newProduct,

                  confidence: 100,
                };
              }
            )
        );

        setCreateItem(
          null
        );

        setActiveTab(
          "mapped"
        );

        message.success(
          "New product created and mapped"
        );
      } catch (
        error: any
      ) {
        message.error(
          error?.message ||
            "Failed to create product"
        );
      }
    };

  // ==========================================================
  // BULK MENU
  // ==========================================================

  const bulkMenu:
    MenuProps["items"] = [
    ...(activeTab ===
    "mapped"
      ? [
          {
            key:
              "unmap",

            label:
              "Unmap Selected",

            icon:
              <DisconnectOutlined />,

            onClick:
              unmapSelected,
          },
        ]
      : []),

    {
      key:
        "delete",

      label:
        "Delete Selected",

      danger:
        true,

      icon:
        <DeleteOutlined />,

      onClick:
        deleteSelected,
    },
  ];

  // ==========================================================
  // COLUMNS
  // ==========================================================

  const columns:
    ColumnsType<any> = [
    // --------------------------------------------------------
    // NUMBER
    // --------------------------------------------------------

    {
      title:
        "#",

      width:
        50,

      fixed:
        "left",

      align:
        "center",

      render:
        (
          _,
          _record,
          index
        ) =>
          index + 1,
    },

    // --------------------------------------------------------
    // INVOICE ITEM
    // --------------------------------------------------------

    {
      title:
        "Invoice Item",

      width:
        250,

      fixed:
        "left",

      render:
        (_, record) => {
          const invoice =
            record.invoiceProduct ||
            {};

          return (
            <div
              className="
                min-w-0
                leading-tight
              "
            >
              <p
                className="
                  truncate
                  font-semibold
                  text-slate-900
                "
                title={
                  invoice.description
                }
              >
                {
                  invoice.description ||
                  "Unknown"
                }
              </p>

              <div
                className="
                  mt-1
                  flex
                  gap-2
                  text-[10px]
                  text-slate-400
                "
              >
                <span>
                  Qty{" "}
                  {invoice.quantity ??
                    "—"}
                </span>

                {invoice.hsn && (
                  <span>
                    HSN{" "}
                    {
                      invoice.hsn
                    }
                  </span>
                )}
              </div>
            </div>
          );
        },
    },

    // --------------------------------------------------------
    // PETPOOJA ITEM
    // --------------------------------------------------------

    {
      title:
        activeTab ===
        "mapped"
          ? "Mapped Petpooja Items"
          : "Suggested / Select Petpooja Items",

      width:
        430,

      render:
        (_, record) => {
          const mappings =
            Array.isArray(
              record.mappings
            )
              ? record.mappings
              : [];

          // ==================================================
          // MAPPED
          // ==================================================

          if (
            activeTab ===
            "mapped"
          ) {
            if (
              mappings.length ===
              0
            ) {
              return (
                <Tag color="red">
                  No mapped item
                </Tag>
              );
            }

            return (
              <div
                className="
                  space-y-2
                "
              >
                {mappings.map(
                  (
                    mappingItem: MappingSelection,
                    index: number
                  ) => (
                    <div
                      key={
                        mappingItem.id ??
                        index
                      }
                      className="
                        rounded-lg
                        border
                        border-slate-100
                        bg-slate-50
                        px-3
                        py-2
                      "
                    >
                      <ProductDisplay
                        product={
                          mappingItem.item
                        }
                        confidence={
                          mappingItem.confidence
                        }
                        showConfidence={
                          true
                        }
                      />
                    </div>
                  )
                )}

              
              </div>
            );
          }

          // ==================================================
          // UNMAPPED
          // ==================================================

          return (
            <MultiProductSelector
              row={
                record
              }
              candidates={
                record.candidates ||
                []
              }
              selectedProducts={
                getSelectedProducts(
                  record
                )
              }
              isProductSelected={
                isProductSelected
              }
              onToggle={
                toggleProduct
              }
              onClose={() => {
                setMultiSelections(
                  (
                    previous
                  ) => {
                    const next = {
                      ...previous,
                    };

                    delete next[
                      String(
                        record.key
                      )
                    ];

                    return next;
                  }
                );
              }}
              onConfirm={(
                selected
              ) =>
                setMultiSelections(
                  (
                    previous
                  ) => ({
                    ...previous,

                    [String(
                      record.key
                    )]:
                      selected,
                  })
                )
              }
              onSearchProducts={
                onSearchProducts
              }
            />
          );
        },
    },

    // --------------------------------------------------------
    // SCORE
    // --------------------------------------------------------

    {
      title:
        "Score",

      width:
        90,

      align:
        "center",

      render:
        (_, record) => {
          const score =
            Number(
              record?.confidence ??
                0
            );

          if (!score) {
            return (
              <span className="text-slate-300">
                —
              </span>
            );
          }

          let color =
            "red";

          if (
            score >= 90
          ) {
            color =
              "green";
          } else if (
            score >= 60
          ) {
            color =
              "orange";
          }

          return (
            <Tag color={color}>
              {score}%
            </Tag>
          );
        },
    },

    // --------------------------------------------------------
    // MRP
    // --------------------------------------------------------

    {
      title:
        "MRP",

      width:
        100,

      align:
        "right",

      render:
        (_, record) => {
          const product =
            record.mappings?.[0]
              ?.item;

          return money(
            product?.mrp
          );
        },
    },

    // --------------------------------------------------------
    // PURCHASE
    // --------------------------------------------------------

    {
      title:
        "Purchase",

      width:
        110,

      align:
        "right",

      render:
        (_, record) =>
          money(
            record
              .invoiceProduct
              ?.rate
          ),
    },

    // --------------------------------------------------------
    // ACTION
    // --------------------------------------------------------

    {
      title:
        "Action",

      width:
        230,

      fixed:
        "right",

      align:
        "center",

      render:
        (_, record) => {
          // ==================================================
          // MAPPED
          // ==================================================

          if (
            activeTab ===
            "mapped"
          ) {
            return (
              <Space
                size={4}
                wrap
              >
           
                <Button
                  size="small"
                  icon={
                    <DisconnectOutlined />
                  }
                  onClick={() => {
                    setRows(
                      (
                        previous
                      ) =>
                        previous.map(
                          (item) =>
                            item.key ===
                            record.key
                              ? {
                                  ...item,

                                  mappingStatus:
                                    "UNMAPPED",

                                  mappings:
                                    [],

                                  selectedPetpoojaItem:
                                    null,
                                }
                              : item
                        )
                    );

                    setActiveTab(
                      "unmapped"
                    );

                    message.success(
                      "Item moved to Unmapped"
                    );
                  }}
                >
                  Unmap
                </Button>

                <Popconfirm
                  title="Delete item?"
                  onConfirm={() =>
                    deleteOne(
                      record.key
                    )
                  }
                >
                  <Button
                    size="small"
                    danger
                    icon={
                      <DeleteOutlined />
                    }
                  />
                </Popconfirm>
              </Space>
            );
          }

          // ==================================================
          // UNMAPPED
          // ==================================================

          const selected =
            getSelectedProducts(
              record
            );

          return (
            <Space
              size={4}
              wrap
            >
              <Button
                type="primary"
                size="small"
                icon={
                  <LinkOutlined />
                }
                disabled={
                  selected.length ===
                  0
                }
                loading={
                  confirmingId !=
                  null
                }
                onClick={() =>
                  mapMultiple(
                    record
                  )
                }
                className="
                  !bg-orange-500
                  hover:!bg-orange-600
                "
              >
                Map
                {selected.length >
                  0
                  ? ` (${selected.length})`
                  : ""}
              </Button>

              <Button
                size="small"
                icon={
                  <PlusOutlined />
                }
                onClick={() =>
                  setCreateItem(
                    record
                  )
                }
              >
                New
              </Button>

              <Popconfirm
                title="Delete item?"
                onConfirm={() =>
                  deleteOne(
                    record.key
                  )
                }
              >
                <Button
                  size="small"
                  danger
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
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        space-y-4
        pb-4
      "
    >
      {/* HEADER */}

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
            onClick={
              onBack
            }
            className="
              mb-2
              text-sm
              font-medium
              text-slate-500
              hover:text-slate-900
            "
          >
            ← Back to Review
          </button>

          <h1
            className="
              text-xl
              font-bold
              text-slate-900
              sm:text-2xl
            "
          >
            Product Mapping
          </h1>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
              sm:text-sm
            "
          >
            Map one or multiple
            Petpooja products to
            each invoice item.
          </p>
        </div>

        <div
          className="
            rounded-xl
            bg-orange-50
            px-4
            py-2
            text-sm
          "
        >
          <span className="text-slate-500">
            Total:
          </span>{" "}

          <b
            className="
              text-orange-600
            "
          >
            {total}
          </b>
        </div>
      </div>

      {/* MULTI-MAP INFO */}

      <div
        className="
          rounded-xl
          border
          border-blue-100
          bg-blue-50
          px-4
          py-3
          text-xs
          text-blue-700
        "
      >
        <b>Multi-map:</b>{" "}
        Select multiple Petpooja
        products for the same
        invoice item, then click
        <b> Map</b>. Quantity
        allocation is handled
        later in Purchase Review.
      </div>

      {/* TABS */}

      <div
        className="
          rounded-xl
          bg-white
          px-3
          shadow-sm
          ring-1
          ring-slate-100
        "
      >
        <Tabs
          activeKey={
            activeTab
          }
          onChange={(key) => {
            setActiveTab(
              key as
                | "mapped"
                | "unmapped"
            );

            setSelectedRowKeys(
              []
            );

            setAddMappingRow(
              null
            );
          }}
          items={[
            {
              key:
                "mapped",

              label: (
                <span>
                  ✓ Mapped{" "}

                  <Tag color="green">
                    {
                      mappedItems.length
                    }
                  </Tag>
                </span>
              ),
            },

            {
              key:
                "unmapped",

              label: (
                <span>
                  ⚠ Unmapped / New{" "}

                  <Tag
                    color={
                      unmappedItems.length
                        ? "orange"
                        : "default"
                    }
                  >
                    {
                      unmappedItems.length
                    }
                  </Tag>
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* TOOLBAR */}

      <div
        className="
          flex
          flex-col
          gap-2
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
            text-sm
            text-slate-500
          "
        >
          {selectedRowKeys.length
            ? (
              <>
                <b
                  className="
                    text-slate-900
                  "
                >
                  {
                    selectedRowKeys.length
                  }
                </b>{" "}
                selected
              </>
            )
            : "Select items for bulk actions"}
        </div>

        <Space>
          <Dropdown
            menu={{
              items:
                bulkMenu,
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
          >
            Delete
          </Button>
        </Space>
      </div>

      {/* TABLE */}

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
          size="small"
          bordered={false}
          sticky
          pagination={false}
          columns={
            columns
          }
          dataSource={
            activeTab ===
            "mapped"
              ? mappedItems
              : unmappedItems
          }
          rowSelection={{
            selectedRowKeys,

            onChange:
              (
                keys
              ) =>
                setSelectedRowKeys(
                  keys
                ),
          }}
          scroll={{
            x: 1350,
          }}
        />
      </div>

      {/* CONTINUE */}

      <div
        className="
          sticky
          bottom-2
          z-20
          flex
          justify-end
          rounded-xl
          bg-white/95
          p-2
          shadow-xl
          ring-1
          ring-slate-200
          backdrop-blur
        "
      >
        <Button
          type="primary"
          size="large"
          disabled={
            unmappedItems.length >
            0
          }
          onClick={
            onContinue
          }
          className="
            !bg-orange-500
            hover:!bg-orange-600
          "
        >
          {unmappedItems.length >
          0
            ? `Resolve ${unmappedItems.length} Item(s)`
            : "Continue to Purchase Review →"}
        </Button>
      </div>

      {/* CREATE NEW */}

      <CreateNewProductModal
        open={
          !!createItem
        }
        invoiceItem={
          createItem
            ?.invoiceProduct
        }
        onClose={() =>
          setCreateItem(
            null
          )
        }
        onCreate={(payload) =>
          handleCreateNew(
            createItem,
            payload
          )
        }
      />
    </div>
  );
}

// ============================================================
// MULTI PRODUCT SELECTOR
// ============================================================

interface MultiProductSelectorProps {
  row: any;

  candidates: any[];

  selectedProducts:
    MappingSelection[];

  isProductSelected: (
    row: any,
    product: any
  ) => boolean;

  onToggle: (
    row: any,
    product: any
  ) => void;

  onClose: () => void;

  onConfirm: (
    selected: MappingSelection[]
  ) => void;

  onSearchProducts?: (
    query: string
  ) => Promise<any[]>;
}

function MultiProductSelector({
  row,
  candidates,
  selectedProducts,
  isProductSelected,
  onToggle,
  onClose,
  onConfirm,
  onSearchProducts,
}: MultiProductSelectorProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

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

  // ==========================================================
  // SUGGESTIONS
  // ==========================================================

  const suggestions =
    useMemo(() => {
      if (
        !Array.isArray(
          candidates
        )
      ) {
        return [];
      }

      return candidates
        .map(
          (candidate: any) => {
            const product =
              candidate?.item ||
              candidate;

            return {
              ...product,

              confidence:
                candidate?.confidence ??
                candidate?.score ??
                product?.confidence ??
                0,
            };
          }
        )
        .filter(
          (item: any) =>
            item?.id != null
        );
    }, [candidates]);

  // ==========================================================
  // OPEN
  // ==========================================================

  const handleOpen = () => {
    const next =
      !open;

    setOpen(
      next
    );

    if (next) {
      setResults(
        suggestions
      );

      setQuery("");
    }
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch =
    async () => {
      const search =
        query.trim();

      if (!search) {
        setResults(
          suggestions
        );

        return;
      }

      if (
        !onSearchProducts
      ) {
        message.error(
          "Search function is not configured"
        );

        return;
      }

      setSearching(
        true
      );

      try {
        const data =
          await onSearchProducts(
            search
          );

        setResults(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (
        error
      ) {
        console.error(
          "Petpooja search error:",
          error
        );

        message.error(
          "Failed to search Petpooja items"
        );

        setResults(
          []
        );
      } finally {
        setSearching(
          false
        );
      }
    };

  // ==========================================================
  // SELECT
  // ==========================================================

  const handleToggle =
    (product: any) => {
      onToggle(
        row,
        product
      );
    };

  // ==========================================================
  // CONFIRM
  // ==========================================================

  const handleConfirm =
    () => {
      if (
        selectedProducts.length ===
        0
      ) {
        message.warning(
          "Select at least one product"
        );

        return;
      }

      onConfirm(
        selectedProducts
      );

      /*
       * Only close after
       * parent accepts selection.
       */

      setOpen(
        false
      );

      setQuery("");
      setResults([]);
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      className="
        min-w-0
        space-y-2
      "
    >
      {/* SELECTED PRODUCTS */}

      {selectedProducts.length >
        0 && (
        <div
          className="
            rounded-lg
            border
            border-orange-100
            bg-orange-50
            p-2
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
            <span
              className="
                text-[10px]
                font-semibold
                text-orange-700
              "
            >
              Selected{" "}
              {
                selectedProducts.length
              }
            </span>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                text-[10px]
                text-slate-400
                hover:text-slate-700
              "
            >
              Clear
            </button>
          </div>

          <div
            className="
              space-y-1
            "
          >
            {selectedProducts.map(
              (
                selected,
                index
              ) => (
                <div
                  key={
                    selected.id ??
                    index
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    rounded
                    bg-white
                    px-2
                    py-1.5
                    ring-1
                    ring-orange-100
                  "
                >
                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        truncate
                        text-[11px]
                        font-semibold
                        text-slate-800
                      "
                    >
                      {
                        selected
                          .item
                          ?.itemName ||
                        selected
                          .item
                          ?.name ||
                        "Unnamed"
                      }
                    </p>

                    <p
                      className="
                        text-[9px]
                        text-slate-400
                      "
                    >
                      ID{" "}
                      {
                        selected.id
                      }{" "}
                      ·{" "}
                      {
                        selected
                          .item
                          ?.itemCode ||
                        "—"
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onToggle(
                        row,
                        selected.item
                      )
                    }
                    className="
                      shrink-0
                      text-xs
                      font-bold
                      text-red-500
                    "
                  >
                    ✕
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* DROPDOWN */}

      <Dropdown
        open={
          open
        }
        trigger={[
          "click",
        ]}
        placement="bottomLeft"
        onOpenChange={(
          visible
        ) => {
          setOpen(
            visible
          );

          if (
            visible
          ) {
            setResults(
              suggestions
            );
          }
        }}
        dropdownRender={() => (
          <div
            className="
              w-[430px]
              max-w-[calc(100vw-24px)]
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-xl
            "
          >
            {/* SEARCH */}

            <div
              className="
                border-b
                border-slate-100
                bg-slate-50
                p-2
              "
            >
              <div
                className="
                  flex
                  gap-2
                "
              >
                <div
                  className="
                    relative
                    min-w-0
                    flex-1
                  "
                >
                  <SearchOutlined
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    autoFocus
                    value={
                      query
                    }
                    onChange={(
                      e
                    ) =>
                      setQuery(
                        e.target.value
                      )
                    }
                    onKeyDown={(
                      e
                    ) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        handleSearch();
                      }
                    }}
                    placeholder="
                      Search Petpooja item...
                    "
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      py-2
                      pl-9
                      pr-2
                      text-xs
                      outline-none
                      focus:border-orange-400
                      focus:ring-1
                      focus:ring-orange-100
                    "
                  />
                </div>

                <Button
                  type="primary"
                  size="small"
                  loading={
                    searching
                  }
                  onClick={
                    handleSearch
                  }
                  className="
                    !bg-orange-500
                  "
                >
                  Search
                </Button>
              </div>
            </div>

            {/* RESULTS */}

            <div
              className="
                max-h-[330px]
                overflow-y-auto
              "
            >
              {searching && (
                <div
                  className="
                    p-6
                    text-center
                    text-xs
                    text-slate-500
                  "
                >
                  Searching Petpooja...
                </div>
              )}

              {!searching &&
                results.length ===
                  0 && (
                  <div
                    className="
                      p-6
                      text-center
                      text-xs
                      text-slate-400
                    "
                  >
                    {query
                      ? "No Petpooja items found"
                      : "No suggestions available"}
                  </div>
                )}

              {!searching &&
                results.map(
                  (
                    product: any,
                    index: number
                  ) => {
                    const selected =
                      isProductSelected(
                        row,
                        product
                      );

                    const confidence =
                      Number(
                        product?.confidence ??
                          product?.score ??
                          0
                      );

                    return (
                      <button
                        key={
                          product?.id ??
                          index
                        }
                        type="button"
                        onClick={() =>
                          handleToggle(
                            product
                          )
                        }
                        className="
                          flex
                          w-full
                          items-start
                          gap-3
                          border-b
                          border-slate-100
                          px-3
                          py-3
                          text-left
                          transition
                          hover:bg-orange-50
                        "
                      >
                        {/* CHECKBOX */}

                        <div
                          className={[
                            `
                              mt-0.5
                              flex
                              h-4
                              w-4
                              shrink-0
                              items-center
                              justify-center
                              rounded
                              border
                              text-[10px]
                            `,
                            selected
                              ? `
                                border-orange-500
                                bg-orange-500
                                text-white
                              `
                              : `
                                border-slate-300
                                bg-white
                              `,
                          ].join(
                            " "
                          )}
                        >
                          {selected &&
                            "✓"}
                        </div>

                        {/* PRODUCT */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >
                            <p
                              className="
                                min-w-0
                                truncate
                                text-xs
                                font-semibold
                                text-slate-900
                              "
                              title={
                                product.itemName
                              }
                            >
                              {
                                product.itemName ||
                                product.name ||
                                product.description ||
                                "Unnamed"
                              }
                            </p>

                            {confidence >
                              0 && (
                              <span
                                className="
                                  shrink-0
                                  text-[10px]
                                  font-semibold
                                  text-slate-400
                                "
                              >
                                {
                                  confidence
                                }
                                %
                              </span>
                            )}
                          </div>

                          <div
                            className="
                              mt-1
                              flex
                              flex-wrap
                              gap-x-3
                              gap-y-1
                              text-[10px]
                              text-slate-500
                            "
                          >
                            <span>
                              ID{" "}
                              {
                                product.id
                              }
                            </span>

                            {product.itemCode && (
                              <span>
                                {
                                  product.itemCode
                                }
                              </span>
                            )}

                            <span>
                              MRP{" "}
                              {money(
                                product.mrp
                              )}
                            </span>

                            <span>
                              Purchase{" "}
                              {money(
                                product.purchaseRate
                              )}
                            </span>

                            <span>
                              Sales{" "}
                              {money(
                                product.salesRate
                              )}
                            </span>

                            <span>
                              Stock{" "}
                              {getStock(
                                product
                              )}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-t
                border-slate-100
                bg-slate-50
                p-2
              "
            >
              <span
                className="
                  text-[10px]
                  text-slate-500
                "
              >
                {
                  selectedProducts.length
                }{" "}
                selected
              </span>

              <Space
                size={4}
              >
                <Button
                  size="small"
                  onClick={() => {
                    setOpen(
                      false
                    );

                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="primary"
                  size="small"
                  disabled={
                    selectedProducts.length ===
                    0
                  }
                  onClick={
                    handleConfirm
                  }
                  className="
                    !bg-orange-500
                  "
                >
                  Select{" "}
                  {
                    selectedProducts.length
                  }
                </Button>
              </Space>
            </div>
          </div>
        )}
      >
        <button
          type="button"
          onClick={
            handleOpen
          }
          className="
            flex
            w-full
            min-w-0
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            py-2
            text-left
            transition
            hover:border-orange-300
            hover:bg-orange-50
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                truncate
                text-xs
                font-semibold
                text-slate-700
              "
            >
              {selectedProducts.length >
              0
                ? `${selectedProducts.length} Petpooja item(s) selected`
                : "Select Petpooja item(s)"}
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-slate-400
              "
            >
              Click to search or
              select multiple
            </p>
          </div>

          <span
            className="
              shrink-0
              text-xs
              text-slate-400
            "
          >
            ▼
          </span>
        </button>
      </Dropdown>
    </div>
  );
}

// ============================================================
// PRODUCT DISPLAY
// ============================================================

function ProductDisplay({
  product,
  confidence,
  showConfidence = false,
}: {
  product: any;
  confidence?: number;
  showConfidence?: boolean;
}) {
  const score =
    Number(
      confidence || 0
    );

  let scoreColor =
    "red";

  if (
    score >= 90
  ) {
    scoreColor =
      "green";
  } else if (
    score >= 60
  ) {
    scoreColor =
      "orange";
  }

  return (
    <div
      className="
        min-w-0
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <p
          className="
            min-w-0
            truncate
            font-semibold
            text-slate-800
          "
          title={
            product?.itemName
          }
        >
          {product?.itemName ||
            product?.name ||
            "-"}
        </p>

        {showConfidence &&
          score > 0 && (
            <Tag
              color={
                scoreColor
              }
              className="mr-0"
            >
              {score}%
            </Tag>
          )}
      </div>

      <div
        className="
          mt-1
          flex
          flex-wrap
          gap-x-3
          gap-y-1
          text-[10px]
          text-slate-400
        "
      >
        <span>
          ID{" "}
          {product?.id}
        </span>

        {product?.itemCode && (
          <span>
            {
              product.itemCode
            }
          </span>
        )}

        <span>
          MRP{" "}
          {money(
            product?.mrp
          )}
        </span>

        <span>
          Stock{" "}
          {getStock(
            product
          )}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// STOCK
// ============================================================

function getStock(
  item: any
) {
  if (!item) {
    return 0;
  }

  return Number(
    item.availableStockQty ??
      item.availableStock?.total ??
      item.stock?.available ??
      item.stock?.total ??
      item.totalStock ??
      item.stock ??
      0
  );
}

// ============================================================
// MONEY
// ============================================================

function money(
  value: any
) {
  const n =
    Number(
      value || 0
    );

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
  ).format(n);
}
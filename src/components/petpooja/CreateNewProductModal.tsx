import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";

import dayjs, { Dayjs } from "dayjs";

import { apiService } from "@/lib/api";

const { Text } = Typography;

/* =========================================================
   TYPES
========================================================= */

interface CreateNewProductModalProps {
  open: boolean;

  invoiceItem?: any;

  onClose: () => void;

  onCreate: (
    payload: any
  ) => Promise<void>;

  loading?: boolean;
}

interface ProductFormValues {
  itemType: string;

  itemName: string;

  itemCode: string;

  unit: string;

  salesUnit?: string;

  description: string;

  barcode: string;

  hsn: string;

  sac: string;

  purchaseRate: number;

  salesRate: number;

  mrp: number;

  gstType: string;

  gstId?: number | null;

  categoryId: number | null;

  groupId: number | null;

  tags: any[];

  openingStockQty: number;

  openingStockRatePerUnit: number;

  openingStockDate: Dayjs;

  minimumStock: number;

  parStock: number;

  salesMargin: number;

  commission: number;

  commissionType: string;

  discountPercentage: number;

  discountAmount: number;

  isTrackable: boolean;

  trackSerialNumber: boolean;

  notForSale: boolean;

  openQtyPopup: boolean;

  openPricePopup: boolean;
}

/* =========================================================
   CONSTANTS
========================================================= */

const ITEM_TYPES = [
  {
    label: "Goods",
    value: "goods",
  },
  {
    label: "Service",
    value: "service",
  },
];

const GST_TYPES = [
  {
    label: "Taxable",
    value: "taxable",
  },
  {
    label: "Non Taxable",
    value: "nonTaxable",
  },
  {
    label: "Non GST Supply",
    value: "nonGstSupply",
  },
  {
    label: "Out of Scope",
    value: "outOfScope",
  },
];

const COMMISSION_TYPES = [
  {
    label: "Amount",
    value: "amount",
  },
  {
    label: "Percentage",
    value: "percentage",
  },
];

const FALLBACK_UNITS = [
  "UNITS",
  "BAG",
  "BALE",
  "BUNDLES",
  "BOX",
  "BOTTLES",
  "BUNCHES",
  "CANS",
  "CARTON",
  "DOZEN",
  "GRAMS",
  "KGS",
  "KILOLITER",
  "ML",
  "METERS",
  "NOS",
  "PACK",
  "PCS",
  "PAIR",
  "ROLLS",
  "SET",
  "TABLETS",
  "TONNES",
  "TUBES",
  "LTR",
];

/* =========================================================
   HELPERS
========================================================= */

function numberValue(
  value: any
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function calculateMargin(
  purchase: number,
  sales: number
): number {
  if (
    purchase <= 0 ||
    sales <= 0
  ) {
    return 0;
  }

  return Number(
    (
      ((sales - purchase) /
        purchase) *
      100
    ).toFixed(2)
  );
}

function unwrapMasterData(
  response: any
): any {
  const first =
    response?.data ??
    response;

  return (
    first?.data ??
    first
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CreateNewProductModal({
  open,
  invoiceItem,
  onClose,
  onCreate,
  loading = false,
}: CreateNewProductModalProps) {
  const [form] =
    Form.useForm<ProductFormValues>();

  const [
    masterLoading,
    setMasterLoading,
  ] = useState(false);

  const [
    masterData,
    setMasterData,
  ] = useState<any>(null);

  const [
    gstType,
    setGstType,
  ] = useState(
    "taxable"
  );

  const [
    purchaseRate,
    setPurchaseRate,
  ] = useState(0);

  const [
    salesRate,
    setSalesRate,
  ] = useState(0);

  /* =======================================================
     LOAD MASTER DATA
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    loadMasterData();
  }, [open]);

  const loadMasterData =
    async () => {
      try {
        setMasterLoading(true);

        const response =
          await apiService.getPetpoojaMasterData();

        console.log(
          "[Create Product] Master Data:",
          response
        );

        const data =
          unwrapMasterData(
            response
          );

        setMasterData(data);
      } catch (error) {
        console.error(
          "[Create Product] Master data error:",
          error
        );

        message.error(
          "Failed to load Petpooja master data"
        );
      } finally {
        setMasterLoading(false);
      }
    };

  /* =======================================================
     MASTER DATA
  ======================================================= */

  const categories =
    useMemo(() => {
      const value =
        masterData?.categories ??
        masterData?.category ??
        [];

      return Array.isArray(value)
        ? value
        : [];
    }, [masterData]);

  const groups =
    useMemo(() => {
      const value =
        masterData?.groups ??
        masterData?.group ??
        [];

      return Array.isArray(value)
        ? value
        : [];
    }, [masterData]);

  const tags =
    useMemo(() => {
      const value =
        masterData?.productTags ??
        [];

      return Array.isArray(value)
        ? value
        : [];
    }, [masterData]);

  const units =
    useMemo(() => {
      const value =
        masterData?.units ??
        masterData?.itemUnits ??
        masterData?.unitList ??
        [];

      return Array.isArray(value)
        ? value
        : [];
    }, [masterData]);

  /* =======================================================
     CATEGORY OPTIONS
  ======================================================= */

  const categoryOptions =
    useMemo(() => {
      return categories
        .filter(
          (item: any) =>
            item?.isActive !==
            false
        )
        .map(
          (item: any) => ({
            label:
              item?.name ??
              item?.categoryName ??
              String(item?.id),

            value: item?.id,
          })
        )
        .filter(
          (item: any) =>
            item.value
        );
    }, [categories]);

  /* =======================================================
     GROUP OPTIONS
  ======================================================= */

  const groupOptions =
    useMemo(() => {
      return groups
        .filter(
          (item: any) =>
            item?.isActive !==
            false
        )
        .map(
          (item: any) => ({
            label:
              item?.name ??
              item?.groupName ??
              String(item?.id),

            value: item?.id,
          })
        )
        .filter(
          (item: any) =>
            item.value
        );
    }, [groups]);

  /* =======================================================
     UNIT OPTIONS
  ======================================================= */

  const unitOptions =
    useMemo(() => {
      if (
        units.length > 0
      ) {
        return units
          .map(
            (item: any) => {
              if (
                typeof item ===
                "string"
              ) {
                return {
                  label: item,
                  value: item,
                };
              }

              const code =
                item?.code ??
                item?.unitCode ??
                item?.value;

              const name =
                item?.name ??
                item?.unitName ??
                item?.label;

              if (
                code &&
                name
              ) {
                return {
                  label: `${code} - ${name}`,
                  value: code,
                };
              }

              return {
                label:
                  name ??
                  code,

                value:
                  code ??
                  name,
              };
            }
          )
          .filter(
            (item: any) =>
              item?.value
          );
      }

      return FALLBACK_UNITS.map(
        (unit) => ({
          label: unit,
          value: unit,
        })
      );
    }, [units]);

  /* =======================================================
     GST MASTER DATA
  ======================================================= */

  const taxGroups =
    useMemo(() => {
      const possible =
        masterData?.taxes?.groups ??
        masterData?.taxGroups ??
        masterData?.gstGroups ??
        masterData?.taxGroup ??
        masterData?.gst ??
        [];

      return Array.isArray(
        possible
      )
        ? possible
        : [];
    }, [masterData]);

  useEffect(() => {
    if (!masterData) {
      return;
    }

    console.log(
      "[GST] Master GST Data:",
      taxGroups
    );
  }, [
    masterData,
    taxGroups,
  ]);

  /* =======================================================
     GST OPTIONS
  ======================================================= */

  const gstOptions =
    useMemo(() => {
      if (
        !taxGroups.length
      ) {
        return [];
      }

      const result: any[] =
        [];

      const seen =
        new Set<string>();

      taxGroups.forEach(
        (group: any) => {
          const specification =
            String(
              group?.taxSpecification ??
                group?.type ??
                ""
            ).toLowerCase();

          /*
           * Prefer INTRA GST groups.
           */
          if (
            specification &&
            ![
              "intra",
              "intrastate",
              "intra_state",
            ].includes(
              specification
            )
          ) {
            return;
          }

          const taxes =
            Array.isArray(
              group?.taxes
            )
              ? group.taxes
              : [];

          let rate =
            numberValue(
              group?.rate ??
                group?.gstRate ??
                group?.percentage ??
                group?.taxRate
            );

          /*
           * Derive total GST from
           * CGST + SGST.
           */
          if (
            rate === 0 &&
            taxes.length
          ) {
            const cgst =
              taxes.find(
                (tax: any) =>
                  String(
                    tax?.taxType ??
                      tax?.type ??
                      ""
                  ).toLowerCase() ===
                  "cgst"
              );

            const sgst =
              taxes.find(
                (tax: any) =>
                  String(
                    tax?.taxType ??
                      tax?.type ??
                      ""
                  ).toLowerCase() ===
                  "sgst"
              );

            rate =
              numberValue(
                cgst?.rate
              ) +
              numberValue(
                sgst?.rate
              );
          }

          /*
           * Extract rate from name
           *
           * Example:
           * GST 18%
           */
          if (
            rate === 0
          ) {
            const match =
              String(
                group?.name ??
                  ""
              ).match(
                /(\d+(?:\.\d+)?)/
              );

            if (match) {
              rate =
                Number(
                  match[1]
                );
            }
          }

          const key =
            `${group?.id}-${rate}`;

          if (
            !seen.has(key)
          ) {
            seen.add(key);

            result.push({
              label:
                group?.name ??
                `GST ${rate}%`,

              value:
                group?.id,

              rate,

              group,
            });
          }
        }
      );

      return result.sort(
        (
          a,
          b
        ) =>
          a.rate -
          b.rate
      );
    }, [taxGroups]);

  /* =======================================================
     SELECTED GST
  ======================================================= */

  const selectedGstId =
    Form.useWatch(
      "gstId",
      form
    );

  const selectedGst =
    useMemo(() => {
      return gstOptions.find(
        (item: any) =>
          item.value ===
          selectedGstId
      );
    }, [
      gstOptions,
      selectedGstId,
    ]);

  /* =======================================================
     GST TAX IDs
  ======================================================= */

  const gstTaxIds =
    useMemo(() => {
      if (
        !selectedGst
      ) {
        return {
          intraGstTaxId:
            null,

          interGstTaxId:
            null,

          rate: 0,
        };
      }

      const group =
        selectedGst.group;

      const taxes =
        Array.isArray(
          group?.taxes
        )
          ? group.taxes
          : [];

      const cgst =
        taxes.find(
          (tax: any) =>
            String(
              tax?.taxType ??
                tax?.type ??
                ""
            ).toLowerCase() ===
            "cgst"
        );

      const sgst =
        taxes.find(
          (tax: any) =>
            String(
              tax?.taxType ??
                tax?.type ??
                ""
            ).toLowerCase() ===
            "sgst"
        );

      const selectedRate =
        numberValue(
          selectedGst.rate
        );

      /*
       * Find matching INTER GST.
       */
      let interGroup:
        | any
        | null = null;

      for (
        const candidate of taxGroups
      ) {
        const specification =
          String(
            candidate?.taxSpecification ??
              candidate?.type ??
              ""
          ).toLowerCase();

        if (
          ![
            "inter",
            "interstate",
            "inter_state",
          ].includes(
            specification
          )
        ) {
          continue;
        }

        const candidateTaxes =
          Array.isArray(
            candidate?.taxes
          )
            ? candidate.taxes
            : [];

        const igst =
          candidateTaxes.find(
            (tax: any) =>
              String(
                tax?.taxType ??
                  tax?.type ??
                  ""
              ).toLowerCase() ===
              "igst"
          );

        const igstRate =
          numberValue(
            igst?.rate ??
              candidate?.rate ??
              candidate?.gstRate
          );

        if (
          igstRate ===
          selectedRate
        ) {
          interGroup =
            candidate;

          break;
        }
      }

      const interTaxes =
        Array.isArray(
          interGroup?.taxes
        )
          ? interGroup.taxes
          : [];

      const igst =
        interTaxes.find(
          (tax: any) =>
            String(
              tax?.taxType ??
                tax?.type ??
                ""
            ).toLowerCase() ===
            "igst"
        );

      return {
        /*
         * Your existing payload uses
         * intraGstTaxId.
         *
         * Prefer CGST.
         */
        intraGstTaxId:
          cgst?.id ??
          sgst?.id ??
          group?.id ??
          null,

        interGstTaxId:
          igst?.id ??
          interGroup?.id ??
          null,

        rate:
          selectedRate,
      };
    }, [
      selectedGst,
      taxGroups,
    ]);

  /* =======================================================
     MARGIN
  ======================================================= */

  const margin =
    useMemo(
      () =>
        calculateMargin(
          purchaseRate,
          salesRate
        ),
      [
        purchaseRate,
        salesRate,
      ]
    );

  /* =======================================================
     INITIAL VALUES
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const itemName =
      invoiceItem?.itemName ??
      invoiceItem?.name ??
      invoiceItem?.description ??
      "";

    const itemCode =
      invoiceItem?.itemCode ??
      invoiceItem?.code ??
      "";

    const purchase =
      numberValue(
        invoiceItem?.purchaseRate ??
          invoiceItem?.rate ??
          0
      );

    const quantity =
      numberValue(
        invoiceItem?.quantity ??
          invoiceItem?.qty ??
          0
      );

    const mrp =
      numberValue(
        invoiceItem?.mrp
      );

    form.setFieldsValue({
      itemType:
        "goods",

      itemName,

      itemCode,

      unit:
        "UNITS",

      salesUnit:
        "UNITS",

      description:
        invoiceItem?.description ??
        "",

      barcode:
        invoiceItem?.barcode ??
        "",

      hsn:
        invoiceItem?.hsn ??
        "",

      sac:
        "",

      purchaseRate:
        purchase,

      salesRate:
        0,

      mrp,

      gstType:
        "taxable",

      gstId:
        null,

      categoryId:
        null,

      groupId:
        null,

      tags:
        [],

      openingStockQty:
        quantity,

      openingStockRatePerUnit:
        purchase,

      openingStockDate:
        dayjs(),

      minimumStock:
        0,

      parStock:
        0,

      salesMargin:
        0,

      commission:
        0,

      commissionType:
        "amount",

      discountPercentage:
        0,

      discountAmount:
        0,

      isTrackable:
        true,

      trackSerialNumber:
        false,

      notForSale:
        false,

      openQtyPopup:
        false,

      openPricePopup:
        false,
    });

    setPurchaseRate(
      purchase
    );

    setSalesRate(0);

    setGstType(
      "taxable"
    );
  }, [
    open,
    invoiceItem,
    form,
  ]);

  /* =======================================================
     MARGIN UPDATE
  ======================================================= */

  useEffect(() => {
    form.setFieldValue(
      "salesMargin",
      margin
    );
  }, [
    margin,
    form,
  ]);

  /* =======================================================
     PURCHASE RATE
  ======================================================= */

  const handlePurchaseChange =
    (
      value:
        | number
        | null
    ) => {
      const rate =
        numberValue(value);

      setPurchaseRate(
        rate
      );

      form.setFieldValue(
        "purchaseRate",
        rate
      );

      form.setFieldValue(
        "openingStockRatePerUnit",
        rate
      );
    };

  /* =======================================================
     SALES RATE
  ======================================================= */

  const handleSalesChange =
    (
      value:
        | number
        | null
    ) => {
      const rate =
        numberValue(value);

      setSalesRate(
        rate
      );

      form.setFieldValue(
        "salesRate",
        rate
      );
    };

  /* =======================================================
     GST TYPE
  ======================================================= */

  const handleGstTypeChange =
    (
      value: string
    ) => {
      setGstType(
        value
      );

      form.setFieldValue(
        "gstType",
        value
      );

      if (
        value !==
        "taxable"
      ) {
        form.setFieldValue(
          "gstId",
          null
        );
      }
    };

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate =
    async () => {
      try {
        const values =
          await form.validateFields();

        /*
         * Validate category
         */
        if (
          !values.categoryId
        ) {
          message.error(
            "Please select category"
          );

          return;
        }

        /*
         * Validate group
         */
        if (
          !values.groupId
        ) {
          message.error(
            "Please select group"
          );

          return;
        }

        let intraGstTaxId:
          number | null =
          null;

        let interGstTaxId:
          number | null =
          null;

        /*
         * GST only required for
         * taxable products.
         */
        if (
          values.gstType ===
          "taxable"
        ) {
          if (
            !values.gstId
          ) {
            message.error(
              "Please select GST rate"
            );

            return;
          }

          intraGstTaxId =
            gstTaxIds.intraGstTaxId;

          interGstTaxId =
            gstTaxIds.interGstTaxId;

          if (
            !intraGstTaxId ||
            !interGstTaxId
          ) {
            console.error(
              "GST mapping failed",
              {
                selectedGst,
                gstTaxIds,
              }
            );

            message.error(
              "GST IDs could not be resolved from master data"
            );

            return;
          }
        }

        /*
         * FINAL PAYLOAD
         */
        const payload = {
          alternateUnits:
            [],

          itemType:
            values.itemType,

          itemName:
            values.itemName.trim(),

          itemCode:
            values.itemCode.trim(),

          unit:
            values.unit,

          description:
            values.description ||
            "",

          barcode:
            values.barcode ||
            "",

          hsn:
            values.hsn ||
            "",

          salesMargin:
            Number(
              margin || 0
            ),

          commission:
            numberValue(
              values.commission
            ),

          commissionType:
            values.commissionType ||
            "amount",

          notForSale:
            Boolean(
              values.notForSale
            ),

          sac:
            values.sac ||
            "",

          openQtyPopup:
            Boolean(
              values.openQtyPopup
            ),

          openPricePopup:
            Boolean(
              values.openPricePopup
            ),

          salesRate:
            numberValue(
              values.salesRate
            ),

          purchaseRate:
            numberValue(
              values.purchaseRate
            ),

          mrp:
            numberValue(
              values.mrp
            ),

          discountPercentage:
            numberValue(
              values.discountPercentage
            ),

          discountAmount:
            numberValue(
              values.discountAmount
            ),

          gstType:
            values.gstType,

          interGstTaxId,

          intraGstTaxId,

          isTrackable:
            Boolean(
              values.isTrackable
            ),

          openingStockQty:
            numberValue(
              values.openingStockQty
            ),

          openingStockRatePerUnit:
            numberValue(
              values.openingStockRatePerUnit
            ),

          openingStockDate:
            values.openingStockDate.format(
              "YYYY-MM-DD"
            ),

          minimumStock:
            numberValue(
              values.minimumStock
            ),

          parStock:
            numberValue(
              values.parStock
            ),

          categoryId:
            values.categoryId,

          groupId:
            values.groupId,

          itemImage:
            "",

          tags:
            values.tags ||
            [],

          serialNumbers:
            [],

          trackSerialNumber:
            Boolean(
              values.trackSerialNumber
            ),
        };

        console.log(
          "CREATE PRODUCT PAYLOAD",
          payload
        );

        await onCreate(
          payload
        );
      } catch (error: any) {
        if (
          error?.errorFields
        ) {
          return;
        }

        console.error(
          "[Create Product]",
          error
        );

        message.error(
          error?.message ??
            "Failed to create product"
        );
      }
    };

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose =
    () => {
      form.resetFields();

      onClose();
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Modal
      open={open}
      onCancel={
        handleClose
      }
      destroyOnClose
      width={980}
      centered
      title={
        <div>
          <div className="text-lg font-bold text-slate-950">
            Create New Product
          </div>

          <div className="text-xs font-normal text-slate-500">
            Create and map a new
            Petpooja item
          </div>
        </div>
      }
      styles={{
        body: {
          padding:
            "4px 2px 8px",
        },
      }}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            onClick={
              handleClose
            }
          >
            Cancel
          </Button>

          <Button
            type="primary"
            loading={loading}
            onClick={
              handleCreate
            }
          >
            Create & Map Product
          </Button>
        </div>
      }
    >
      {/* =================================================
          INVOICE INFORMATION
      ================================================= */}

      <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Creating Product For Invoice
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <p className="text-[10px] text-slate-400">
                  Invoice
                </p>

                <p className="font-bold text-slate-950">
                  {invoiceItem?.invoiceNumber ||
                    invoiceItem?.invoice_no ||
                    invoiceItem?.invoice?.invoice_no ||
                    "—"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">
                  Invoice Item
                </p>

                <p className="max-w-[300px] truncate font-bold text-slate-950">
                  {invoiceItem?.description ||
                    invoiceItem?.itemName ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">
                  Quantity
                </p>

                <p className="font-bold text-slate-950">
                  {invoiceItem?.quantity ??
                    invoiceItem?.qty ??
                    0}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-orange-100">
            <p className="text-[10px] font-medium uppercase text-slate-400">
              Invoice Purchase Rate
            </p>

            <p className="text-base font-bold text-orange-600">
              ₹
              {numberValue(
                invoiceItem?.purchaseRate ??
                  invoiceItem?.rate
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {masterLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Space direction="vertical">
            <Spin size="large" />

            <Text type="secondary">
              Loading Petpooja master data...
            </Text>
          </Space>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <SectionTitle
            title="Basic Information"
            description="Required product details"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Row gutter={[12, 2]}>
              <Col
                xs={24}
                sm={6}
              >
                <Form.Item
                  label="Item Type *"
                  name="itemType"
                  rules={[
                    {
                      required: true,
                      message:
                        "Item type is required",
                    },
                  ]}
                >
                  <Select
                    options={
                      ITEM_TYPES
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                sm={9}
              >
                <Form.Item
                  label="Item Name *"
                  name="itemName"
                  rules={[
                    {
                      required: true,
                      message:
                        "Item name is required",
                    },
                  ]}
                >
                  <Input
                    placeholder="Product name"
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                sm={9}
              >
                <Form.Item
                  label="Item Code *"
                  name="itemCode"
                  rules={[
                    {
                      required: true,
                      message:
                        "Item code is required",
                    },
                  ]}
                >
                  <Input
                    placeholder="Item code"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 2]}>
              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Purchase Unit *"
                  name="unit"
                  rules={[
                    {
                      required: true,
                      message:
                        "Purchase unit is required",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={
                      unitOptions
                    }
                    placeholder="Select unit"
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Sales Unit"
                  name="salesUnit"
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={
                      unitOptions
                    }
                    placeholder="Select"
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Barcode"
                  name="barcode"
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="HSN"
                  name="hsn"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              className="mb-1"
            >
              <Input.TextArea
                rows={2}
                placeholder="Optional description"
              />
            </Form.Item>
          </div>

          {/* =================================================
              CLASSIFICATION
          ================================================= */}

          <SectionTitle
            title="Classification"
            description="Select values from Petpooja master data"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Row gutter={[12, 2]}>
              <Col
                xs={24}
                sm={12}
              >
                <Form.Item
                  label="Category *"
                  name="categoryId"
                  rules={[
                    {
                      required: true,
                      message:
                        "Category is required",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    placeholder="Search category..."
                    options={
                      categoryOptions
                    }
                    notFoundContent="No categories"
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                sm={12}
              >
                <Form.Item
                  label="Group *"
                  name="groupId"
                  rules={[
                    {
                      required: true,
                      message:
                        "Group is required",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    placeholder="Search group..."
                    options={
                      groupOptions
                    }
                    notFoundContent="No groups"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Tags"
              name="tags"
              className="mb-1"
            >
              <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                placeholder="Select tags"
                options={tags.map(
                  (
                    tag: any
                  ) => ({
                    label:
                      tag?.name ??
                      tag?.label ??
                      String(
                        tag?.id ??
                          tag
                      ),

                    value:
                      tag?.id ??
                      tag?.value ??
                      tag?.name ??
                      tag,
                  })
                )}
              />
            </Form.Item>
          </div>

          {/* =================================================
              PRICING
          ================================================= */}

          <SectionTitle
            title="Pricing"
            description="Purchase, selling price, margin and GST"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Row gutter={[12, 6]}>
              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-700">
                      Purchase Rate *
                    </span>
                  }
                  name="purchaseRate"
                  rules={[
                    {
                      required: true,
                      message:
                        "Purchase rate is required",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    prefix="₹"
                    style={{
                      width:
                        "100%",
                    }}
                    onChange={
                      handlePurchaseChange
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-700">
                      Sales Rate *
                    </span>
                  }
                  name="salesRate"
                  rules={[
                    {
                      required: true,
                      message:
                        "Sales rate is required",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    prefix="₹"
                    style={{
                      width:
                        "100%",
                    }}
                    onChange={
                      handleSalesChange
                    }
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-700">
                      MRP
                    </span>
                  }
                  name="mrp"
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    prefix="₹"
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>

              {/* MARGIN */}
              <Col
                xs={12}
                sm={6}
              >
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Margin
                  </p>

                  <div
                    className={[
                      "flex h-8 items-center justify-center rounded-lg border",
                      margin >= 0
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-base font-bold",
                        margin >= 0
                          ? "text-green-700"
                          : "text-red-700",
                      ].join(" ")}
                    >
                      {margin.toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                </div>
              </Col>
            </Row>

            {/* GST COMPACT */}
            <div className="mt-1 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    GST
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Petpooja master data
                  </p>
                </div>

                {selectedGst && (
                  <Tag
                    color="blue"
                    className="m-0 font-bold"
                  >
                    GST{" "}
                    {
                      selectedGst.rate
                    }
                    %
                  </Tag>
                )}
              </div>

              <Row gutter={10}>
                <Col
                  xs={12}
                  sm={8}
                >
                  <Form.Item
                    name="gstType"
                    label={
                      <span className="text-xs font-semibold text-slate-600">
                        GST Type
                      </span>
                    }
                    className="mb-0"
                  >
                    <Select
                      options={
                        GST_TYPES
                      }
                      onChange={
                        handleGstTypeChange
                      }
                    />
                  </Form.Item>
                </Col>

                {gstType ===
                  "taxable" && (
                  <Col
                    xs={12}
                    sm={8}
                  >
                    <Form.Item
                      name="gstId"
                      label={
                        <span className="text-xs font-semibold text-slate-600">
                          GST Rate *
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message:
                            "GST is required",
                        },
                      ]}
                      className="mb-0"
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="Select GST"
                        options={
                          gstOptions
                        }
                      />
                    </Form.Item>
                  </Col>
                )}

                {/* {gstType ===
                  "taxable" && (
                  <Col
                    xs={24}
                    sm={8}
                  >
                    <div className="mt-1 rounded-lg bg-white px-3 py-2 ring-1 ring-blue-100">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">
                          Intra GST
                        </span>

                        <span className="font-semibold text-slate-700">
                          {gstTaxIds.intraGstTaxId ??
                            "—"}
                        </span>
                      </div>

                      <div className="mt-1 flex justify-between text-[11px]">
                        <span className="text-slate-400">
                          Inter GST
                        </span>

                        <span className="font-semibold text-slate-700">
                          {gstTaxIds.interGstTaxId ??
                            "—"}
                        </span>
                      </div>
                    </div>
                  </Col>
                )} */}
              </Row>

              {gstType ===
                "taxable" &&
                !gstOptions.length && (
                  <Alert
                    className="mt-2"
                    type="warning"
                    showIcon
                    message="GST master data not available"
                    description="Check the response from /petpooja/master-data/active."
                  />
                )}
            </div>
          </div>

          {/* =================================================
              INVENTORY
          ================================================= */}

          <SectionTitle
            title="Inventory"
            description="Opening stock and stock controls"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Row gutter={[12, 2]}>
              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Opening Stock *"
                  name="openingStockQty"
                  rules={[
                    {
                      required: true,
                      message:
                        "Opening stock is required",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={3}
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Opening Cost / Unit *"
                  name="openingStockRatePerUnit"
                  rules={[
                    {
                      required: true,
                      message:
                        "Opening cost is required",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    prefix="₹"
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Stock Start Date *"
                  name="openingStockDate"
                  rules={[
                    {
                      required: true,
                      message:
                        "Stock date is required",
                    },
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Minimum Stock"
                  name="minimumStock"
                >
                  <InputNumber
                    min={0}
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 2]}>
              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="PAR Stock"
                  name="parStock"
                >
                  <InputNumber
                    min={0}
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* =================================================
              OTHER DETAILS
          ================================================= */}

          <SectionTitle
            title="Other Details"
            description="Optional product settings"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <Row gutter={[12, 2]}>
              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Trackable"
                  name="isTrackable"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Track Serial"
                  name="trackSerialNumber"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Not For Sale"
                  name="notForSale"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Commission Type"
                  name="commissionType"
                >
                  <Select
                    options={
                      COMMISSION_TYPES
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 2]}>
              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Commission"
                  name="commission"
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{
                      width:
                        "100%",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="SAC"
                  name="sac"
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Open Qty Popup"
                  name="openQtyPopup"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col
                xs={12}
                sm={6}
              >
                <Form.Item
                  label="Open Price Popup"
                  name="openPricePopup"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      )}
    </Modal>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-3">
      <div className="h-5 w-1 rounded-full bg-orange-500" />

      <div className="shrink-0">
        <h3 className="text-base font-bold tracking-tight text-slate-950">
          {title}
        </h3>

        {description && (
          <p className="text-[11px] text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
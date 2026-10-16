

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

import PurchaseProgress from "@/components/petpooja/PurchaseProgress";
import type { PurchaseStep } from "@/components/petpooja/PurchaseProgress";
import ReviewItemsStep from "@/components/petpooja/ReviewItemsStep";

import ProductMappingStep from "@/components/petpooja/ProductMappingStep";

import PurchaseReviewStep from "@/components/petpooja/PurchaseReviewStep";

import CreatePurchaseStep from "@/components/petpooja/CreatePurchaseStep";
import type { Supplier } from "@/lib/interface";

type AuthStep =
  | "checking"
  | "login"
  | "otp"
  | "list";

interface Invoice {
  id: string;

  invoice_no?: string;
  invoice_number?: string;
  invoiceNo?: string;

  invoice_date?: string;
  date?: string;

  seller?: any;
  buyer?: any;
  supplier?: any;
  supplier_name?: string;

  [key: string]: any;
}



export default function PetpoojaPurchase() {
  /*
   * ==========================================================
   * WORKFLOW
   * ==========================================================
   */

  const [purchaseStep, setPurchaseStep] =
    useState<PurchaseStep>(1);

  const [completedSteps, setCompletedSteps] =
    useState<number[]>([]);

  const [purchaseItems, setPurchaseItems] =
    useState<any[]>([]);

  /*
   * ==========================================================
   * AUTH
   * ==========================================================
   */

  const [step, setStep] =
    useState<AuthStep>("checking");

  const [mobile, setMobile] =
    useState(
      () =>
        localStorage.getItem(
          "petpooja_mobile"
        ) || ""
    );

  const [otp, setOtp] =
    useState("");

  const [petpoojaUser, setPetpoojaUser] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * INVOICES
   * ==========================================================
   */

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [selectedInvoice, setSelectedInvoice] =
    useState<any>(null);

  const [loadingInvoices, setLoadingInvoices] =
    useState(false);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  /*
   * ==========================================================
   * MAPPING
   * ==========================================================
   */

  const [mappingData, setMappingData] =
    useState<any>(null);

    console.log("mappingData", mappingData);

  const [mappingLoading, setMappingLoading] =
    useState(false);

  const [confirmingId, setConfirmingId] =
    useState<number | null>(null);


    const [suppliers, setSuppliers] =
  useState<Supplier[]>([]);

const [selectedSupplier, setSelectedSupplier] =
  useState<Supplier | null>(null);

const [loadingSuppliers, setLoadingSuppliers] =
  useState(false);
  /*
   * ==========================================================
   * CREATE BILL
   * ==========================================================
   */

  const [submittingPurchase, setSubmittingPurchase] =
    useState(false);

  /*
   * ==========================================================
   * INITIAL AUTH
   * ==========================================================
   */

  useEffect(() => {
    checkPetpoojaAuth();
  }, []);


  const loadSuppliers = async () => {
  setLoadingSuppliers(true);

  try {
    const response =
      await apiService.getPetpoojaSuppliers(
        1,
        100
      );

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Failed to load suppliers"
      );
    }

    const list =
      response?.data || [];

    setSuppliers(
      Array.isArray(list)
        ? list
        : []
    );
  } catch (err: any) {
    console.error(
      "Failed to load suppliers:",
      err
    );

    setError(
      err?.message ||
        "Failed to load suppliers"
    );
  } finally {
    setLoadingSuppliers(false);
  }
};
  /*
   * ==========================================================
   * AUTH CHECK
   * ==========================================================
   */

  const checkPetpoojaAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await apiService.checkPetpoojaAuth();

      if (
        response?.success &&
        response?.authenticated
      ) {
        setStep("list");

          await Promise.all([
    loadInvoices(),
    loadSuppliers(),
  ]);
      } else {
        setStep("login");
      }
    } catch (err: any) {
      console.error(
        "Petpooja auth check failed:",
        err
      );

      const message =
        err?.message?.toLowerCase() || "";

      if (
        message.includes("401") ||
        message.includes("unauthorized") ||
        message.includes("authentication") ||
        message.includes("token expired")
      ) {
        localStorage.removeItem(
          "petpooja_authenticated"
        );

        setStep("login");
      } else {
        setError(
          "Unable to connect to Petpooja"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * OTP
   * ==========================================================
   */

  const handleRequestOtp = async () => {
    if (!mobile.trim()) {
      setError(
        "Enter your Petpooja mobile number"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response =
        await apiService.requestPetpoojaOtp(
          mobile.trim()
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to send OTP"
        );
      }

      const user =
        response?.data?.user ||
        response?.data?.data?.user ||
        response?.user;

      if (user) {
        setPetpoojaUser(user);
      }

      localStorage.setItem(
        "petpooja_mobile",
        mobile.trim()
      );

      setStep("otp");
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (!petpoojaUser) {
      setError(
        "Petpooja user information is missing. Please request OTP again."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await apiService.verifyPetpoojaOtp({
          otp: otp.trim(),
          user: petpoojaUser,
          user_contact: mobile.trim(),
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Invalid OTP"
        );
      }

      localStorage.setItem(
        "petpooja_authenticated",
        "true"
      );

      localStorage.setItem(
        "petpooja_mobile",
        mobile.trim()
      );

      setOtp("");

      await Promise.all([
  loadInvoices(),
  loadSuppliers(),
]);

setStep("list");

      setStep("list");
    } catch (err: any) {
      setError(
        err?.message ||
          "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * LOAD INVOICES
   * ==========================================================
   */

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    setError("");

    try {
      const response =
        await apiService.getPetpoojaPurchases(
          1,
          20
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load invoices"
        );
      }

      const data =
        response?.data;

      const list =
        data?.data ||
        data?.invoices ||
        data?.results ||
        [];

      setInvoices(
        Array.isArray(list)
          ? list
          : []
      );
    } catch (err: any) {
      console.error(
        "Failed to load invoices:",
        err
      );

      const status =
        err?.status ??
        err?.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        localStorage.removeItem(
          "petpooja_authenticated"
        );

        setStep("login");

        setInvoices([]);

        setError(
          "Petpooja session expired. Please login again."
        );

        return;
      }

      setError(
        err?.message ||
          "Failed to load invoices"
      );
    } finally {
      setLoadingInvoices(false);
    }
  };

const handleCreateNewProduct = async (
  item: any,
  payload: any
): Promise<void> => {
  try {
    setError("");

    const response =
      await apiService.createPetpoojaItem(
        payload
      );

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Failed to create Petpooja item"
      );
    }

    /*
     * Refresh mapping after creating the item.
     * Backend should now be able to find/map
     * the newly-created Petpooja product.
     */
    await startProductMapping();

  } catch (err: any) {
    console.error(
      "Create Petpooja product failed:",
      err
    );

    setError(
      err?.message ||
        "Failed to create Petpooja product"
    );

    throw err;
  }
};

  /*
   * ==========================================================
   * OPEN INVOICE
   * ==========================================================
   */

  const handleInvoiceClick = async (
    invoice: Invoice
  ) => {
    if (!invoice?.id) {
      setError(
        "Invoice ID is missing"
      );
      return;
    }

    setLoadingDetail(true);
    setError("");
    setMappingData(null);
    setPurchaseItems([]);
    setSelectedSupplier(null);

    try {
      const response =
        await apiService.getPetpoojaPurchaseDetail(
          invoice.id
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load invoice"
        );
      }

      const data =
        response?.data;

      const canonical =
        data?.canonical;

      if (!canonical) {
        throw new Error(
          "Canonical invoice was not generated"
        );
      }

      /*
       * Canonical invoice is now the single source of truth
       * for ReviewItemsStep and product mapping.
       *
       * Keep the selected list invoice and raw response only
       * for downstream compatibility / final bill metadata.
       */
      setSelectedInvoice({
        ...invoice,

        raw:
          data?.raw ||
          invoice,

        canonical,

        stats:
          data?.stats ||
          null,

        validation:
          data?.validation ||
          canonical?.validation ||
          null,
      });

      setPurchaseStep(1);
      setCompletedSteps([]);

    } catch (err: any) {
      console.error(
        "Invoice detail error:",
        err
      );

      const status =
        err?.status ??
        err?.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        localStorage.removeItem(
          "petpooja_authenticated"
        );

        setStep("login");
        setSelectedInvoice(null);

        setError(
          "Petpooja session expired. Please login again."
        );

        return;
      }

      setError(
        err?.message ||
          "Failed to load invoice"
      );

    } finally {
      setLoadingDetail(false);
    }
  };

  /*
   * ==========================================================
   * START MAPPING
   * ==========================================================
   */


const startProductMapping = async (
  productsOverride?: any[]
) => {
  if (!selectedInvoice) {
    return;
  }

  // ==========================================================
  // SUPPLIER IS MANDATORY
  // ==========================================================

  if (!selectedSupplier) {
    setError(
      "Please select a supplier before starting product mapping."
    );
    return;
  }

  // ==========================================================
  // PARTY CODE IS ALSO REQUIRED
  // ==========================================================

  const partyCode =
    selectedSupplier.partyCode
      ?.trim()
      .toUpperCase();

  if (!partyCode) {
    setError(
      `Supplier "${selectedSupplier.name}" does not have a party code. Product mapping cannot continue.`
    );
    return;
  }

  setMappingLoading(true);
  setError("");

  try {
    /*
     * IMPORTANT:
     *
     * When ReviewItemsStep sends productsOverride, that list
     * is the ONLY list sent to /map.
     *
     * This preserves edits and deletions.
     *
     * There is intentionally NO fallback to:
     *   products
     *   extra_products
     *   items
     *
     * This prevents deleted invoice lines from coming back.
     */

    const canonicalLines =
      Array.isArray(
        selectedInvoice?.canonical?.lines
      )
        ? selectedInvoice.canonical.lines
        : [];

    const getValue = (field: any) =>
      field &&
      typeof field === "object" &&
      Object.prototype.hasOwnProperty.call(
        field,
        "value"
      )
        ? field.value
        : field;

    const products =
      productsOverride !== undefined
        ? productsOverride
        : canonicalLines.map(
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

              return {
                description:
                  getValue(
                    product.name
                  ) || "",

                hsn:
                  getValue(
                    product.hsn
                  ) || "",

                quantity:
                  Number(
                    getValue(
                      purchase.quantity
                    ) || 0
                  ),

                rate:
                  Number(
                    getValue(
                      purchase.purchaseRate
                    ) || 0
                  ),

                mrp:
                  Number(
                    getValue(
                      product.mrp
                    ) || 0
                  ),

                gst_rate:
                  Number(
                    getValue(
                      tax.gstRate
                    ) || 0
                  ),

                lineNumber:
                  index + 1,
              };
            }
          );

    if (!Array.isArray(products)) {
      throw new Error(
        "Invoice products not found"
      );
    }

    if (products.length === 0) {
      throw new Error(
        "No invoice products available for mapping"
      );
    }

    console.log(
      "========== PRODUCTS SENT TO /map =========="
    );

    console.log(
      products
    );

    console.log(
      "PRODUCT COUNT:",
      products.length
    );

    const response =
      await apiService.mapPetpoojaPurchase({

        // ======================================================
        // SUPPLIER
        // ======================================================

        supplier: {
          id: selectedSupplier.id,

          name:
            selectedSupplier.name,

          companyName:
            selectedSupplier.companyName,

          partyCode,

          gstn:
            selectedSupplier.gstn,

          mobile:
            selectedSupplier.mobile,
        },

        // ======================================================
        // INVOICE
        // ======================================================

        invoice: {
          products:
            products.map(
              (product: any) => ({
                description:
                  product.description ||
                  "",

                hsn:
                  product.hsn ||
                  "",

                quantity:
                  Number(
                    product.quantity || 0
                  ),

                rate:
                  Number(
                    product.rate || 0
                  ),

                mrp:
                  Number(
                    product.mrp || 0
                  ),

                gst_rate:
                  Number(
                    product.gst_rate ??
                    product.gstRate ??
                    0
                  ),
              })
            ),
        },
      });

    console.log(
      "========== /map RESPONSE =========="
    );

    console.log(
      response
    );

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Product mapping failed"
      );
    }

    setMappingData(
      response.data
    );

    return response.data;

  } catch (err: any) {

    console.error(
      "Mapping error:",
      err
    );

    setError(
      err?.message ||
        "Failed to map products"
    );

    throw err;

  } finally {
    setMappingLoading(false);
  }
};

  /*
   * ==========================================================
   * CONFIRM / CHANGE MAPPING
   * ==========================================================
   */

// ==========================================================
// CONFIRM / CHANGE MAPPING
// ==========================================================

const confirmProductMapping = async (
  item: any,
  petpoojaItemIds: number[]
): Promise<void> => {

  console.log(
    "Selected Petpooja IDs:",
    petpoojaItemIds
  );

  // --------------------------------------------------------
  // VALIDATE IDS
  // --------------------------------------------------------

  if (
    !Array.isArray(petpoojaItemIds) ||
    petpoojaItemIds.length === 0
  ) {
    setError(
      "Please select at least one Petpooja product"
    );

    return;
  }

  // --------------------------------------------------------
  // CLEAN IDS
  // --------------------------------------------------------

  const validIds =
    [
      ...new Set(
        petpoojaItemIds
          .map(Number)
          .filter(
            id =>
              Number.isFinite(id)
          )
      ),
    ];

  if (!validIds.length) {
    setError(
      "Invalid Petpooja product selected"
    );

    return;
  }

  console.log(
    "Valid Petpooja IDs:",
    validIds
  );

  // --------------------------------------------------------
  // LOADING
  // --------------------------------------------------------

  setConfirmingId(
    validIds[0]
  );

  setError("");

  try {

    // ======================================================
    // ONE API CALL
    // ======================================================

    const response =
      await apiService.confirmPetpoojaMapping({

        invoiceProduct:
          item.invoiceProduct,

        petpoojaItemIds:
          validIds,

        supplierPartyCode:
          selectedSupplier?.partyCode ||
          "",

        supplierId:
          selectedSupplier?.id ||
          null,

      });

    console.log(
      "========== MULTI MAPPING RESPONSE =========="
    );

    console.log(
      response
    );

    // ------------------------------------------------------
    // API ERROR
    // ------------------------------------------------------

    if (!response?.success) {

      throw new Error(
        response?.message ||
        "Mapping confirmation failed"
      );
    }

    // ======================================================
    // IMPORTANT
    //
    // ApiResponse<T> stores backend response inside `data`
    //
    // Backend:
    //
    // {
    //   success: true,
    //   mappedItems: [...]
    // }
    //
    // Frontend:
    //
    // response.data.mappedItems
    // ======================================================

    const mappedItems =
      Array.isArray(
        response?.data?.mappedItems
      )
        ? response.data.mappedItems
        : [];

    console.log(
      "Mapped Items:",
      mappedItems
    );

    // ------------------------------------------------------
    // SAFETY CHECK
    // ------------------------------------------------------

    if (!mappedItems.length) {

      throw new Error(
        "Mapping succeeded but no mapped products were returned"
      );
    }

    // ======================================================
    // UPDATE LOCAL MAPPING DATA
    // ======================================================

    setMappingData(
      (previous: any) => {

        if (!previous) {
          return previous;
        }

        const previousMapping =
          previous.mapping || {};

        const previousItems =
          Array.isArray(
            previousMapping.items
          )
            ? previousMapping.items
            : [];

        // --------------------------------------------------
        // UPDATE ONLY CURRENT INVOICE PRODUCT
        // --------------------------------------------------

        const updatedItems =
          previousItems.map(
            (mappingItem: any) => {

              const currentLineNumber =
                mappingItem
                  ?.invoiceProduct
                  ?.lineNumber;

              const selectedLineNumber =
                item
                  ?.invoiceProduct
                  ?.lineNumber;

              const sameItem =
                currentLineNumber ===
                selectedLineNumber;

              if (!sameItem) {
                return mappingItem;
              }

              // ============================================
              // IMPORTANT
              //
              // petpoojaItems is now the SINGLE SOURCE
              // OF TRUTH for multi mapping.
              // ============================================

              return {

                ...mappingItem,

                mapping: {

                  ...mappingItem.mapping,

                  status:
                    "ALREADY_MAPPED",

                  confidence:
                    100,

                  confidenceLabel:
                    "Already Mapped",

                  // ----------------------------------------
                  // Backward compatibility
                  // ----------------------------------------

                  petpoojaItem:
                    mappedItems[0] ||
                    null,

                  // ----------------------------------------
                  // ACTUAL MULTI MAPPING
                  // ----------------------------------------

                  petpoojaItems:
                    mappedItems,

                  reasons: [
                    "mongodb_mapping",
                  ],

                  reason:
                    "Product mapping found in database",

                },

              };

            }
          );

        // --------------------------------------------------
        // COUNT MAPPED INVOICE PRODUCTS
        // --------------------------------------------------

        const alreadyMapped =
          updatedItems.filter(
            (x: any) =>
              x?.mapping?.status ===
              "ALREADY_MAPPED"
          ).length;

        // --------------------------------------------------
        // RETURN UPDATED STATE
        // --------------------------------------------------

        return {

          ...previous,

          mapping: {

            ...previousMapping,

            items:
              updatedItems,

            alreadyMapped,

          },

        };

      }
    );

    console.log(
      "Mapping updated locally:",
      {
        invoiceProduct:
          item.invoiceProduct?.description,

        petpoojaItemIds:
          validIds,

        mappedItems:
          mappedItems.length,
      }
    );

  } catch (error: any) {

    console.error(
      "Multi mapping failed:",
      error
    );

    setError(
      error?.message ||
      "Failed to confirm mapping"
    );

  } finally {

    setConfirmingId(
      null
    );

  }
};

  /*
   * ==========================================================
   * CUSTOM PETPOOJA SEARCH
   *
   * IMPORTANT:
   * Replace this API call with your actual
   * Petpooja search endpoint/function.
   * ==========================================================
   */

const searchPetpoojaProducts = async (
  query: string
): Promise<any[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const response =
      await apiService.getItems({
        page: 1,
        perPage: 20,
        itemName: query.trim(),
      });

    console.log(
      "[Frontend Petpooja Search]",
      response
    );

    return Array.isArray(
      response?.data
    )
      ? response.data
      : [];
  } catch (error) {
    console.error(
      "Petpooja product search failed:",
      error
    );

    return [];
  }
};

  /*
   * ==========================================================
   * FINAL PURCHASE
   *
   * Keep this empty until Step 4 backend
   * API is finalized.
   * ==========================================================
   */

// ============================================================
// CREATE FINAL PURCHASE BILL
// ============================================================
// ============================================================
// CREATE FINAL PURCHASE BILL
// ============================================================

const handleCreatePurchase = async (): Promise<void> => {
  if (!purchaseItems || purchaseItems.length === 0) {
    setError("No purchase items found");
    return;
  }

  setSubmittingPurchase(true);
  setError("");

  try {
    // ========================================================
    // INVOICE DETAIL
    // ========================================================

    const detail: any =
      selectedInvoice?.raw ||
      selectedInvoice?.canonical ||
      selectedInvoice ||
      {};

    // ========================================================
    // HELPERS
    // ========================================================

    const toNumber = (value: any): number => {
      const number = Number(value);

      return Number.isFinite(number)
        ? number
        : 0;
    };

    const round2 = (value: number): number => {
      return Math.round(
        (value + Number.EPSILON) * 100
      ) / 100;
    };

    // ========================================================
    // FINAL BILL LINE ITEMS
    // ========================================================

    const lineItems: any[] = [];

    // ========================================================
    // FLATTEN PURCHASE REVIEW ITEMS
    //
    // Invoice item
    //      ↓
    // mappedProducts[]
    //      ↓
    // bill lineItems[]
    // ========================================================

    purchaseItems.forEach(
      (row: any) => {
        const invoiceProduct: any =
          row?.invoiceProduct || {};

        const mappedProducts: any[] =
          Array.isArray(row?.mappedProducts)
            ? row.mappedProducts
            : [];

        // ====================================================
        // MULTI MAPPING
        // ====================================================

        if (
          mappedProducts.length > 0
        ) {
          mappedProducts.forEach(
            (product: any) => {

              const quantity: number =
                toNumber(
                  product?.quantity
                );

              const rate: number =
                toNumber(
                  product?.purchaseRate ??
                  product?.rate ??
                  invoiceProduct?.rate
                );

              const mrp: number =
                toNumber(
                  product?.mrp ??
                  invoiceProduct?.mrp
                );

              const salesRate: number =
                toNumber(
                  product?.salesRate ??
                  product?.mrp ??
                  invoiceProduct?.mrp
                );

              // ----------------------------------------------
              // LINE ITEM DISCOUNT
              // ----------------------------------------------

              const discountType: string =
                product?.discountType ||
                "percentage";

              const discountRate: number =
                toNumber(
                  product?.discountRate
                );

              const gross: number =
                round2(
                  quantity * rate
                );

              let discountAmount: number =
                toNumber(
                  product?.discountAmount
                );

              if (
                discountType ===
                "percentage"
              ) {
                discountAmount =
                  round2(
                    gross *
                    discountRate /
                    100
                  );
              }

              // Never allow discount > line value
              discountAmount =
                Math.min(
                  gross,
                  Math.max(
                    0,
                    discountAmount
                  )
                );

              const taxableAmount: number =
                round2(
                  gross -
                  discountAmount
                );

              // ----------------------------------------------
              // FINAL BILL LINE
              // ----------------------------------------------

              lineItems.push({

                itemId:
                  toNumber(
                    product?.petpoojaItemId ??
                    product?.itemId ??
                    product?.id
                  ),

                unitId:
                  product?.unitId != null
                    ? toNumber(
                        product.unitId
                      )
                    : 42,

                description:
                  // invoiceProduct?.description ||
                  product?.description ||
                  "",

                batchId:
                  product?.batchId != null
                    ? toNumber(
                        product.batchId
                      )
                    : null,

                serialNumbers: [],

                productType:
                  "goods",

                quantity,

                freeQuantity:
                  0,

                mrp,

                salesRate,

                rate,

                isDiscountPercentage:
                  discountType ===
                  "percentage",

                discountRate,

                discountAmount,

                taxableAmount,

                taxTreatment:
                  "outOfScope",

                taxGroup:
                  null,

              });
            }
          );

          return;
        }

        // ====================================================
        // SINGLE MAPPING FALLBACK
        // ====================================================

        if (
          row?.petpoojaItem
        ) {

          const product: any =
            row.petpoojaItem;

          const quantity: number =
            toNumber(
              row?.quantity ??
              invoiceProduct?.quantity
            );

          const rate: number =
            toNumber(
              row?.purchaseRate ??
              invoiceProduct?.rate
            );

          const mrp: number =
            toNumber(
              row?.mrp ??
              invoiceProduct?.mrp
            );

          const salesRate: number =
            toNumber(
              row?.salesRate ??
              mrp
            );

          const gross: number =
            round2(
              quantity * rate
            );

          const discountType: string =
            row?.discountType ||
            "percentage";

          const discountRate: number =
            toNumber(
              row?.discountRate
            );

          let discountAmount: number =
            toNumber(
              row?.discountAmount
            );

          if (
            discountType ===
            "percentage"
          ) {
            discountAmount =
              round2(
                gross *
                discountRate /
                100
              );
          }

          discountAmount =
            Math.min(
              gross,
              Math.max(
                0,
                discountAmount
              )
            );

          const taxableAmount: number =
            round2(
              gross -
              discountAmount
            );

          lineItems.push({

            itemId:
              toNumber(
                product?.id ??
                product?.itemId
              ),

            unitId:
              product?.unitId != null
                ? toNumber(
                    product.unitId
                  )
                : 42,

            description:
              invoiceProduct?.description ||
              "",

            batchId:
              row?.batchId != null
                ? toNumber(
                    row.batchId
                  )
                : null,

            serialNumbers: [],

            productType:
              "goods",

            quantity,

            freeQuantity:
              0,

            mrp,

            salesRate,

            rate,

            isDiscountPercentage:
              discountType ===
              "percentage",

            discountRate,

            discountAmount,

            taxableAmount,

            taxTreatment:
              "outOfScope",

            taxGroup:
              null,

          });
        }
      }
    );

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      lineItems.length === 0
    ) {
      throw new Error(
        "No mapped purchase items found"
      );
    }

    // Make sure every line has an itemId
    const invalidLine =
      lineItems.find(
        (item: any) =>
          !item.itemId
      );

    if (invalidLine) {
      throw new Error(
        "One or more purchase items are missing itemId"
      );
    }

    // ========================================================
    // BILL TOTALS
    // ========================================================

    const subtotal: number =
      round2(
        lineItems.reduce(
          (
            sum: number,
            item: any
          ) => {

            return (
              sum +
              (
                toNumber(
                  item.quantity
                ) *
                toNumber(
                  item.rate
                )
              )
            );

          },
          0
        )
      );

    const itemDiscounts: number =
      round2(
        lineItems.reduce(
          (
            sum: number,
            item: any
          ) =>
            sum +
            toNumber(
              item.discountAmount
            ),
          0
        )
      );

    const taxableAmount: number =
      round2(
        subtotal -
        itemDiscounts
      );

    // ========================================================
    // TAX
    //
    // Current purchase flow is outOfScope,
    // therefore tax = 0.
    // ========================================================

    const taxTotal: number = 0;

    // ========================================================
    // EXPENSE CHARGES
    //
    // IMPORTANT:
    // Explicitly type this so TypeScript does not infer
    // `never[]` / implicit `any[]`.
    // ========================================================

    const expenseCharges: any[] = [];

    const expenseCharge: number =
      0;

    // ========================================================
    // ROUND OFF
    // ========================================================

    const rawTotal: number =
      round2(
        taxableAmount +
        taxTotal +
        expenseCharge
      );

    const roundedTotal: number =
      Math.round(
        rawTotal
      );

    const adjustment: number =
      round2(
        roundedTotal -
        rawTotal
      );

    const total: number =
      round2(
        rawTotal +
        adjustment
      );

    // ========================================================
    // SUPPLIER
    // ========================================================

    const supplier: any =
      selectedSupplier ||
      detail?.supplier ||
      detail?.seller ||
      {};

    const partyId: number =
      toNumber(
        supplier?.id
      );

    if (!partyId) {
      throw new Error(
        "Supplier / party ID is missing"
      );
    }

    // ========================================================
    // FINAL PETPOOJA BILL PAYLOAD
    // ========================================================

    const billPayload: any = {

      isAutoNumber:
        false,

      isMrnAutoNumber:
        false,

      mrnAutoSeriesId:
        null,

      mrnNumber:
        null,

      isExpenseOnly:
        false,

      purchaseOrderIds:
        [],

      partyId,

      partyGstNumber:
        supplier?.gstn ||
        "",

      sourceOfSupplyId:
        detail?.sourceOfSupplyId ??
        33,

      destinationOfSupplyId:
        detail?.destinationOfSupplyId ??
        33,

      billingAddressId:
        detail?.billingAddressId ??
        255291491,

      templateId:
        detail?.templateId ??
        254630079,

      voucherNumber:
        detail?.voucherNumber ||
        detail?.invoice_no ||
        detail?.invoice_number ||
        "",

      date:
        detail?.date ||
        detail?.invoice_date ||
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),

      isInclusiveTax:
        true,

      isItemLevelDiscount:
        true,

      isDiscountPercentage:
        true,

      /*
       * IMPORTANT:
       *
       * Discount is NOT invoice-level.
       *
       * Each lineItem contains:
       *
       * discountRate
       * discountAmount
       * isDiscountPercentage
       */

      discountAmount:
        null,

      discountRate:
        null,

      notes:
        "",

      terms:
        "",

      attachment:
        [],

      status:
        "open",

      lineItems,

      gstTreatment:
        "unregistered",

      taxableAmount,

      taxTotal,

      adjustment,

      total,

      allTaxes:
        {},

      customFields:
        [],

      tds:
        [],

      tcs:
        [],

      expenseCharges,

    };

    // ========================================================
    // DEBUG
    // ========================================================

    console.log(
      "=============================================="
    );

    console.log(
      "[Purchase] FINAL BILL PAYLOAD"
    );

    console.log(
      JSON.stringify(
        billPayload,
        null,
        2
      )
    );

    console.log(
      "==============================================", billPayload
    );

    

    // ========================================================
    // CREATE PURCHASE BILL
    // ========================================================

    const response =
      await apiService.createPurchaseBill(
        billPayload
      );

    // ========================================================
    // CHECK RESPONSE
    // ========================================================

    if (
      !response?.success
    ) {
      throw new Error(
        response?.message ||
        "Failed to create purchase bill"
      );
    }

    // ========================================================
    // API RESPONSE
    
    // ApiResponse<T> puts Petpooja response inside `data`.
    // ========================================================

    const billResult: any =
      response?.data || {};

    const voucherNumber =
      billResult?.voucherNumber ||
      "";

    const voucherId =
      billResult?.voucherId ||
      null;

    console.log(
      "[Purchase] Bill created:",
      {
        voucherId,
        voucherNumber,
        mrnNumber:
          billResult?.mrnNumber ||
          null,
      }
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    alert(
      voucherNumber
        ? `Purchase bill created successfully - ${voucherNumber}`
        : "Purchase bill created successfully"
    );

  } catch (error: any) {

    console.error(
      "[Purchase] Create purchase bill failed:",
      error
    );

    setError(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create purchase bill"
    );

  } finally {

    setSubmittingPurchase(
      false
    );

  }
};

  /*
   * ==========================================================
   * AUTH SCREENS
   * ==========================================================
   */

  if (step === "checking") {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />

            <p className="mt-4 text-sm font-medium text-slate-700">
              Connecting to Petpooja...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Checking your session
            </p>

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}

                <button
                  onClick={
                    checkPetpoojaAuth
                  }
                  className="ml-2 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                🧾
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Petpooja Purchase
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Connect your Petpooja account
                to import purchase invoices.
              </p>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mobile Number
            </label>

            <input
              type="tel"
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value
                )
              }
              placeholder="Enter mobile number"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={
                handleRequestOtp
              }
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <button
              onClick={() => {
                setStep("login");
                setOtp("");
                setPetpoojaUser("");
                setError("");
              }}
              className="mb-6 text-sm font-medium text-slate-500"
            >
              ← Change number
            </button>

            <h1 className="text-2xl font-bold">
              Verify OTP
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter the OTP sent to
            </p>

            <p className="mt-1 font-semibold">
              {mobile}
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="000000"
              className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-orange-500"
            />

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={
                handleVerifyOtp
              }
              disabled={
                loading ||
                otp.length < 4
              }
              className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Verify & Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * WORKFLOW
   * ==========================================================
   */

  if (selectedInvoice) {
    return (
      <div className="min-h-screen bg-slate-50 p-3 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <PurchaseProgress
            currentStep={
              purchaseStep
            }
            completedSteps={
              completedSteps
            }
            onStepClick={(
              nextStep
            ) => {
              setPurchaseStep(
                nextStep
              );
            }}
          />

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {purchaseStep === 1 && (
           <ReviewItemsStep
  invoice={
    selectedInvoice
  }

  suppliers={
    suppliers
  }

  selectedSupplier={
    selectedSupplier
  }

  onSupplierChange={setSelectedSupplier}

  loading={
    mappingLoading
  }

  loadingSuppliers={
    loadingSuppliers
  }

  onBack={() => {
    setSelectedInvoice(null);
    setMappingData(null);
    setSelectedSupplier(null);
    setError("");
  }}

onContinue={async (finalProducts) => {
  if (!selectedSupplier) {
    setError(
      "Please select a supplier before continuing."
    );

    return;
  }

  if (
    !selectedSupplier.partyCode?.trim()
  ) {
    setError(
      `Supplier "${selectedSupplier.name}" does not have a party code.`
    );

    return;
  }

  try {

    console.log(
      "========== FINAL PRODUCTS FROM REVIEW =========="
    );

    console.log(
      finalProducts
    );

    console.log(
      "FINAL PRODUCT COUNT:",
      finalProducts?.length
    );

    await startProductMapping(
      finalProducts
    );

    setPurchaseStep(2);

    setCompletedSteps([
      1,
    ]);

  } catch {
    // Error already handled inside startProductMapping
  }
}}
/>
          )}

          {purchaseStep === 2 &&
            mappingData && (
              
<ProductMappingStep
  mappingData={mappingData}
  confirmingId={confirmingId}
  onConfirm={confirmProductMapping}
  onCreateNew={handleCreateNewProduct}
  onSearchProducts={searchPetpoojaProducts}
  onContinue={() => {
    setCompletedSteps((previous) => [
      ...previous,
      2,
    ]);

    setPurchaseStep(3);
  }}
  onBack={() => setPurchaseStep(1)}
/>
            )}

          {purchaseStep === 3 &&
            mappingData && (
              <PurchaseReviewStep
                invoice={
                  selectedInvoice
                }
                mappingData={
                  mappingData
                }
                purchaseItems={
                  purchaseItems
                }
                setPurchaseItems={
                  setPurchaseItems
                }
                onBack={() => {
                  setPurchaseStep(
                    2
                  );
                }}
                onContinue={() => {
                  setPurchaseStep(
                    4
                  );

                  setCompletedSteps(
                    [1, 2, 3]
                  );
                }}
              />
            )}

          {purchaseStep === 4 && (
            <CreatePurchaseStep
              invoice={
                selectedInvoice
              }
              purchaseItems={
                purchaseItems
              }
              submitting={
                submittingPurchase
              }
              onBack={() => {
                setPurchaseStep(
                  3
                );
              }}
              onSubmit={
                handleCreatePurchase
              }
            />
          )}
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * INVOICE LIST
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Purchase Invoices
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Import invoices from Petpooja
            </p>
          </div>

          <button
            onClick={
              loadInvoices
            }
            disabled={
              loadingInvoices
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
          >
            {loadingInvoices
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}

            <button
              onClick={
                loadInvoices
              }
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loadingInvoices ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />

            <p className="text-sm text-slate-500">
              Loading purchase invoices...
            </p>
          </div>
        ) : invoices.length ===
          0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">
              🧾
            </div>

            <h2 className="mt-3 font-semibold">
              No invoices found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a purchase invoice in
              Petpooja first.
            </p>
          </div>
        ) : (
          <InvoiceList
            invoices={invoices}
            onSelect={
              handleInvoiceClick
            }
          />
        )}
      </div>
    </div>
  );
}

function InvoiceList({
  invoices,
  onSelect,
}: {
  invoices: Invoice[];
  onSelect: (
    invoice: Invoice
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      {/* DESKTOP */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Invoice
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Supplier
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Date
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {invoices.map(
              (
                invoice,
                index
              ) => (
                <tr
                  key={
                    invoice.id ||
                    index
                  }
                  onClick={() =>
                    onSelect(
                      invoice
                    )
                  }
                  className="cursor-pointer hover:bg-orange-50"
                >
                  <td className="px-5 py-4 font-semibold">
                    {invoice.invoice_no ||
                      invoice.invoice_number ||
                      invoice.invoiceNo ||
                      "Invoice"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.seller
                      ?.company_name ||
                      invoice.supplier_name ||
                      invoice.supplier
                        ?.name ||
                      "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.invoice_date ||
                      invoice.date ||
                      "—"}
                  </td>

                  <td className="px-5 py-4 text-right font-medium text-orange-600">
                    View →
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}

      <div className="divide-y divide-slate-100 md:hidden">
        {invoices.map(
          (
            invoice,
            index
          ) => (
            <button
              key={
                invoice.id ||
                index
              }
              onClick={() =>
                onSelect(
                  invoice
                )
              }
              className="w-full p-4 text-left active:bg-orange-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {invoice.invoice_no ||
                      invoice.invoice_number ||
                      invoice.invoiceNo ||
                      "Invoice"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {invoice.seller
                      ?.company_name ||
                      invoice.supplier_name ||
                      invoice.supplier
                        ?.name ||
                      "Unknown supplier"}
                  </p>
                </div>

                <span className="text-orange-600">
                  →
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {invoice.invoice_date ||
                  invoice.date ||
                  "Date unavailable"}
              </p>
            </button>
          )
        )}
      </div>
    </div>
  );
}
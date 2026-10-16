export interface CanonicalInvoiceResponse {
  raw: any;

  canonical: any;

  review: {
    header?: any;
    lines: any[];
    totals?: any;
    validation?: any;
    intelligence?: any;
  };

  stats?: any;

  validation?: {
    valid: boolean;
    requiresReview: boolean;
    issues: any[];
  };
}
export interface Supplier {
  id: number;
  name: string;
  companyName?: string | null;
  mobile?: string | null;
  email?: string | null;
  gstn?: string | null;
  gstType?: string | null;
  pan?: string | null;
  fssaiNumber?: string | null;
  partyType: string;
  openingBalance?: string | number;
  creditPeriod?: number | null;
  creditLimit?: string | number | null;
  isActive?: boolean;
  partyCode?: string | null;
  receivable?: number;
  payable?: number;
}
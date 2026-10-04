export type UnitOfMeasure =
  | 'MM'
  | 'CM'
  | 'M'
  | 'M2'
  | 'M3'
  | 'UNIDADE'
  | 'GRAMA'
  | 'KG'
  | 'ML'
  | 'LITRO';

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  MM: 'Milímetro (mm)',
  CM: 'Centímetro (cm)',
  M: 'Metro (m)',
  M2: 'Metro quadrado (m²)',
  M3: 'Metro cúbico (m³)',
  UNIDADE: 'Unidade',
  GRAMA: 'Grama (g)',
  KG: 'Quilograma (kg)',
  ML: 'Mililitro (ml)',
  LITRO: 'Litro (L)',
};

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface RawMaterial {
  id: string;
  name: string;
  description?: string;
  usageUnit: UnitOfMeasure;
  conversionFactor: number;
  stockQty: number;
  minStockAlert?: number;
  createdAt: string;
  updatedAt: string;
  suppliers?: MaterialSupplier[];
  defaultSupplier?: MaterialSupplier | null;
  unitCost?: number;
}
export interface LaborRate {
  id: string;
  name: string;
  hourlyRate: number;
  createdAt: string;
  updatedAt: string;
}
export interface ProductMaterial {
  id: string;
  productId: string;
  rawMaterialId: string;
  rawMaterial: RawMaterial;
  quantityUsed: number;
  wastePercent: number;
}

export interface ProductLabor {
  id: string;
  productId: string;
  laborRateId: string;
  laborRate: LaborRate;
  hoursSpent: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  marginPercent: number;
  overheadPercent: number;
  materials: ProductMaterial[];
  labors: ProductLabor[];
  createdAt: string;
  updatedAt: string;
  overheadMode: OverheadMode;
}

export interface MaterialBreakdownItem {
  rawMaterialId: string;
  name: string;
  unitCost: number;
  quantityUsed: number;
  wastePercent: number;
  effectiveQuantity: number;
  totalCost: number;
}

export interface LaborBreakdownItem {
  laborRateId: string;
  name: string;
  hourlyRate: number;
  hoursSpent: number;
  totalCost: number;
}

export interface PricingResult {
  productId: string;
  productName: string;
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  subtotalCost: number;
  marginValue: number;
  finalPrice: number;
  breakdown: {
    materials: MaterialBreakdownItem[];
    labors: LaborBreakdownItem[];
    overhead: OverheadInput;
    marginPercent: number;
  };
}

export interface ProductCostSnapshot {
  id: string;
  productId: string;
  materialsCost: number;
  laborCost: number;
  overheadCost: number;
  subtotalCost: number;
  marginValue: number;
  finalPrice: number;
  breakdown: PricingResult['breakdown'];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProductOverheadItem {
  id: string;
  productId: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  marginPercent: number;
  overheadPercent: number;
  materials: ProductMaterial[];
  labors: ProductLabor[];
  overheadItems: ProductOverheadItem[];
  createdAt: string;
  updatedAt: string;
}

export type ImageOwnerType = 'raw-materials' | 'suppliers' | 'products' | 'kits';

export interface EntityImage {
  id: string;
  ownerType: string;
  ownerId: string;
  url: string;
  filename: string;
  createdAt: string;
}

export interface LowValueFeeTier {
  maxValue: number;
  fee: number;
}

export interface Marketplace {
  id: string;
  name: string;
  slug: string;
  commissionPercent: number;
  commissionCapValue: number | null;
  fixedFeeValue: number | null;
  lowValueFeeTiers: LowValueFeeTier[] | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface MarketplaceCalculationResult {
  marketplaceId: string;
  marketplaceName: string;
  productCost: number;
  desiredMarginPercent: number;
  suggestedPrice: number;
  commissionPercent: number;
  commissionValue: number;
  fixedFeeValue: number;
  totalFees: number;
  netReceivedByYou: number;
  effectiveMarginPercent: number;
  effectiveMarginValue: number;
}

export interface KitItem {
  id: string;
  kitId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
}

export interface Kit {
  id: string;
  name: string;
  description?: string | null;
  marginPercent: number;
  overheadPercent: number;
  items: KitItem[];
  createdAt: string;
  updatedAt: string;
}

export interface KitItemPricing {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface KitPricingResult {
  kitId: string;
  kitName: string;
  items: KitItemPricing[];
  itemsSubtotal: number;
  overheadCost: number;
  subtotalCost: number;
  marginValue: number;
  finalPrice: number;
  overheadPercent: number;
  marginPercent: number;
}

export interface StockMovement {
  id: string;
  rawMaterialId: string;
  type: 'CONSUMPTION' | 'RESTOCK' | 'MANUAL_ADJUSTMENT';
  quantity: number;
  note?: string | null;
  productionRecordId?: string | null;
  createdAt: string;
}

export interface ProductionRecord {
  id: string;
  productId: string;
  quantityProduced: number;
  unitCost: number;
  totalCost: number;
  stockMovements: (StockMovement & { rawMaterial: RawMaterial })[];
  createdAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  materialSupplierId: string;
  purchaseUnit: UnitOfMeasure;
  purchaseQty: number;
  purchasePrice: number;
  recordedAt: string;
}

export interface MaterialSupplier {
  id: string;
  rawMaterialId: string;
  supplierId: string;
  supplier: Supplier;
  purchaseUnit: UnitOfMeasure;
  purchaseQty: number;
  purchasePrice: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  priceHistory?: PriceHistoryEntry[];
}

export type OverheadMode = 'MANUAL' | 'AUTOMATIC';

export type OverheadInput =
  | { mode: 'MANUAL'; overheadPercent: number }
  | {
    mode: 'AUTOMATIC';
    overheadCostPerUnit: number;
    monthlyProductiveHours: number;
    unitsProducibleMonthly: number;
    totalFixedCostMonthly: number;
  };

export interface WorkshopSettings {
  id: string;
  monthlyProductiveHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface FixedCost {
  id: string;
  name: string;
  monthlyValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BreakEvenResult {
  productId: string;
  productName: string;
  finalPrice: number;
  variableCostPerUnit: number;
  totalFixedCostMonthly: number;
  contributionMarginPerUnit: number;
  contributionMarginPercent: number;
  breakEvenUnitsMonthly: number;
  breakEvenRevenueMonthly: number;
  isViable: boolean;
}

export interface BusinessBreakEvenMixItem {
  productId: string;
  productName: string;
  revenueShare: number;
  contributionMarginPercent: number;
}

export interface BusinessBreakEvenResult {
  totalFixedCostMonthly: number;
  weightedContributionMarginPercent: number;
  isEstimated: boolean;
  breakEvenRevenueMonthly: number;
  currentMonthRevenue: number;
  currentMonthUnits: number;
  progressPercent: number;
  remainingRevenueToBreakEven: number;
  projectedMonthRevenue: number;
  daysElapsedInMonth: number;
  daysInMonth: number;
  isOnTrack: boolean;
  mix: BusinessBreakEvenMixItem[];
}

export interface ProfitGoalByProductResult {
  productId: string;
  productName: string;
  finalPrice: number;
  contributionMarginPerUnit: number;
  unitsNeeded: number;
  revenueNeeded: number;
  isViable: boolean;
}

export interface ProfitGoalByMixResult {
  weightedContributionMarginPercent: number;
  revenueNeeded: number;
  isEstimated: boolean;
  isViable: boolean;
}

export interface ProfitGoalResult {
  desiredProfit: number;
  totalFixedCostMonthly: number;
  byMix: ProfitGoalByMixResult;
  byProduct: ProfitGoalByProductResult[];
}

export type DiscountType = 'NONE' | 'PERCENT' | 'FIXED';

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  sequenceNumber: number;
  clientName: string;
  clientContact: string | null;
  discountType: DiscountType;
  discountValue: number;
  validityDays: number;
  notes: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}
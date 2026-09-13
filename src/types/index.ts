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
  description?: string | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  purchaseUnit: UnitOfMeasure;
  purchaseQty: number;
  purchasePrice: number;
  usageUnit: UnitOfMeasure;
  conversionFactor: number;
  stockQty: number;
  minStockAlert?: number | null;
  unitCost?: number;
  createdAt: string;
  updatedAt: string;
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
    overheadPercent: number;
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
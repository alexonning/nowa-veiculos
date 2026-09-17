export type VehicleStatus = "active" | "inactive" | "sold";
export type VehicleCondition = "novo" | "usado" | "repasse";

export type VehicleRecord = {
  id: number;
  name: string;
  version: string;
  year: number;
  mileage: number;
  transmission: string;
  fuel: string;
  category: string;
  condition: VehicleCondition;
  saleEnabled: boolean;
  rentalEnabled: boolean;
  salePrice: number | null;
  rentalPrice: number | null;
  description: string;
  features: string[];
  status: VehicleStatus;
  isPromotion: boolean;
  promotionalPrice: number | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type VehicleInput = Omit<VehicleRecord, "id" | "images" | "createdAt" | "updatedAt">;

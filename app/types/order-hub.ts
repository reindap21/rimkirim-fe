export type PackageItem = {
  description: string;
  quantity: number;
  valuePerItem: number;
};

export type Package = {
  id: string;
  packagingType?: string;
  weightInKgs: number;
  dimensionInCcLength: number;
  dimensionInCcWidth: number;
  dimensionInCcHeight: number;
  totalItem: number;
  totalValue: number;
  chargeableWeight: number;
  items: PackageItem[];
  uploadedFiles?: {
    localPath: string;
    name: string;
    size: number;
  }[];
};

export type ProgressStatus = "awaiting_input" | "completed" | "locked";

export type PurposeOfShipment = "moving_goods" | "passenger_goods";

export interface ProgressCount {
  completed: number;
  total: number;
}

export type OrderHubStep =
  | "customer_information"
  | "item_and_package"
  | "compliance_document"
  | "pickup_detail_schedule";

export interface OrderHubSection<T = unknown> {
  status: ProgressStatus;
  has_data: boolean;
  data: T | null;
  progress_count: ProgressCount;
  errors?: Record<string, boolean>;
}

export interface PickupDetailSchedule<T = unknown>
  extends OrderHubSection<T> {
  prerequisites: ProgressCount;
}

export interface OrderHubProgress {
  id: string;
  booking_code: string;
  packing_list_code: string | null;
  purpose_of_shipment: PurposeOfShipment;
  can_download_packing_list: boolean;
  progress: {
    customer_information: ProgressStatus;
    item_and_package: ProgressStatus;
    compliance_document: ProgressStatus;
    pickup_detail_schedule: ProgressStatus;
  };
  customer_information: OrderHubSection;
  item_and_package: OrderHubSection;
  compliance_document: OrderHubSection;
  pickup_detail_schedule: OrderHubSection;
}

// Compliance Document Types
export interface ComplianceDocument {
  documentType: string;
  localPath: string;
  name: string;
  size: number;
  mimeType?: string;
  googleDrivePath: string | null;
  googleDriveUrl: string | null;
  uploadedAt?: string;
}

// API Response Wrappers
export interface OrderHubProgressResponse {
  message: string;
  data: OrderHubProgress;
}

export interface UploadDocumentResponse {
  message: string;
  data: {
    local_path: string;
    document_type: string;
    name: string;
    size: number;
    mime_type: string;
  };
}

export interface PackingListValidationResponse {
  message: string;
  data: {
    exists: boolean;
  };
}

// Address Geocode Type (from GoogleAddressInput)
export interface AddressGeocode {
  address: string;
  latitude: number;
  longitude: number;
  postal_code: string;
  city: string;
  province: string;
  country: string; // ISO code
}

// Customer Information Payload
export interface CustomerInformationPayload {
  bookingCode: string;
  // Shipper
  shipperFullName: string;
  shipperEmail: string;
  shipperOriginPhoneNumber: string;
  shipperDestinationPhoneNumber: string;
  shipmentOwnerSameAs: "sender" | "receiver" | null;
  // Sender
  senderContactName: string;
  senderPhoneNumber: string;
  senderEmail: string;
  senderCountry: string;
  senderProvince: string;
  senderCity: string;
  senderFullAddress: string;
  senderPostalCode: string;
  senderAddressGeocode: AddressGeocode | Record<string, never>;
  // Receiver
  receiverSameAsSender: boolean;
  receiverContactName: string;
  receiverPhoneNumber: string;
  receiverEmail: string;
  receiverCountry: string;
  receiverProvince: string;
  receiverCity: string;
  receiverFullAddress: string;
  receiverPostalCode: string;
  receiverAddressGeocode: AddressGeocode | Record<string, never>;
}

import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { MENU } from "~/config";
import type { OrderHubProgress, OrderHubStep, ProgressStatus } from "~/types/order-hub";

/**
 * Fetch booking progress from API with error handling.
 * Automatically redirects to login on 401 error.
 *
 * @param bookingCode - The booking code to fetch progress for
 * @returns OrderHubProgress data or null if failed
 */
export async function fetchBookingProgress(bookingCode: string): Promise<OrderHubProgress | null> {
  try {
    const res = await $fetch<OrderHubProgress>(`/api/order-hub/progress`, {
      method: "GET",
      credentials: "include", // Required
      params: {
        bookingCode,
      },
    });

    return res || null;
  } catch (err) {
    const router = useRouter();
    if ((err as { statusCode?: number })?.statusCode === 401) {
      router.push("/");
    }
    return null;
  }
}

/**
 * Navigate back to the order hub main page.
 *
 * @param bookingCode - The booking code to navigate to
 */
export function navigateToOrderHub(bookingCode: string): void {
  const router = useRouter();
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  });
}

/**
 * Navigate to a specific order hub page.
 *
 * @param bookingCode - The booking code
 * @param page - The page to navigate to (e.g., 'customer-information', 'item-and-packages')
 */
export function navigateToOrderHubPage(bookingCode: string, page: string): void {
  const router = useRouter();
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}/${page}`,
  });
}

/**
 * Handle form submission with loading state management.
 * Wraps the submit operation with loading state and error handling.
 *
 * @param options - Submission options
 * @returns Promise that resolves when submission is complete
 */
export async function handleSubmitWithLoadingState<T = unknown>({
  loadingRef,
  errorRef,
  valid,
  submitOperation,
  onSuccess,
  onError,
}: {
  loadingRef: Ref<boolean>;
  errorRef: Ref<string>;
  valid: boolean;
  submitOperation: () => Promise<T>;
  onSuccess?: (response: T) => void;
  onError?: (error: unknown) => void;
}): Promise<void> {
  if (!valid || loadingRef.value) {
    return;
  }

  errorRef.value = "";
  loadingRef.value = true;

  try {
    const response = await submitOperation();

    if (onSuccess) {
      onSuccess(response);
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    const errorMessage = e?.data?.message || "Error submitting form";
    errorRef.value = errorMessage;

    if (onError) {
      onError(err);
    }
  } finally {
    loadingRef.value = false;
  }
}

/**
 * Format address data for API submission.
 * Combines address components into a single geocode object.
 *
 * @param addressData - Address components from form
 * @returns Formatted address geocode object
 */
export function formatAddressGeocode(addressData: {
  fullAddress?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}) {
  return {
    address: addressData.fullAddress || "",
    city: addressData.city || "",
    province: addressData.province || "",
    country: addressData.country || "",
    postal_code: addressData.postalCode || "",
    latitude: addressData.latitude || 0,
    longitude: addressData.longitude || 0,
  };
}

/**
 * Download a file from the API.
 * Handles blob response and triggers browser download.
 *
 * @param url - The API endpoint URL
 * @param fileName - The filename to save as (optional)
 * @param credentials - Whether to include credentials (default: true)
 */
export async function downloadFile({
  url,
  fileName,
  credentials = true,
}: {
  url: string;
  fileName?: string;
  credentials?: boolean;
}): Promise<void> {
  try {
    const response = await $fetch(url, {
      method: "GET",
      credentials: credentials ? "include" : "same-origin",
      responseType: "blob",
    });

    // Create download link
    const blob = response as unknown as Blob;
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

/**
 * Upload a document to the compliance document endpoint.
 *
 * @param files - Files to upload
 * @param documentType - Type of document being uploaded
 * @param bookingCode - The booking code
 * @returns Upload response data
 */
export async function uploadComplianceDocument({
  files,
  documentType,
  bookingCode,
}: {
  files: File[];
  documentType: string;
  bookingCode: string;
}): Promise<{
  localPath: string;
  documentType: string;
  name: string;
  size: number;
  mimeType?: string;
}> {
  const formData = new FormData();

  const file = files[0];
  if (!file) {
    throw new Error("No file provided");
  }

  formData.append("file", file);
  formData.append("document_type", documentType);
  formData.append("booking_code", bookingCode);

  const res = await $fetch<{
    local_path: string;
    document_type: string;
    name: string;
    size: number;
    mime_type?: string;
  }>("/api/upload/compliance-document", {
    method: "POST",
    body: formData,
  });

  // Transform snake_case to camelCase
  return {
    localPath: res.local_path,
    documentType: res.document_type,
    name: res.name,
    size: res.size,
    mimeType: res.mime_type,
  };
}

/**
 * Check if a purpose of shipment is passenger goods.
 *
 * @param purpose - The purpose of shipment value
 * @returns true if purpose is passenger_goods
 */
export function isPassengerGoods(purpose: string | null | undefined): boolean {
  return purpose === "passenger_goods";
}

/**
 * Check if a purpose of shipment is moving goods.
 *
 * @param purpose - The purpose of shipment value
 * @returns true if purpose is moving_goods
 */
export function isMovingGoods(purpose: string | null | undefined): boolean {
  return purpose === "moving_goods";
}

export const STEP_LABEL: Record<OrderHubStep, string> = {
  customer_information: "Customer Information",
  item_and_package: "Item & Packages Information",
  compliance_document: "Compliance Document",
  pickup_detail_schedule: "Pickup Detail & Schedule",
};

export const MAIN_STEPS: OrderHubStep[] = [
  "customer_information",
  "item_and_package",
  "compliance_document",
];

/**
 *
 * @param currentStep OrderHubStep
 * @param progress Record<OrderHubStep, ProgressStatus>
 * @returns
 */
export const hasIncompleteSteps = (
  currentStep: OrderHubStep | null,
  progress: Record<string, ProgressStatus> = {},
) => {
  if (!currentStep || !progress) return;
  return MAIN_STEPS.filter((step) => step !== currentStep).some(
    (step) => progress?.[step] !== "completed",
  );
};

/**
 *
 * @param currentStep OrderHubStep
 * @param progress Record<OrderHubStep, ProgressStatus>
 * @returns
 */
const getIncompleteSteps = (
  currentStep: OrderHubStep,
  progress: Record<string, ProgressStatus> = {},
): OrderHubStep[] => {
  return MAIN_STEPS.filter((step) => step !== currentStep && progress?.[step] !== "completed");
};

/**
 *
 * @param currentStep OrderHubStep
 * @param progress Record<OrderHubStep, ProgressStatus>
 * @returns
 */
export const getNextStepDescription = (
  currentStep: OrderHubStep,
  progress: Record<string, ProgressStatus> = {},
) => {
  const incompleteSteps = getIncompleteSteps(currentStep, progress);

  if (incompleteSteps.length === 0) {
    return "You have finished 3/3 form to unlock pickup schedule, go pick a date and time to start your international moving";
  }

  if (incompleteSteps.length === 1) {
    return `Finish ${STEP_LABEL[incompleteSteps[0]!]} to schedule your move.`;
  }

  const labels = incompleteSteps.map((step) => STEP_LABEL[step]);

  return `Finish ${labels.join(" and ")} to schedule your move.`;
};

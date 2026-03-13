import { computed, ref, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MENU } from "~/config";
import type { OrderHubProgress } from "~/types/order-hub";

/**
 * Composable for order hub common functionality.
 * Provides reusable methods for navigation, API calls, and state management.
 */
export function useOrderHub() {
  const router = useRouter();
  const route = useRoute();

  const loading = ref(false);
  const error = ref("");

  /**
   * Get the booking code from route params.
   */
  const bookingCode = computed(() => route.params.id as string);

  /**
   * Purpose of Shipment from Response
   */
  const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");

  /**
   * Packing List Code from Response
   */
  const packingListCode = ref("-");

  /**
   * Navigate back to order hub main page.
   */
  function navigateToOrderHub(): void {
    router.push({
      path: `${MENU.ORDER_HUB}/${bookingCode.value}`,
    });
  }

  /**
   * Navigate to a specific order hub page.
   */
  function navigateToPage(page: string): void {
    router.push({
      path: `${MENU.ORDER_HUB}/${bookingCode.value}/${page}`,
    });
  }

  /**
   * Fetch booking progress with automatic error handling.
   */
  async function fetchProgress(): Promise<OrderHubProgress | null> {
    loading.value = true;

    try {
      const res = await $fetch<OrderHubProgress>(`/api/order-hub/progress`, {
        method: "GET",
        credentials: "include",
        params: {
          bookingCode: bookingCode.value,
        },
      });

      purposeOfShipment.value = res?.purpose_of_shipment;
      packingListCode.value = res?.packing_list_code || "-";

      return res || null;
    } catch (err) {
      if ((err as { statusCode?: number })?.statusCode === 401) {
        router.push("/");
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Handle form submission with loading state.
   */
  async function handleSubmit<T = unknown>({
    valid,
    endpoint,
    payload,
    onSuccess,
  }: {
    valid: boolean;
    endpoint: string;
    payload: Record<string, unknown>;
    onSuccess?: (response: T) => void;
  }): Promise<void> {
    if (!valid || loading.value) {
      return;
    }

    error.value = "";
    loading.value = true;

    try {
      const response = await $fetch<T>(endpoint, {
        method: "PUT",
        body: payload,
        credentials: "include",
      });

      if (onSuccess) {
        onSuccess(response as T);
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message || "Error submitting form";
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    loading,
    error,
    bookingCode,
    packingListCode,

    // Navigation
    navigateToOrderHub,
    navigateToPage,

    // API
    fetchProgress,
    handleSubmit,
  };
}

/**
 * Composable for document upload functionality.
 */
export function useDocumentUpload(bookingCode: Ref<string>) {
  const uploading = ref(false);

  /**
   * Upload a compliance document.
   */
  async function uploadDocument({
    files,
    documentType,
  }: {
    files: File[];
    documentType: string;
  }): Promise<{
    localPath: string;
    documentType: string;
    name: string;
    size: number;
    mimeType?: string;
  } | null> {
    uploading.value = true;

    try {
      const file = files[0];
      if (!file) {
        throw new Error("No file provided");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("booking_code", bookingCode.value);

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

      // Transform to camelCase
      const uploaded = {
        localPath: res.local_path,
        documentType: res.document_type,
        name: res.name,
        size: res.size,
        mimeType: res.mime_type,
      };

      return uploaded;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    } finally {
      uploading.value = false;
    }
  }

  return {
    uploading,
    uploadDocument,
  };
}

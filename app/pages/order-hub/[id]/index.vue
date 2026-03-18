<script setup lang="ts">
  import { ref } from "vue";
  import IconOrderHubCustomer from "~/components/icons/IconOrderHubCustomer.vue";
  import IconPackage from "~/components/icons/IconPackage.vue";
  import IconPickupDisabled from "~/components/icons/IconPickupDisabled.vue";
  import IconPickup from "~/components/icons/IconPickup.vue";
  import type { OrderHubProgress } from "~/types/order-hub";
  import { useOrderHub } from "~/composables/useOrderHub";

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  // * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

  definePageMeta({
    layout: "order-hub",
    // middleware: 'auth'
  });

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const { user, loading } = useAuth();

  // Use order hub composable
  const {
    loading: bookingProgressLoading,
    bookingCode,
    fetchProgress: getBookingProgress,
    navigateToPage,
  } = useOrderHub();

  const bookingData = ref<OrderHubProgress | null>(null);

  const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");
  const packingListCode = ref("-");

  const isPickupDisabled = ref(false);
  const isDownloadingPackingList = ref(false);

  // Computed property for download permission
  const canDownloadPackingList = computed(
    () => bookingData.value?.can_download_packing_list ?? false,
  );

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  // Load booking progress
  const loadBookingProgress = async () => {
    const res = await getBookingProgress();

    if (!res) return;

    bookingData.value = res;
    purposeOfShipment.value = res?.purpose_of_shipment;
    packingListCode.value = res?.packing_list_code || "-";
    isPickupDisabled.value = res?.progress?.pickup_detail_schedule?.toLowerCase() === "locked";
  };

  const getWaitingNumber = (bookingData: OrderHubProgress) => {
    if (!bookingData?.progress) return 3;
    let counter = 0;
    Object.entries(bookingData.progress).forEach((v) => {
      if (v[0] === "pickup_detail_schedule") return;
      if (v[1] !== "completed") counter++;
    });
    return counter;
  };

  const navigateTo = (page: string) => {
    navigateToPage(page);
  };

  const downloadPackingList = async () => {
    // Check if download is allowed
    if (!canDownloadPackingList.value) {
      // console.warn('Packing list download not available');
      return;
    }

    // Prevent multiple simultaneous downloads
    if (isDownloadingPackingList.value) return;

    isDownloadingPackingList.value = true;

    try {
      // Call API to get the file
      const blob = await $fetch(`/api/order-hub/${bookingCode.value}/packing-list/download`, {
        method: "GET",
        credentials: "include",
        responseType: "blob", // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(blob as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `packing-list-${bookingCode.value}.pdf`; // Adjust extension based on actual file type
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // You could add toast notification here
    } finally {
      // Re-enable button after download completes (or fails)
      isDownloadingPackingList.value = false;
    }
  };

  // * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

  onMounted(() => {
    if (!loading.value && user && bookingCode.value) loadBookingProgress();
  });
</script>

<template>
  <section class="flex flex-col relative gap-6 max-w-7xl mx-auto px-6 pt-32 pb-24">
    <div
      class="fixed top-[14px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full w-fit z-[100]"
    >
      <div
        class="text-[12px] leading-[22px] px-8 py-3 font-medium cursor-pointer rounded-full"
        :class="
          purposeOfShipment === 'moving_goods' ? 'bg-[#0093FF] text-white' : 'text-neutral-60'
        "
      >
        Personal Belongings
      </div>
      <div
        class="text-[12px] leading-[22px] px-8 py-3 font-medium cursor-pointer rounded-full"
        :class="
          purposeOfShipment === 'passenger_goods' ? 'bg-[#FF7C00] text-white' : 'text-neutral-60'
        "
      >
        Passenger Goods
      </div>
    </div>
    <!-- Header -->
    <div class="flex flex-col items-center justify-center gap-2 mb-8">
      <BasePill bg="bg-neutral-20">
        <span class="text-[400]"> Booking Number </span>
        <span class="font-bold text-neutral-100">{{ bookingCode }}</span>
      </BasePill>
      <h1 class="text-[32px] leading-[130%] font-semibold text-neutral-100 text-center">
        INTERNATIONAL MOVING ORDER
      </h1>
      <p class="text-body-sm font-[400] !text-neutral-70 uppercase">
        YOU MAY CHOOSE ANY FORM YOU WANT TO FILL FIRST
      </p>
    </div>

    <template v-if="loading && bookingProgressLoading"> .... </template>

    <template v-else>
      <!-- Cards -->
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- CUSTOMER INFORMATION -->
          <UICardInformation
            :status="bookingData?.customer_information?.status"
            :total-progress="
              Number(bookingData?.customer_information?.progress_count?.total || 0)
            "
            :current-progress="
              Number(bookingData?.customer_information?.progress_count?.completed || 0)
            "
            :title="['CUSTOMER', 'INFORMATION']"
            :icon="IconOrderHubCustomer"
            description="Personal details, contact info, and addresses."
            @action="navigateTo('customer-information')"
          />

          <!-- ITEM & PACKAGES -->
          <UICardInformation
            :status="bookingData?.item_and_package?.status"
            :total-progress="
              Number(bookingData?.item_and_package?.progress_count?.total || 0)
            "
            :current-progress="
              Number(bookingData?.item_and_package?.progress_count?.completed || 0)
            "
            :title="['ITEM &', 'PACKAGES']"
            :icon="IconPackage"
            description="Details of items, weights and packaging types."
            @action="navigateTo('item-and-packages')"
          />

          <!-- COMPLIANCE DOCUMENT -->
          <UICardInformation
            :status="bookingData?.compliance_document?.status"
            :total-progress="
              Number(bookingData?.compliance_document?.progress_count?.total || 0)
            "
            :current-progress="
              Number(bookingData?.compliance_document?.progress_count?.completed || 0)
            "
            :title="['COMPLIANCE', 'DOCUMENT']"
            :icon="IconOrderHubCustomer"
            description="Submit document needed for your international move."
            @action="navigateTo('compliance-document')"
          />

          <!-- PICKUP DETAIL & SCHEDULE: LOCKED -->
          <UICardInformation
            :status="bookingData?.pickup_detail_schedule?.status || 'locked'"
            :total-progress="
              Number(bookingData?.pickup_detail_schedule?.progress_count?.total || 0)
            "
            :current-progress="
              Number(bookingData?.pickup_detail_schedule?.progress_count?.completed || 0)
            "
            :waiting-number="getWaitingNumber(bookingData as OrderHubProgress)"
            :title="['PICKUP DETAIL &', 'SCHEDULE']"
            :icon="!isPickupDisabled ? IconPickup : IconPickupDisabled"
            description="Select your preferred date & time for pickup."
            @action="!isPickupDisabled && navigateTo('pickup-detail-and-schedule')"
          />
        </div>

        <div>
          <p class="text-body-sm text-neutral-90 font-[400]">
            Packing List Code:
            <span class="font-bold">{{ packingListCode || "-" }}</span>
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-center md:flex-row gap-4 w-full">
        <div class="flex gap-4">
          <button
            class="h-[46px] w-[244px] flex justify-center items-center gap-2 rounded-lg border border-neutral-100 text-body-sm font-medium transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed text-neutral-70 bg-gray-100':
                isDownloadingPackingList || !canDownloadPackingList,
              'hover:bg-neutral-20 text-neutral-100':
                !isDownloadingPackingList && canDownloadPackingList,
            }"
            :disabled="isDownloadingPackingList || !canDownloadPackingList"
            @click="downloadPackingList"
          >
            <!-- Loading spinner -->
            <svg
              v-if="isDownloadingPackingList"
              class="animate-spin h-[18px] w-[18px]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>

            <!-- Download icon -->
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.75 10.5C16.1642 10.5 16.5 10.8358 16.5 11.25V14.25C16.5 14.8467 16.2628 15.4189 15.8408 15.8408C15.4189 16.2628 14.8467 16.5 14.25 16.5H3.75C3.15326 16.5 2.58114 16.2628 2.15918 15.8408C1.73722 15.4189 1.5 14.8467 1.5 14.25V11.25C1.5 10.8358 1.83579 10.5 2.25 10.5C2.66421 10.5 3 10.8358 3 11.25V14.25C3 14.4489 3.07907 14.6396 3.21973 14.7803C3.36038 14.9209 3.55109 15 3.75 15H14.25C14.4489 15 14.6396 14.9209 14.7803 14.7803C14.9209 14.6396 15 14.4489 15 14.25V11.25C15 10.8358 15.3358 10.5 15.75 10.5Z"
                fill="#1E1E1E"
              />
              <path
                d="M9 1.5C9.41421 1.5 9.75 1.83579 9.75 2.25V9.43945L12.2197 6.96973C12.5126 6.67683 12.9874 6.67683 13.2803 6.96973C13.5732 7.26262 13.5732 7.73738 13.2803 8.03027L9.53027 11.7803C9.49442 11.8161 9.45484 11.8482 9.41235 11.8762C9.38405 11.8949 9.35451 11.9109 9.32446 11.9253C9.29055 11.9416 9.25551 11.9559 9.21899 11.967C9.20377 11.9717 9.18829 11.9751 9.17285 11.9788C9.16433 11.9808 9.15585 11.9829 9.14722 11.9846C9.13945 11.9862 9.13158 11.987 9.12378 11.9883C9.08343 11.995 9.04225 12 9 12C8.9575 12 8.91606 11.9951 8.87549 11.9883C8.86769 11.987 8.85982 11.9862 8.85205 11.9846C8.84342 11.9829 8.83493 11.9808 8.82642 11.9788C8.81099 11.9751 8.79549 11.9717 8.78027 11.967C8.74378 11.9559 8.70869 11.9416 8.6748 11.9253C8.64496 11.9109 8.61576 11.8948 8.58765 11.8762C8.54516 11.8482 8.50558 11.8161 8.46973 11.7803L4.71973 8.03027C4.42683 7.73738 4.42683 7.26262 4.71973 6.96973C5.01262 6.67683 5.48738 6.67683 5.78027 6.96973L8.25 9.43945V2.25C8.25 1.83579 8.58579 1.5 9 1.5Z"
                fill="#1E1E1E"
              />
            </svg>

            {{ isDownloadingPackingList ? "Downloading..." : "Download Packing List" }}
          </button>
          <PrimaryButton class="w-[165px]"> Book My Order </PrimaryButton>
        </div>
      </div>
    </template>
  </section>
</template>

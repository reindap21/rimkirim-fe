<script setup lang="ts">
  import { ref } from "vue";
  import { MENU } from "~/config";
  import type { EligibilityFormPayload } from "~/types/common";

  interface BookingResponse {
    booking: { booking_code: string }
  }

  definePageMeta({
    layout: "eligible",
    // middleware: 'auth'
  });

  const router = useRouter();
  const route = useRoute();

  // string | string[] | undefined
  const rateId = computed(() => {
    const id = route.query.rateId;
    return Array.isArray(id) ? id[0] : id;
  });

  // string | undefined
  const originCountryCode = computed((): string | undefined => {
    const origin = route.query.origin;
    if (!origin || origin === "null") return undefined;
    if (Array.isArray(origin)) {
      const first = origin[0];
      return first && first !== "null" ? first : undefined;
    }
    return origin && origin !== "null" ? origin : undefined;
  });

  const packingListCode = ref("");
  const eligibleStep = ref("question"); // question | selection
  const isSKPAvailable = ref(false);
  const continueLoading = ref(false);
  const selectionLoading = ref(false);

  /**
   * On Click Continue Button
   * @param formData
   */
  const handleOnContinue = async (formData: EligibilityFormPayload) => {
    continueLoading.value = true;

    const { shippingToIndonesia, citizenship, livedInOriginCountry, canApplySKP } = formData;

    isSKPAvailable.value = canApplySKP ?? false;
    packingListCode.value = formData?.packingListCode ?? "";

    const payload = {
      rate_id: rateId.value,
      is_personal_belongings: shippingToIndonesia,
      is_indonesian_citizen: citizenship === "indonesian",
      has_lived_abroad_min_12_months: livedInOriginCountry,
      is_eligible_for_skp: canApplySKP,
      origin_country_code: originCountryCode.value,
      packing_list_code: packingListCode.value,
    };

    console.log({
      formData,
      payload,
    });

    // Submit
    try {
      await $fetch(`/api/eligibility/check`, {
        method: "POST",
        credentials: "include", // Required
        body: payload,
      });

      // If success
      eligibleStep.value = "selection";
      continueLoading.value = false;
    } catch (err) {
      console.error("check eligibility error:", err);
      continueLoading.value = false;
    }
  };

  /**
   * On Select the Purpose
   * @param purposeOfShipment
   */
  const handleOnSelect = async (purposeOfShipment: string) => {
    selectionLoading.value = true;

    const payload = {
      rate_id: rateId.value,
      purpose_of_shipment: purposeOfShipment,
      packing_list_code: packingListCode.value,
    };

    // Submit
    try {
      const res = await $fetch<BookingResponse>(`/api/booking`, {
        method: "POST",
        credentials: "include", // Required
        body: payload,
      });

      // If success
      router.push({
        path: `${MENU.ORDER_HUB}/${res?.booking?.booking_code}`,
      });
    } catch (err) {
      console.error("booking error:", err);
      selectionLoading.value = false;
    }
  };
</script>

<template>
  <EligibleQuestionSection
    v-if="eligibleStep === 'question'"
    :loading="continueLoading"
    :origin-country-code="originCountryCode"
    @continue="handleOnContinue"
  />
  <EligibleSelectionSection
    v-else
    :is-s-k-p-available="isSKPAvailable"
    :loading="selectionLoading"
    @select="handleOnSelect"
  />
</template>

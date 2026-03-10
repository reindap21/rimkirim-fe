<script setup lang="ts">
<<<<<<< HEAD
  import { ref } from "vue";
  import { MENU } from "~/config";

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
  const handleOnContinue = async (formData: any) => {
    continueLoading.value = true;

    const { shippingToIndonesia, citizenship, livedInOriginCountry, canApplySKP } = formData;

    isSKPAvailable.value = canApplySKP;
    packingListCode.value = formData?.packingListCode;

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
      const res = await $fetch(`/api/booking`, {
        method: "POST",
        credentials: "include", // Required
        body: payload,
      });

      // If success
      router.push({
        path: `${MENU.ORDER_HUB}/${(res as any)?.booking?.booking_code}`,
      });
    } catch (err) {
      console.error("booking error:", err);
      selectionLoading.value = false;
    }
  };
=======

import { ref } from 'vue';
import { MENU } from '~/config';

definePageMeta({
  layout: 'eligible',
  // middleware: 'auth'
})


const router = useRouter();
const route = useRoute();

// string | string[] | undefined
const rateId = computed(() => {
  const id = route.query.rateId
  return Array.isArray(id) ? id[0] : id
})

// string | string[] | undefined
const originCountryCode = computed(() => {
  const origin = route.query.origin
  return Array.isArray(origin) ? origin[0] : origin
})

const packingListCode = ref('');
const eligibleStep = ref('question'); // question | selection
const isSKPAvailable = ref(false);
const continueLoading = ref(false);

/**
 * On Click Continue Button
 * @param formData 
 */
const handleOnContinue = async (formData: any) => {

  continueLoading.value = true;

  const { shippingToIndonesia, citizenship, livedInUK, canApplySKP } = formData

  isSKPAvailable.value = canApplySKP;
  packingListCode.value = formData?.packingListCode;

  const payload = {
    rate_id: rateId.value,
    is_personal_belongings: shippingToIndonesia,
    is_indonesian_citizen: citizenship === "indonesian",
    has_lived_abroad_min_12_months: livedInUK,
    is_eligible_for_skp: canApplySKP,
    origin_country_code: originCountryCode.value,
    packing_list_code: packingListCode.value
  }

  // Submit
  try {
    await $fetch(`/api/eligibility/check`, {
      method: "POST",
      credentials: 'include', // Required
      body: payload
    })

    // If success
    eligibleStep.value = 'selection';
    continueLoading.value = false;
  } catch (err) {
    console.error('check eligibility error:', err);
    continueLoading.value = false;
  }

}

/**
 * On Select the Puspose
 * @param purposeOfShipment 
 */
const handleOnSelect = async (purposeOfShipment: string) => {

  const payload = {
    rate_id: rateId.value,
    purpose_of_shipment: purposeOfShipment,
    packing_list_code: packingListCode.value,
  }

  // Submit
  try {
    const res = await $fetch(`/api/booking`, {
      method: "POST",
      credentials: 'include', // Required
      body: payload
    })

    // If success
    router.push({
      path: `${MENU.ORDER_HUB}/${(res as any)?.booking?.booking_code}`,
    })
  } catch (err) {
    console.error('booking error:', err);
    continueLoading.value = false;
  }
}

>>>>>>> Refactor page structure; Page customer infor and item & packages
</script>

<template>
  <EligibleQuestionSection
    @continue="handleOnContinue"
    v-if="eligibleStep === 'question'"
    :loading="continueLoading"
    :originCountryCode="originCountryCode"
  />
  <EligibleSelectionSection
    @select="handleOnSelect"
    :isSKPAvailable="isSKPAvailable"
    :loading="selectionLoading"
    v-else
  />
</template>

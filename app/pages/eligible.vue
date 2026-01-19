<script setup lang="ts">

import { ref } from 'vue'

const router = useRouter();
const route = useRoute();

// string | string[] | undefined
const rateId = computed(() => {
  const id = route.query.rateId
  return Array.isArray(id) ? id[0] : id
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

  const { shippingToIndonesia, citizenship, livedInUK, canApplySKP, hasPackingList } = formData

  isSKPAvailable.value = canApplySKP;
  packingListCode.value = hasPackingList;

  const payload = {
    rate_id: rateId.value,
    is_personal_belongings: shippingToIndonesia,
    is_indonesian_citizen: citizenship === "indonesian",
    has_lived_abroad_min_12_months: livedInUK,
    is_eligible_for_skp: canApplySKP,
    origin_country_code: "ID", // TODO
    packing_list_code: hasPackingList
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
      path: '/booking',
      query: {
        code: (res as any)?.data?.booking_code
      }
    })

  } catch (err) {
    console.error('booking error:', err);
    continueLoading.value = false;
  }
}

</script>

<template>
  <EligibleQuestionSection @continue="handleOnContinue" v-if="eligibleStep === 'question'" :loading="continueLoading" />
  <EligibleSelectionSection @select="handleOnSelect" :isSKPAvailable="isSKPAvailable" v-else />
</template>
<script setup lang="ts">
  import { computed, ref } from "vue";
  import type { PackingListValidationResponse } from "~/types/order-hub";
  import type { EligibilityFormPayload } from "~/types/common";

  // * ------- Defines -----------------------------------------------------------------------------------------------------------------------------------------------

  interface Props {
    loading?: boolean;
    originCountryCode?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    originCountryCode: "GB",
  });

  const emit = defineEmits<{
    (e: "continue", payload: EligibilityFormPayload): void;
  }>();

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * State
   */
  const shippingToIndonesia = ref<null | boolean>(null);
  const citizenship = ref<null | "indonesian" | "foreigner">(null);
  const livedInOriginCountry = ref<null | boolean>(null);
  const canApplySKP = ref<null | boolean>(null);
  const hasPackingList = ref<null | boolean>(null);
  const packingListCode = ref<null | string>(null);
  const isValidPackingListCode = ref(false);
  const searchPackingListCodeLoading = ref(false);
  const errorMessage = ref<string | null>(null);

  // Abuse prevention
  const lastVerifiedCode = ref<string | null>(null); // Track last successfully verified code
  const minCodeLength = 3; // Minimum code length to allow search

  // Display origin country name (uppercase)
  const originDisplay = computed(() => {
    return props.originCountryCode?.toUpperCase() || "GB";
  });

  /**
   * Check if search button should be disabled
   */
  const isSearchDisabled = computed(() => {
    return (
      searchPackingListCodeLoading.value ||
      !packingListCode.value ||
      packingListCode.value.trim().length < minCodeLength
    );
  });

  /**
   * Helper class
   */
  const buttonClass = (active: boolean) => [
    "w-[110px] h-[46px] rounded-full text-[14px] font-medium transition",
    active
      ? "bg-neutral-100 text-white"
      : "border border-gray-300 text-neutral-100 hover:bg-gray-100",
  ];

  /**
   * Enable Continue only if all answered
   */
  const canContinue = computed(() => {
    const allRequiredFields =
      shippingToIndonesia.value !== null &&
      citizenship.value !== null &&
      livedInOriginCountry.value !== null &&
      canApplySKP.value !== null &&
      hasPackingList.value !== null;

    if (hasPackingList.value) {
      return allRequiredFields && packingListCode.value !== null && isValidPackingListCode.value;
    }

    return allRequiredFields;
  });

  const handleSearchPackingListCode = async () => {
    // Guard: prevent search with empty input
    if (!packingListCode.value || !packingListCode.value.trim()) {
      errorMessage.value = "Please enter a packing list code";
      return;
    }

    // Guard: minimum code length validation
    if (packingListCode.value.trim().length < minCodeLength) {
      errorMessage.value = `Packing list code must be at least ${minCodeLength} characters`;
      return;
    }

    // Guard: prevent duplicate search for the same verified code
    if (isValidPackingListCode.value && packingListCode.value.trim() === lastVerifiedCode.value) {
      // errorMessage.value = "This code has already been verified"
      return;
    }

    // Reset states and set loading
    isValidPackingListCode.value = false;
    errorMessage.value = null;
    searchPackingListCodeLoading.value = true;

    try {
      const res = await $fetch<PackingListValidationResponse>(
        `/api/eligibility/packing-list/${packingListCode.value.trim()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (res.data.exists) {
        // Packing list found
        isValidPackingListCode.value = true;
        lastVerifiedCode.value = packingListCode.value.trim(); // Store verified code
      } else {
        // Packing list not found
        errorMessage.value = "Packing list not found";
      }
    } catch (err) {
      // API error (network, 500, etc.)
      console.error("search packing list error:", err);
      errorMessage.value = "Failed to verify packing list code. Please try again.";
    } finally {
      searchPackingListCodeLoading.value = false;
    }
  };

  /**
   * Submit
   */
  const handleContinue = () => {
    const payload = {
      shippingToIndonesia: shippingToIndonesia.value,
      citizenship: citizenship.value,
      livedInOriginCountry: livedInOriginCountry.value,
      canApplySKP: canApplySKP.value,
      hasPackingList: hasPackingList.value,
      packingListCode: packingListCode.value,
    };
    emit("continue", payload);
  };
</script>

<template>
  <section class="max-w-4xl mx-auto px-6 pt-32 pb-24">
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col gap-6 rounded-2xl border border-neutral-40 bg-neutral-10 overflow-hidden"
      >
        <!-- HEADER -->
        <div class="flex flex-col gap-1 p-8 bg-neutral-20">
          <h1 class="text-[28px] leading-[130%] font-semibold text-neutral-100">
            Let's start your International Moving!
          </h1>
          <p class="text-[14px] text-neutral-60">
            To help us match you with the right service based on your needs, please select the
            options below.
          </p>
        </div>

        <div class="flex flex-col gap-4 px-8 pb-6">
          <!-- Q1 -->
          <div class="flex items-center justify-between gap-6">
            <p class="text-[18px] text-neutral-90">
              Are you shipping personal belongings to Indonesia?
            </p>
            <div class="flex gap-3">
              <button
                :class="buttonClass(shippingToIndonesia === true)"
                @click="shippingToIndonesia = true"
              >
                Yes
              </button>
              <button
                :class="buttonClass(shippingToIndonesia === false)"
                @click="shippingToIndonesia = false"
              >
                No
              </button>
            </div>
          </div>

          <!-- Q2 -->
          <div class="flex items-center justify-between gap-6">
            <p class="text-[18px] text-neutral-90">Which citizenship do you currently hold?</p>
            <div class="flex gap-3">
              <button
                :class="buttonClass(citizenship === 'indonesian')"
                @click="citizenship = 'indonesian'"
              >
                Indonesian
              </button>
              <button
                :class="buttonClass(citizenship === 'foreigner')"
                @click="citizenship = 'foreigner'"
              >
                Foreigner
              </button>
            </div>
          </div>

          <!-- Q3 -->
          <div class="flex items-center justify-between gap-6">
            <p class="text-[18px] text-neutral-90">
              Have you lived in {{ originDisplay }} at least 12 Months?
            </p>
            <div class="flex gap-3">
              <button
                :class="buttonClass(livedInOriginCountry === true)"
                @click="livedInOriginCountry = true"
              >
                Yes
              </button>
              <button
                :class="buttonClass(livedInOriginCountry === false)"
                @click="livedInOriginCountry = false"
              >
                No
              </button>
            </div>
          </div>

          <!-- Q4 -->
          <div class="flex items-center justify-between gap-6">
            <p class="text-[18px] text-neutral-90 flex items-center gap-1">
              Are you able to apply for SKP at nearest KBRI / KJRI <IconQuestionMarkCircle />
            </p>
            <div class="flex gap-3">
              <button :class="buttonClass(canApplySKP === true)" @click="canApplySKP = true">
                Yes
              </button>
              <button :class="buttonClass(canApplySKP === false)" @click="canApplySKP = false">
                No
              </button>
            </div>
          </div>

          <!-- Q5 -->
          <div class="flex items-center justify-between gap-6">
            <p class="text-[18px] text-neutral-90 flex items-center gap-1">
              Do you have a Rimkirim Packing List code
              <IconQuestionMarkCircle />
            </p>
            <div class="flex gap-3">
              <button :class="buttonClass(hasPackingList === true)" @click="hasPackingList = true">
                Yes
              </button>
              <button
                :class="buttonClass(hasPackingList === false)"
                @click="hasPackingList = false"
              >
                No
              </button>
            </div>
          </div>

          <div v-if="hasPackingList" class="flex flex-col gap-[6px]">
            <label class="text-[14px] text-neutral-90 leading-[22px]">Packing List Code</label>
            <div class="flex justify-center gap-4">
              <InputText
                v-model="packingListCode"
                name="packing_list_code"
                type="text"
                placeholder="Input packing list code"
                class="flex-1 text-[14px] leading-[22px] font-[400] px-4 py-3 bg-white rounded-[6px] text-neutral-100 placeholder:text-neutral-60 border border-[#EDEDED]"
                variant="filled"
                fluid
                :disabled="searchPackingListCodeLoading"
              />
              <BlackButton
                class="w-[83px]"
                :loading="searchPackingListCodeLoading"
                :disabled="isSearchDisabled"
                @click="handleSearchPackingListCode"
              >
                Search
              </BlackButton>
            </div>
            <div
              v-if="isValidPackingListCode"
              class="flex items-center gap-2 text-[12px] leading-[20px] text-[#27C827]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2C6.81331 2 5.65328 2.35189 4.66658 3.01118C3.67989 3.67047 2.91085 4.60754 2.45673 5.7039C2.0026 6.80025 1.88378 8.00665 2.11529 9.17054C2.3468 10.3344 2.91825 11.4035 3.75736 12.2426C4.59648 13.0818 5.66557 13.6532 6.82946 13.8847C7.99335 14.1162 9.19975 13.9974 10.2961 13.5433C11.3925 13.0891 12.3295 12.3201 12.9888 11.3334C13.6481 10.3467 14 9.18669 14 8C13.9982 6.40924 13.3655 4.88415 12.2407 3.75931C11.1159 2.63448 9.59076 2.00177 8 2ZM8 12.8C7.05065 12.8 6.12262 12.5185 5.33326 11.9911C4.54391 11.4636 3.92868 10.714 3.56538 9.83688C3.20208 8.95979 3.10702 7.99467 3.29223 7.06357C3.47744 6.13246 3.9346 5.27718 4.60589 4.60589C5.27718 3.93459 6.13246 3.47744 7.06357 3.29223C7.99468 3.10702 8.9598 3.20208 9.83688 3.56538C10.714 3.92868 11.4636 4.54391 11.9911 5.33326C12.5185 6.12262 12.8 7.05065 12.8 8C12.7985 9.27259 12.2924 10.4926 11.3925 11.3925C10.4926 12.2924 9.27259 12.7985 8 12.8ZM8 7.7C7.84087 7.7 7.68826 7.76321 7.57574 7.87573C7.46322 7.98826 7.4 8.14087 7.4 8.3V10.1C7.4 10.2591 7.46322 10.4117 7.57574 10.5243C7.68826 10.6368 7.84087 10.7 8 10.7C8.15913 10.7 8.31174 10.6368 8.42427 10.5243C8.53679 10.4117 8.6 10.2591 8.6 10.1V8.3C8.6 8.14087 8.53679 7.98826 8.42427 7.87573C8.31174 7.76321 8.15913 7.7 8 7.7ZM8 5.3C7.85167 5.3 7.70666 5.34399 7.58332 5.4264C7.45999 5.50881 7.36386 5.62594 7.30709 5.76299C7.25033 5.90003 7.23547 6.05083 7.26441 6.19632C7.29335 6.3418 7.36478 6.47544 7.46967 6.58033C7.57456 6.68522 7.7082 6.75665 7.85368 6.78559C7.99917 6.81453 8.14997 6.79967 8.28701 6.74291C8.42406 6.68614 8.54119 6.59001 8.6236 6.46668C8.70602 6.34334 8.75 6.19833 8.75 6.05C8.75 5.85109 8.67098 5.66032 8.53033 5.51967C8.38968 5.37902 8.19891 5.3 8 5.3Z"
                  fill="#27C827"
                />
              </svg>

              Packing List found! Details will be pre-filled
            </div>
            <div
              v-if="errorMessage"
              class="flex items-center gap-2 text-[12px] leading-[20px] text-red-500"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2C6.81331 2 5.65328 2.35189 4.66658 3.01118C3.67989 3.67047 2.91085 4.60754 2.45673 5.7039C2.0026 6.80025 1.88378 8.00665 2.11529 9.17054C2.3468 10.3344 2.91825 11.4035 3.75736 12.2426C4.59648 13.0818 5.66557 13.6532 6.82946 13.8847C7.99335 14.1162 9.19975 13.9974 10.2961 13.5433C11.3925 13.0891 12.3295 12.3201 12.9888 11.3334C13.6481 10.3467 14 9.18669 14 8C13.9982 6.40924 13.3655 4.88415 12.2407 3.75931C11.1159 2.63448 9.59076 2.00177 8 2ZM8 12.8C7.05065 12.8 6.12262 12.5185 5.33326 11.9911C4.54391 11.4636 3.92868 10.714 3.56538 9.83688C3.20208 8.95979 3.10702 7.99467 3.29223 7.06357C3.47744 6.13246 3.9346 5.27718 4.60589 4.60589C5.27718 3.93459 6.13246 3.47744 7.06357 3.29223C7.99468 3.10702 8.9598 3.20208 9.83688 3.56538C10.714 3.92868 11.4636 4.54391 11.9911 5.33326C12.5185 6.12262 12.8 7.05065 12.8 8C12.7985 9.27259 12.2924 10.4926 11.3925 11.3925C10.4926 12.2924 9.27259 12.7985 8 12.8ZM8 5.3C7.84087 5.3 7.68826 5.36321 7.57574 5.47573C7.46322 5.58826 7.4 5.74087 7.4 5.9V8.3C7.4 8.45913 7.46322 8.61174 7.57574 8.72426C7.68826 8.83679 7.84087 8.9 8 8.9C8.15913 8.9 8.31174 8.83679 8.42427 8.72426C8.53679 8.61174 8.6 8.45913 8.6 8.3V5.9C8.6 5.74087 8.53679 5.58826 8.42427 5.47573C8.31174 5.36321 8.15913 5.3 8 5.3ZM8 10.7C7.85167 10.7 7.70666 10.744 7.58332 10.8264C7.45999 10.9088 7.36386 11.0259 7.30709 11.163C7.25033 11.3 7.23547 11.4508 7.26441 11.5963C7.29335 11.7418 7.36478 11.8754 7.46967 11.9803C7.57456 12.0852 7.7082 12.1567 7.85368 12.1856C7.99917 12.2145 8.14997 12.1997 8.28701 12.1429C8.42406 12.0861 8.54119 11.99 8.6236 11.8667C8.70602 11.7433 8.75 11.5983 8.75 11.45C8.75 11.2511 8.67098 11.0603 8.53033 10.9197C8.38968 10.779 8.19891 10.7 8 10.7Z"
                  fill="#EF4444"
                />
              </svg>
              {{ errorMessage }}
            </div>
            <!-- <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
              $form.email.error?.message }}</Message> -->
          </div>
        </div>
      </div>

      <!-- CONTINUE -->
      <div class="flex justify-center">
        <PrimaryButton
          class="w-[126px]"
          :loading="loading"
          :disabled="!canContinue"
          @click="handleContinue"
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  </section>
</template>

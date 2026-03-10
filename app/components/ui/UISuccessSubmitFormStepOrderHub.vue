<script setup lang="ts">
  import type { Component } from "vue";
  import type { OrderHubProgress, OrderHubStep } from "~/types/order-hub";

  // * ------- Types

  interface Props {
    icon?: Component;
    step?: null | OrderHubStep;
    response?: OrderHubProgress;
    buttonLabel?: string;
    width?: string;
  }

  // * ------- Defines

  const props = withDefaults(defineProps<Props>(), {
    step: null,
    response: undefined,
    buttonLabel: "Go To Booking Order Hub",
    width: "500px",
  });

  const emit = defineEmits<{
    (e: "goToOrderHub"): void;
  }>();

  // * ------- Variables

  const title = ref("");
  const description = ref("");
  const nextStepDescription = ref("");

  // * ------- Handlers

  const handleClick = () => {
    emit("goToOrderHub");
  };

  // * ------- watch

  watch(
    () => props.response,
    (res) => {
      if (!res || !props?.step) return;

      const progress = res?.progress ?? {};
      const stepTitle = STEP_LABEL[props.step] ?? wordCapital(props.step, "_", " ");
      const incompleteSteps = hasIncompleteSteps(props.step, progress);
      title.value = stepTitle;

      description.value = `Your ${stepTitle} has been successfully saved.`;

      description.value += incompleteSteps
        ? ` Please proceed to finish the remaining form for your booking.`
        : ` We will review them shortly. You can track your progress in the Customer Order Hub.`;

      nextStepDescription.value = getNextStepDescription(props.step, progress);
    },
    { immediate: true },
  );
</script>

<template>
  <div
    :style="{ width: props.width }"
    class="mx-auto flex flex-col gap-6 bg-neutral-20 rounded-[16px] mt-16 px-6 py-8"
  >
    <div class="flex flex-col items-center gap-4">
      <!-- Icon -->
      <component v-if="props.icon" :is="props.icon" class="mx-auto" />

      <!-- Default Icon -->
      <svg
        v-else
        width="42"
        height="42"
        viewBox="0 0 42 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30.0288 7.03829C32.6859 4.83503 36.5738 5.41643 38.5977 8.13204C40.5039 10.69 40.1408 14.3181 37.6868 16.3984C31.2286 21.8725 26.2433 25.615 21.0396 31.1828C19.5905 32.7333 18.4204 33.9863 17.4046 34.8366C16.3842 35.6908 15.3069 36.3248 14.0259 36.3132C12.7644 36.3016 11.7282 35.6945 10.7532 34.8606C9.79494 34.0408 8.71569 32.8397 7.38992 31.3691L3.77713 27.3632C1.88851 25.268 1.65882 22.1515 3.21658 19.7993C5.4471 16.432 10.246 16.0946 12.9202 19.1225L15.1778 21.6792C19.5258 16.6538 24.124 11.936 30.0288 7.03829Z"
          fill="#27C827"
        />
      </svg>

      <!-- Title -->
      <h3
        class="text-[24px] leading-[32px] font-semibold text-neutral-100 text-center whitespace-pre-line"
      >
        {{ title }} <br />
        Saved!
      </h3>

      <!-- Description -->
      <p class="text-neutral-60 text-center px-2">
        {{ description }}
      </p>

      <!-- Next Step -->
      <div class="bg-white p-4 min-w-full">
        <div class="flex gap-3">
          <div>
            <IconExclamationCircleNextStep
              v-if="hasIncompleteSteps(props.step, response?.progress)"
            />
            <IconUnlockNextStep v-else />
          </div>
          <div v-if="nextStepDescription" class="flex flex-col gap-2">
            <div v-if="hasIncompleteSteps(props.step, response?.progress)">Next Step</div>
            <div v-else>Pickup Details & Schedule Unlocked!</div>
            <div>{{ nextStepDescription }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-center">
      <PrimaryButton class="w-[244px]" @click="handleClick">
        {{ props.buttonLabel }}
      </PrimaryButton>
    </div>
  </div>
</template>

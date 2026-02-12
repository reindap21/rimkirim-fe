<script setup lang="ts">
import UIShippingLogo from '../ui/UIShippingLogo.vue';

</script>

<template>
    <!-- OUR SHIPPING PARTNER -->
    <section
    class="w-full flex flex-col gap-[30px] py-10 overflow-hidden bg-white"
  >
    <div class="max-w-5xl mx-auto mb-10">
      <h2 class="text-[40px] leading-[48px] font-bold text-neutral-100">
        Our Shipping Partner
      </h2>
    </div>

    <div class="max-w-[63rem] mx-auto relative mask overflow-hidden">
      <div class="flex gap-16 w-max marquee-right items-center wave">
        <div class="flex gap-16 items-center">
          <UIShippingLogo />
        </div>
        <div class="flex gap-16 items-center">
          <UIShippingLogo />
        </div>
      </div>
    </div>
  </section>
</template>
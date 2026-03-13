<template>
  <!-- HOW IT WORKS -->
  <section class="w-full max-w-5xl mx-auto py-10 flex flex-col gap-8">

    <SectionHeader pill-label="How It Works" pill-type="gray" title="How It Works" />
    <div class="grid grid-cols-1 md:grid-cols-4 relative border-t-[2px] border-gray-[#EDEDED]">
      <!-- Step 1 (active) -->
      <div class="flex flex-col gap-3 py-7 px-2 md:px-6 md:border-r-[2px] border-gray-[#EDEDED] transition bg-gray-50">
        <div class="flex flex-col gap-1">
          <div class="font-bold text-[#9C26F5]">01</div>
          <h3 class="font-medium text-gray-900">Tell Us Your Move</h3>
        </div>
        <p class="text-[#616161]/80 text-[14px] leading-[22px] font-[400]">
          Fill out form to share your moving plan.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="flex flex-col gap-3 py-7 px-2 md:px-6 md:border-r-[2px] border-gray-[#EDEDED] transition bg-white">
        <div class="flex flex-col gap-1">
          <div class="font-bold text-[#9C26F5]">02</div>
          <h3 class="font-medium text-gray-900">Confirm Your Plan</h3>
        </div>
        <p class="text-[#616161]/80 text-[14px] leading-[22px] font-[400]">
          Our team will follow up to confirm the details.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="flex flex-col gap-3 py-7 px-2 md:px-6 md:border-r-[2px] border-gray-[#EDEDED] transition bg-white">
        <div class="flex flex-col gap-1">
          <div class="font-bold text-[#9C26F5]">03</div>
          <h3 class="font-medium text-gray-900">Prepare & Pickup</h3>
        </div>
        <p class="text-[#616161]/80 text-[14px] leading-[22px] font-[400]">
          We guide you through everything.
        </p>
      </div>

      <!-- Step 4 -->
      <div class="flex flex-col gap-3 py-7 px-2 md:px-6 transition bg-white">
        <div class="flex flex-col gap-1">
          <div class="font-bold text-[#9C26F5]">04</div>
          <h3 class="font-medium text-gray-900">Ship & Arrive</h3>
        </div>
        <p class="text-[#616161]/80 text-[14px] leading-[22px] font-[400]">
          Your items are shipped internationally.
        </p>
      </div>
    </div>
  </section>
</template>
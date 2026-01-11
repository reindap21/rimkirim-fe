<template>
    <!-- HOW IT WORKS -->
    <section class="w-full max-w-5xl mx-auto py-10 flex flex-col gap-8">
    <div class="flex flex-col items-center justify-center gap-2">
      <span
        class="inline-block px-5 py-2 h-[38px] text-[14px] font-medium rounded-full bg-[#FAFAFC] text-[#1E1E1E]"
        >How It Works</span
      >
      <h2 class="text-[40px] leading-[48px] font-bold text-[#1E1E1E]">
        How It Works
      </h2>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-4 relative border-t-[2px] border-gray-[#EDEDED]"
    >
      <!-- Step 1 (active) -->
      <div
        class="flex flex-col gap-3 py-7 px-2 md:px-6 md:border-r-[2px] border-gray-[#EDEDED] transition bg-gray-50"
      >
        <div class="flex flex-col gap-1">
          <div class="font-bold text-[#9C26F5]">01</div>
          <h3 class="font-medium text-gray-900">Tell Us Your Move</h3>
        </div>
        <p class="text-[#616161]/80 text-[14px] leading-[22px] font-[400]">
          Fill out form to share your moving plan.
        </p>
      </div>

      <!-- Step 2 -->
      <div
        class="flex flex-col gap-3 py-7 px-2 md:px-6 md:border-r-[2px] border-gray-[#EDEDED] transition bg-white"
      >
        <div class="flex flex-col gap-1">
          <div class="font-bold text-[#9C26F5]">02</div>
          <h3 class="font-medium text-gray-900">Confirm Your Plan</h3>
        </div>
        <p class="text-[#616161]/80 text-[14px] leading-[22px] font-[400]">
          Our team will follow up to confirm the details.
        </p>
      </div>

      <!-- Step 3 -->
      <div
        class="flex flex-col gap-3 py-7 px-2 md:px-6 md:border-r-[2px] border-gray-[#EDEDED] transition bg-white"
      >
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
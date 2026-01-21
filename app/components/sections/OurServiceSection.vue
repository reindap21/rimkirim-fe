<template>
  <!-- OUR SERVICE -->
  <section class="w-full max-w-5xl mx-auto py-10 relative">
    <!-- Decorative Shapes -->

    <div class="text-center mb-16 relative z-10">
      <span
        class="inline-block px-4 py-1.5 text-[14px] font-medium rounded-full bg-[#FAFAFC] text-[#616161]/80 mb-4">Our
        Service</span>
      <h2 class="text-[40px] font-bold text-gray-900">How Do We Assist?</h2>
    </div>

    <div class="relative grid grid-cols-1 md:grid-cols-2 gap-0 max-w-6xl mx-auto">
      <!-- Card 1 (supporting) -->
      <div
        class="relative z-10 bg-gray-50 rounded-3xl p-10 shadow-md md:translate-y-2 md:-rotate-1 transition hover:shadow-xl">
        <!-- green box -->
        <div
          class="absolute -top-6 -left-6 w-[60px] h-[60px] bg-[#C1FF00] rounded-[4px] -rotate-[30deg] animate-float-slow">
        </div>
        <!-- purple ball -->
        <div class="absolute -bottom-6 -left-6 w-10 h-10 bg-purple-500 rounded-full animate-float-slower"></div>

        <h3 class="text-2xl font-medium text-gray-900 mb-4">Back for Good</h3>
        <div class="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Full guidance on determining the correct shipping scheme, including
            accurate cost calculations and potential surcharge explanations.
          </p>
          <p>
            We clearly explain all required import documents needed for Customs
            Clearance, ensuring your goods pass smoothly without delay.
          </p>
          <p>
            Shipment from anywhere in the world directly to your destination
            address in Indonesia. We manage all logistics and customs procedures
            for you.
          </p>
        </div>
        <NuxtLink to="/rates"
          class="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition">
          More Details <span>→</span>
        </NuxtLink>

      </div>

      <!-- Card 2 (foreground) -->
      <div class="relative z-20 bg-gray-50 rounded-3xl p-10 shadow-lg md:rotate-1 transition hover:shadow-xl">
        <!-- green box -->
        <div class="absolute -top-4 -right-4 w-14 h-14 bg-[#C1FF00] rounded-[4px] animate-float"></div>
        <!-- purple ball -->
        <div class="absolute -bottom-6 -right-6 w-12 h-12 bg-purple-500 rounded-full animate-float"></div>

        <h3 class="text-2xl font-medium text-gray-900 mb-4">Moving Goods</h3>
        <div class="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Gain clarity on the process flow, cost estimates, and secure packing
            methods before pickup.
          </p>
          <p>
            We guide you through preparing export documents for smooth Customs
            Clearance in the destination country.
          </p>
          <p>
            Shipping from Indonesia to your address abroad, supported by a
            customer support team that ensures communication remains seamless
            despite time zone differences.
          </p>
        </div>
        <div class="mt-8 flex justify-end">
          <NuxtLink to="/rates"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition">
            More Details <span>→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
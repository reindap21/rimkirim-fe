<script setup lang="ts">
  import { MENU } from "~/config";
</script>

<template>
  <!-- OUR SERVICE -->
  <section class="flex flex-col gap-8 w-full max-w-4xl mx-auto py-10 relative">
    <!-- Decorative Shapes -->

    <SectionHeader pill-label="Our Service" title="How Do We Assist?" class="" />

    <div class="relative grid grid-cols-1 md:grid-cols-2 gap-0 max-w-6xl mx-auto">
      <!-- Card 1 (supporting) -->
      <div
        class="relative z-10 bg-neutral-20 rounded-3xl p-6 shadow-md md:translate-y-2 md:-rotate-1 transition hover:shadow-xl"
      >
        <!-- home icon -->
        <img
          src="/svg/home.svg"
          class="absolute top-4 -left-[50px] w-[64px] h-[64px] animate-float-slow"
          alt="Home"
        />
        <!-- document icon -->
        <img
          src="/svg/document.svg"
          class="absolute -bottom-10 -left-10 w-[64px] h-[64px] animate-float-slower"
          style="--r: 10deg"
          alt="Document"
        />

        <h3 class="text-2xl font-bold text-gray-900 mb-4">Back for Good</h3>
        <div class="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Full guidance on determining the correct shipping scheme, including accurate cost
            calculations and potential surcharge explanations.
          </p>
          <p>
            We clearly explain all required import documents needed for Customs Clearance, ensuring
            your goods pass smoothly without delay.
          </p>
          <p>
            Shipment from anywhere in the world directly to your destination address in Indonesia.
            We manage all logistics and customs procedures for you.
          </p>
        </div>
        <div class="mt-8 flex justify-end">
          <NuxtLink
            :to="MENU.RATES"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition"
          >
            More Details <span>→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Card 2 (foreground) -->
      <div
        class="relative z-20 bg-neutral-20 rounded-3xl p-6 shadow-lg md:rotate-1 transition hover:shadow-xl"
      >
        <!-- plane icon -->
        <img
          src="/svg/plane.svg"
          class="absolute top-2 -right-10 w-[64px] h-[64px] animate-float"
          style="--r: -10deg"
          alt="Plane"
        />
        <!-- box icon -->
        <img
          src="/svg/box.svg"
          class="absolute -bottom-10 -right-5 w-[64px] h-[64px] animate-float"
          alt="Box"
        />

        <h3 class="text-2xl font-bold text-gray-900 mb-4">Moving Goods</h3>
        <div class="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Gain clarity on the process flow, cost estimates, and secure packing methods before
            pickup.
          </p>
          <p>
            We guide you through preparing export documents for smooth Customs Clearance in the
            destination country.
          </p>
          <p>
            Shipping from Indonesia to your address abroad, supported by a customer support team
            that ensures communication remains seamless despite time zone differences.
          </p>
        </div>
        <div class="mt-8 flex justify-end">
          <NuxtLink
            :to="MENU.RATES"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition"
          >
            More Details <span>→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

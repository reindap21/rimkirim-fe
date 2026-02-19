<script setup lang="ts">
  import Aramex from "@/assets/images/shipping-partner/aramex.png";
  import DHL from "@/assets/images/shipping-partner/dhl.png";
  import Rayspeed from "@/assets/images/shipping-partner/rayspeed.png";
  import SFExpress from "@/assets/images/shipping-partner/sf_express.svg";
  import UPS from "@/assets/images/shipping-partner/ups.png";
  import FedEx from "@/assets/images/shipping-partner/fedex.png";

  interface ShippingPartner {
    name: string;
    src: string;
    height: number;
  }

  const partners: ShippingPartner[] = [
    { name: "Aramex", src: Aramex, height: 35 },
    { name: "DHL", src: DHL, height: 35 },
    { name: "Rayspeed", src: Rayspeed, height: 40 },
    { name: "SF Express", src: SFExpress, height: 50 },
    { name: "UPS", src: UPS, height: 90 },
    { name: "FedEx", src: FedEx, height: 40 },
  ];
</script>

<template>
  <div class="flex items-center gap-12">
    <div v-for="partner in partners" :key="partner.name" class="flex items-center">
      <NuxtImg
        :src="partner.src"
        :alt="partner.name"
        :title="partner.name"
        :style="{ height: partner.height + 'px' }"
        class="w-auto object-contain"
        format="webp"
        loading="lazy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Aramex from "@/assets/images/shipping-partner/aramex.png";
  import DHL from "@/assets/images/shipping-partner/dhl.png";
  import Rayspeed from "@/assets/images/shipping-partner/rayspeed.png";
  import SFExpress from "@/assets/images/shipping-partner/sf_express.png";
  import UPS from "@/assets/images/shipping-partner/ups.png";
  import FedEx from "@/assets/images/shipping-partner/fedex.png";

  interface ShippingPartner {
    name: string;
    src: string;
    height: number;
  }

  const partners: ShippingPartner[] = [
    { name: "FedEx", src: FedEx, height: 70 },
    { name: "SF Express", src: SFExpress, height: 58 },
    { name: "Aramex", src: Aramex, height: 26 },
    { name: "DHL", src: DHL, height: 25 },
    { name: "UPS", src: UPS, height: 70 },
    { name: "Rayspeed", src: Rayspeed, height: 70 },
  ];
</script>

<template>
  <div class="flex items-center gap-[60px]">
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

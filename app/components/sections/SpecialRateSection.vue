<script setup lang="ts">

interface Props {
  rates: any[]
}

const props = withDefaults(defineProps<Props>(), {
  rates: () => []
});

console.log(props.rates)

</script>

<template>
  <!-- SPECIAL RATES -->
  <section class="w-full max-w-5xl mx-auto py-0 flex flex-col gap-3 -mt-24">

    <template v-for="rate in rates" :key="rate.id">
      <UIRateCard :price="rate?.pricing?.amount" :currency="rate?.pricing?.currency" :unit="rate?.pricing?.unit"
        :minWeight="rate?.pricing?.minimum?.value" badge="Special Rate"
        :originCountry="rate?.route?.origin?.country_name" :originFlag="rate?.route?.origin?.country_code"
        :destinationCountry="rate?.route?.destination?.country_name"
        :destinationFlag="rate?.route?.destination?.country_code" :eta="rate?.eta"
        :isDirect="rate?.route?.is_direct"
        :terms="rate?.terms"  
      />
    </template>

    <!-- CTA BELOW SPECIAL RATES -->
    <div class="py-8 flex justify-center">
      <button class="group inline-flex items-center gap-2 text-[18px] font-normal text-[#1E1E1E] transition">
        <span class="relative">
          Check more country
          <span
            class="absolute left-0 -bottom-1 h-px w-0 bg-[#1E1E1E] transition-all duration-300 group-hover:w-full"></span>
        </span>
        <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { Rate } from '~/interfaces/rate';



interface Props {
  rates: Rate[]
}

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const props = withDefaults(defineProps<Props>(), {
  rates: () => []
});

const router = useRouter()


// * ------- Methods ------------------------------------------------------------------------------------------------------------------------------------------------

const handleMoveNow = (rate: Rate) => {
  router.push({
    path: '/eligible',
    query: {
      rateId: rate._id
    }
  })
}

</script>

<template>
  <!-- SPECIAL RATES -->
  <section class="w-full max-w-5xl mx-auto py-0 flex flex-col gap-3 -mt-24">

    <template v-for="rate in rates" :key="rate._id">
      <UIRateCard 
        :price="rate?.pricing?.amount" 
        :currency="rate?.pricing?.currency" 
        :unit="rate?.pricing?.unit"
        :minWeight="rate?.pricing?.minimum?.value" 
        badge="Special Rate"
        :provider="rate?.provider?.branding?.logo"
        :originCountry="rate?.route?.origin?.country_name" :originFlag="rate?.assets?.flags?.origin"
        :destinationCountry="rate?.route?.destination?.country_name"
        :destinationFlag="rate?.assets?.flags?.destination" :eta="rate?.eta" :isDirect="rate?.route?.is_direct"
        :terms="rate?.terms" @action="handleMoveNow(rate)" />
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
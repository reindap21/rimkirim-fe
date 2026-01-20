<script setup>

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const specialRates = ref([]);
const specialRatesLoading = ref(true);

const getSpecialRates = async () => {
  try {
    const res = await $fetch(`/api/rates`, {
      method: "GET",
      credentials: 'include', // Required
      params: {
        is_special_rate: true
      }
    })
    specialRates.value = res.rates; // Array of rates
    specialRatesLoading.value = false;
  } catch (err) {
    console.error('fetch rates error:', err)
    specialRatesLoading.value = false;
  }
}

onMounted(() => {
  getSpecialRates()
})

</script>

<template>
  <!-- <HeroSection />
  <SpecialRateSection :rates="specialRates" :loading="specialRatesLoading" />
  <OurServiceSection />
  <HowItWorksSection />
  <OurCommitmentsSection />
  <OurShippingPartnerSection />
  <TestimonialSection />
  <FAQSection />
  <CTASection /> -->
</template>

<script setup>

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const specialRates = ref([]);

const getSpecialRates = async () => {
  try {
    const res = await $fetch(`/api/rates`, {
      method: "GET",
      credentials: 'include', // Required
      params: {
        is_special_rate: true
      }
    })
    specialRates.value = res.data; // Array of rates
  } catch (err) {
    console.error('fetch rates error:', err)
  }
}

// ✅ pastikan jalan di client
onMounted(() => {
  getSpecialRates()
})

</script>

<template>
  <HeroSection />
  <SpecialRateSection :rates="specialRates" />
  <OurServiceSection />
  <HowItWorksSection />
  <OurCommitmentsSection />
  <OurShippingPartnerSection />
  <TestimonialSection />
  <FAQSection />
  <CTASection />
</template>

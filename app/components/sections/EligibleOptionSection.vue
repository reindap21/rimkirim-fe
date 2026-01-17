<script setup lang="ts">
  import { computed, ref } from 'vue'
  
  /**
   * State
   */
  const shippingToIndonesia = ref<null | boolean>(null)
  const citizenship = ref<null | 'indonesian' | 'foreigner'>(null)
  const livedInUK = ref<null | boolean>(null)
  const canApplySKP = ref<null | boolean>(null)
  const hasPackingList = ref<null | boolean>(null)
  
  /**
   * Helper class
   */
  const buttonClass = (active: boolean) => [
    'w-[110px] h-[46px] rounded-full text-[14px] font-medium transition',
    active
      ? 'bg-[#1E1E1E] text-white'
      : 'border border-gray-300 text-[#1E1E1E] hover:bg-gray-100'
  ]
  
  /**
   * Enable Continue only if all answered
   */
  const canContinue = computed(() =>
    shippingToIndonesia.value !== null &&
    citizenship.value !== null &&
    livedInUK.value !== null &&
    canApplySKP.value !== null &&
    hasPackingList.value !== null
  )
  
  /**
   * Submit
   */
  const handleContinue = () => {
    const payload = {
      shippingToIndonesia: shippingToIndonesia.value,
      citizenship: citizenship.value,
      livedInUK: livedInUK.value,
      canApplySKP: canApplySKP.value,
      hasPackingList: hasPackingList.value
    }
  
    console.log('Eligibility payload:', payload)
  
    // router.push('/next-step')
  }
  </script>
  
  <template>
    <section class="max-w-4xl mx-auto px-6 pt-32 pb-24">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-6 rounded-2xl border border-[#E0E0E0] bg-[#FAFAFC] overflow-hidden">
  
          <!-- HEADER -->
          <div class="flex flex-col gap-1 p-8 bg-[#F6F6FA]">
            <h1 class="text-[28px] font-semibold text-[#1E1E1E]">
              Let’s start your International Moving!
            </h1>
            <p class="text-[14px] text-[#9E9E9E]">
              To help us match you with the right service based on your needs, please select the options below.
            </p>
          </div>
  
          <div class="flex flex-col gap-4 px-8 pb-6">
  
            <!-- Q1 -->
            <div class="flex items-center justify-between gap-6">
              <p class="text-[18px]">Are you shipping personal belongings to Indonesia?</p>
              <div class="flex gap-3">
                <button :class="buttonClass(shippingToIndonesia === true)" @click="shippingToIndonesia = true">Yes</button>
                <button :class="buttonClass(shippingToIndonesia === false)" @click="shippingToIndonesia = false">No</button>
              </div>
            </div>
  
            <!-- Q2 -->
            <div class="flex items-center justify-between gap-6">
              <p class="text-[18px]">Which citizenship do you currently hold?</p>
              <div class="flex gap-3">
                <button :class="buttonClass(citizenship === 'indonesian')" @click="citizenship = 'indonesian'">
                  Indonesian
                </button>
                <button :class="buttonClass(citizenship === 'foreigner')" @click="citizenship = 'foreigner'">
                  Foreigner
                </button>
              </div>
            </div>
  
            <!-- Q3 -->
            <div class="flex items-center justify-between gap-6">
              <p class="text-[18px]">Have you lived in UK at least 12 Months?</p>
              <div class="flex gap-3">
                <button :class="buttonClass(livedInUK === true)" @click="livedInUK = true">Yes</button>
                <button :class="buttonClass(livedInUK === false)" @click="livedInUK = false">No</button>
              </div>
            </div>
  
            <!-- Q4 -->
            <div class="flex items-center justify-between gap-6">
              <p class="text-[18px] flex items-center gap-1">
                Are you able to apply for SKP at nearest KBRI / KJRI
              </p>
              <div class="flex gap-3">
                <button :class="buttonClass(canApplySKP === true)" @click="canApplySKP = true">Yes</button>
                <button :class="buttonClass(canApplySKP === false)" @click="canApplySKP = false">No</button>
              </div>
            </div>
  
            <!-- Q5 -->
            <div class="flex items-center justify-between gap-6">
              <p class="text-[18px]">Do you have a Rimkirim Packing List code</p>
              <div class="flex gap-3">
                <button :class="buttonClass(hasPackingList === true)" @click="hasPackingList = true">Yes</button>
                <button :class="buttonClass(hasPackingList === false)" @click="hasPackingList = false">No</button>
              </div>
            </div>
  
          </div>
        </div>
  
        <!-- CONTINUE -->
        <div class="flex justify-center">
          <button
            class="w-[126px] h-[46px] rounded-[8px] text-[14px] font-medium transition"
            :class="canContinue
              ? 'bg-[#C1FF00] text-[#1E1E1E] hover:bg-[#A1D400]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            :disabled="!canContinue"
            @click="handleContinue"
          >
            Continue
          </button>
        </div>
  
      </div>
    </section>
  </template>
  
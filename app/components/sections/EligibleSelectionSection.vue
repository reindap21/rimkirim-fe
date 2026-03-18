<script setup lang='ts'>
  defineProps({
    isSKPAvailable: Boolean,
});

  defineEmits<{
    (e: 'select', selection: string): void
  }>()
</script>

<template>
  <!-- Eligibility Selection Section -->
  <section class="max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
    <div class="flex flex-col gap-1">
      <p class="text-[20px] leading-[130%] text-[#616161]">Based on your answer</p>
      <h2 class="text-[32px] leading-[130%] font-semibold text-neutral-100 text-center">You are eligible to choose</h2>
    </div>

    <div class="mt-6 flex items-stretch justify-center gap-4">
      <!-- Skema Barang Pindahan -->
      <button
        class="flex flex-col flex-1 gap-6 w-[400px] shrink-0 grow-0 rounded-2xl px-6 py-4 text-left" :class="isSKPAvailable ? 'bg-neutral-10 hover:bg-teal-light group hover:shadow-lg cursor-pointer' : 'bg-neutral-10 opacity-50 cursor-disabled'"
        @click="$emit('select', 'moving_goods')"
        >
        <div class="flex items-center justify-center w-[338px] h-[211px]">
          <IconBarangPindahan />
        </div>
        <div class="flex flex-col gap-4">
          <h3 class="text-heading-sm leading-[130%] font-semibold text-neutral-100 group-hover:text-teal">Skema Barang
            Pindahan</h3>

          <!-- Benefits -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-[2px] text-body-sm">
              <div class="flex items-center gap-1">
                <IconThumbsUp />
                <span class="font-normal text-neutral-90">
                  Benefits :
                </span>
              </div>
            </div>
            <!-- List of Benefits or 1 line text -->
            <p class="font-medium">Zero Tax – More Saving for You</p>
          </div>

          <!-- Requirements -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-[2px] text-body-sm">
              <div class="flex items-center gap-1">
                <IconDocumentRequirement />
                <span class="font-normal text-neutral-90">
                  Requirements :
                </span>
              </div>
            </div>
            <!-- List of Requirements or 1 line text -->
            <ul class="list-disc pl-7 font-[400]">
              <li>
                <div class="flex items-center gap-1">
                  Ship Personal Belongings Items
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75Z"
                      stroke="#404040" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M9 6H9.0075V6.0075H9V6Z" stroke="#404040" stroke-width="1.5" stroke-linejoin="round" />
                    <path
d="M9 9V12" stroke="#404040" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
              </li>
              <li>SKP from KBRI / KJRI</li>
            </ul>
          </div>
        </div>
      </button>

      <!-- Skema Barang Penumpang -->
      <button
        class="flex flex-col flex-1 gap-6 w-[400px] shrink-0 grow-0 bg-neutral-10 hover:bg-teal-light group hover:shadow-lg rounded-2xl px-6 py-4 text-left cursor-pointer" @click="$emit('select', 'passenger_goods')">
        <div class="flex items-center justify-center w-[338px] h-[211px]">
          <IconBarangPenumpang />
        </div>
        <div class="flex flex-col gap-4">
          <h3 class="text-heading-sm leading-[130%] font-semibold text-neutral-100 group-hover:text-teal">Skema Barang
            Penumpang</h3>

          <!-- Benefits -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-[2px] text-body-sm">
              <div class="flex items-center gap-1">
                <IconThumbsUp />
                <span class="font-normal text-neutral-90">
                  Benefits :
                </span>
              </div>
            </div>
            <!-- List of Benefits or 1 line text -->
            <ul class="list-disc pl-7 font-medium">
              <li>
                Send Your Brand New Items with No Tax
              </li>
              <li>Tax-Free for Shipments with Item Value under USD 500</li>
            </ul>
          </div>

          <!-- Requirements -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-[2px] text-body-sm">
              <div class="flex items-center gap-1">
                <IconDocumentRequirement />
                <span class="font-normal text-neutral-90">
                  Requirements :
                </span>
              </div>
            </div>
            <!-- List of Requirements or 1 line text -->
            <p>No SKP needed</p>
          </div>
        </div>
      </button>
    </div>

    <p class="mt-8 text-body-sm text-neutral-100">By continuing, you agree with our <span
        class="underline cursor-pointer">terms of
        service</span></p>
  </section>
</template>

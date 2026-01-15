<template>
  <!-- CTA -->
  <section class="w-full relative bg-[#FAFAFC] py-20">
    <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-[40px] leading-tight font-semibold text-[#1E1E1E]">
            Moving is part of your<br />
            International Journey
          </h2>

          <p class="text-[16px] text-[#6B6B6B]">Let us assist you</p>
        </div>

        <div class="flex items-center gap-4">
          <!-- Primary -->
          <NuxtLink to="/rates">
            <button
              class="h-[46px] px-[18px] rounded-[8px] bg-[#C1FF00] text-[14px] font-medium text-[#1E1E1E] hover:bg-[#A1D400] transition-colors">
              Back For Good
            </button>
          </NuxtLink>

          <!-- Secondary -->
          <NuxtLink to="/rates">
            <button
              class="h-[46px] px-[18px] rounded-[8px] bg-[#1E1E1E] text-[14px] font-medium text-white hover:bg-black transition-colors">
              Moving Abroad
            </button>
          </NuxtLink>

        </div>
      </div>

      <!-- RIGHT VISUAL -->
      <div class="absolute right-0 bottom-0">
        <img src="https://i.ibb.co.com/4Z6HtCDH/cta-van.png" alt="International moving illustration"
          class="w-full max-w-[560px] ml-auto object-contain" />
      </div>
    </div>
  </section>
</template>

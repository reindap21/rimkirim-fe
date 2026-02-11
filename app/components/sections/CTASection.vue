<script setup lang="ts">

const router = useRouter()

</script>

<template>
  <!-- CTA -->
  <section class="w-full relative bg-neutral-10 py-20">
    <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-[40px] leading-tight font-semibold text-neutral-100">
            Moving is part of your<br />
            International Journey
          </h2>

          <p class="text-[16px] text-[#6B6B6B]">Let us assist you</p>
        </div>

        <div class="flex items-center gap-4">
          <!-- Primary -->
          <PrimaryButton class="w-[138px]" @click="router.push('/rates')">
            Back For Good
          </PrimaryButton>

          <!-- Secondary -->
          <BlackButton class="w-[142px]" @click="router.push('/rates')">
            Moving Abroad
          </BlackButton>
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

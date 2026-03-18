<script setup lang="ts">
  import { MENU } from "~/config";

  import { onMounted } from "vue";

  const container = ref<HTMLDivElement | null>(null);

  onMounted(async () => {
    await import("@lottiefiles/lottie-player");
    const lottie = await import("lottie-web");

    lottie.default.loadAnimation({
      container: container.value!,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/lottie/hero-anim.json",
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    });
  });
</script>

<template>
  <!-- HERO WRAPPER -->
  <section class="relative overflow-visible h-[695px] mt-[108px] pt-[104px]">
    <div ref="container" class="absolute left-0 inset-0 w-full h-full pointer-events-none z-0" />
    <!-- HERO CONTENT -->
    <div
      class="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center gap-4 py-7"
    >
      <div
        class="flex gap-1 text-body-sm font-normal px-5 py-2 rounded-full bg-neutral-10 w-fit shrink-0"
      >
        <div
          class="relative flex gap-0.5 max-w-[232px] text-neutral-100 whitespace-nowrap overflow-hidden"
        >
          <div>New:</div>
          <div>Regulasi Pajak Barang Pindahan</div>
          <span
            class="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-[#FAFAFC] to-transparent pointer-events-none"
          ></span>
        </div>
        <div class="text-purple">Learn More</div>
      </div>

      <h1
        class="text-display font-bold text-neutral-100 max-w-[3xl] mx-auto text-center"
      >
        INTERNATIONAL<br />MOVING ASSISTANT
      </h1>

      <p class="text-body-lg text-neutral-90 max-w-[480px] mx-auto text-center">
        Every step of your move is carefully managed for a seamless experience.
      </p>

      <div class="flex justify-center">
        <NuxtLink
          :to="MENU.RATES"
          class="group relative w-[147px] h-[46px] rounded-full bg-primary text-neutral-100 font-medium inline-flex items-center justify-center transition-colors duration-300 hover:bg-primary-hover overflow-hidden text-body-sm"
        >
          <span
            class="absolute inset-0 -ml-4 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-2"
          >
            Check Rates
          </span>
          <span
            class="absolute right-4 flex text-[20px] leading-[22px] items-center justify-center transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:translate-x-2"
          >
            →
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

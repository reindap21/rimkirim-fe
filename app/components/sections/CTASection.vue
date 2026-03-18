<script setup lang="ts">
  import { onMounted } from "vue";

  const router = useRouter();
  const container = ref<HTMLDivElement | null>(null);

  onMounted(async () => {
    await import("@lottiefiles/lottie-player");
    const lottie = await import("lottie-web");

    lottie.default.loadAnimation({
      container: container.value!,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/lottie/cta.json",
      rendererSettings: {
        preserveAspectRatio: "xMaxYMid slice",
      },
    });
  });
</script>

<template>
  <!-- CTA -->
  <section class="w-full relative overflow-hidden bg-neutral-10 py-20 min-h-[400px]">
    <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-[40px] leading-tight font-semibold text-neutral-100">
            Moving is part of your<br />
            International Journey
          </h2>

          <p class="text-body text-neutral-gray">Let us assist you</p>
        </div>

        <div class="flex items-center gap-4">
          <BlackButton class="w-[138px]" @click="router.push('/rates')">
            Back For Good
          </BlackButton>

          <!-- Secondary -->
          <BlackButton class="w-[142px]" @click="router.push('/rates')">
            Moving Abroad
          </BlackButton>
        </div>
      </div>

      <!-- RIGHT VISUAL -->
      <div ref="container" class="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none z-0" />
    </div>
  </section>
</template>

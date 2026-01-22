<script setup lang="ts">
  import { MENU } from "~/config";
  import type { Rate } from "~/types/rate";

  interface Props {
    rates: Rate[];
    loading: boolean;
  }

  // * ------- Composable --------------------------------------------------------------------------------------------------------------------------------------------

  const authModal = useAuthModal();
  const { user } = useAuth();

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const props = withDefaults(defineProps<Props>(), {
    rates: () => [],
    loading: true,
  });

  const router = useRouter();

  const actionMoveNowLoading = ref<string | null>(null);

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  // Sync with page rates
  const handleActionMoveNow = async (rate: Rate) => {
    // If not loggedin then open popup login
    if (!user.value) {
      authModal.openLogin();
      return;
    }

    // Set Loading
    actionMoveNowLoading.value = rate.id;

    // Fetch API
    // Sync with Page Rates
    try {
      await $fetch(`/api/eligibility`, {
        method: "GET",
        credentials: "include", // Required
        params: {
          rateId: rate.id,
        },
      });

      // If success
      router.push({
        path: MENU.ELIGIBLE,
        query: {
          rateId: rate.id,
          origin: rate?.route?.origin?.country_code,
        },
      });
    } catch (err) {
      console.error("fetch eligibility error:", err);
      actionMoveNowLoading.value = "";
    }
  };
</script>

<template>
  <!-- Top gap set on Hero -->
  <!-- SPECIAL RATES -->
  <section class="w-full max-w-5xl mx-auto pb-10 flex flex-col gap-3 -mt-20">
    <template v-if="loading">
      <UIRateCardSkeleton />
      <UIRateCardSkeleton />
    </template>
    <template v-else>
      <template v-for="rate in rates" :key="rate.id">
        <UIRateCard
          :price="rate?.pricing?.amount"
          :currency="rate?.pricing?.currency"
          :unit="rate?.pricing?.unit"
          :minWeight="rate?.pricing?.minimum?.value"
          badge="Special Rate"
          :provider="rate?.provider?.branding?.logo"
          :originCountry="rate?.route?.origin?.country_name"
          :originFlag="rate?.assets?.flags?.origin"
          :destinationCountry="rate?.route?.destination?.country_name"
          :destinationFlag="rate?.assets?.flags?.destination"
          :eta="rate?.eta"
          :isDirect="rate?.route?.is_direct"
          :terms="rate?.terms"
          :loading="actionMoveNowLoading === rate.id"
          @action="handleActionMoveNow(rate)"
        />
      </template>

      <!-- CTA BELOW SPECIAL RATES -->
      <div class="py-8 flex justify-center">
        <NuxtLink
          :to="MENU.RATES"
          class="group inline-flex items-center gap-2 text-[18px] font-normal text-neutral-100 transition focus-visible:rounded-md focus-visible:ring-offset-[6px]"
        >
          <span class="relative">
            Check more country
            <span
              class="absolute left-0 -bottom-1 h-px w-0 bg-neutral-100 transition-all duration-300 group-hover:w-full"
            ></span>
          </span>
          <span class="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </NuxtLink>
      </div>
    </template>
  </section>
</template>

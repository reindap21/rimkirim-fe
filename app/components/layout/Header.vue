<script setup lang="ts">
  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  interface Props {
    use?: "eligible" | "order-hub" | "home" | null | undefined;
  }

  const props = withDefaults(defineProps<Props>(), {
    use: "home",
  });

  const { user, loading } = useAuth();
  const authModal = useAuthModal();

  // When use home; fetching user will appear
  // Default loggedin for order
  const useNavHome = !props?.use || props.use === "home";
  const useNavOrderHub = props.use === "order-hub";
  const useNavEligible = props.use === "eligible";

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Open modal login
   */
  const openLogin = () => {
    authModal.openLogin();
  };
</script>

<template>
  <header
    v-if="useNavHome"
    id="navbar"
    class="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1072px] transition-all duration-300 bg-transparent"
  >
    <div
      id="navbarInner"
      class="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-4 h-[70px] flex items-center justify-between transition-all duration-300"
    >
      <div>
        <NuxtLink to="/" class="brand-logo">
          <UIBrandLogo fill="#1E1E1E" />
        </NuxtLink>
      </div>
      <nav
        v-if="use === 'home'"
        class="hidden md:flex items-center gap-3 text-body-sm text-gray-700 magnetic-group"
      >
        <a
          href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100"
          >Moving</a
        >
        <a
          href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100"
          >About Us</a
        >
        <a
          href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100"
          >Articles</a
        >
        <a
          href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100"
          >Jobs</a
        >
        <a
          href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100"
          >FAQs</a
        >
      </nav>
      <div class="flex items-center gap-4">
        <div
          class="text-body-sm px-4 py-2 font-medium text-neutral-100 cursor-pointer"
        >
          EN
        </div>
        <template v-if="loading">...</template>
        <template v-else>
          <template v-if="!user && useNavHome">
            <button
              class="text-body-sm font-medium text-white bg-neutral-100 hover:bg-neutral-90 rounded-full w-[102px] h-[46px] flex items-center justify-center"
              @click="openLogin"
            >
              Login
            </button>
          </template>

          <template v-else>
            <div class="relative flex gap-2 items-center cursor-pointer">
              <button
                class="flex items-center gap-2 text-body-sm font-medium text-neutral-100"
              >
                <span class="truncate max-w-[120px]">
                  {{ user?.name?.split(" ")?.[0] || "..." }}
                </span>
              </button>
              <IconAvatar />
            </div>
          </template>
        </template>
      </div>
    </div>
  </header>
  <header
    v-if="useNavOrderHub || useNavEligible"
    id="navbar"
    class="fixed top-0 left-0 z-50 px-[28px] py-4 w-full transition-all duration-300"
    :class="useNavEligible ? 'bg-white' : 'bg-neutral-10'"
  >
    <div class="flex justify-between items-center">
      <UIBrandLogo fill="#1E1E1E" />
      <div class="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full">
        <div
          class="text-body-lg px-4 py-2 font-medium text-neutral-100 cursor-pointer"
        >
          EN
        </div>
        <!-- <button class="w-full text-left text-body-sm text-red-600" @click="logout">
          Logout
        </button> -->
        <div class="relative flex gap-2 items-center cursor-pointer">
          <button
            class="flex items-center gap-2 text-body-sm font-medium text-neutral-100"
          >
            <span class="truncate max-w-[120px]">
              {{ user?.name?.split(" ")?.[0] || "..." }}
            </span>
          </button>
          <IconAvatar />
        </div>
      </div>
    </div>
  </header>
</template>

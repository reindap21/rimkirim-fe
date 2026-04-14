<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";

  interface Props {
    use?: "eligible" | "order-hub" | "home" | null | undefined;
  }

  const props = withDefaults(defineProps<Props>(), {
    use: "home",
  });

  const { user, loading, logout } = useAuth();
  const authModal = useAuthModal();

  const useNavHome = !props?.use || props.use === "home";
  const useNavOrderHub = props.use === "order-hub";
  const useNavEligible = props.use === "eligible";

  const dropdownOpen = ref(false);
  const logoutLoading = ref(false);

  const openLogin = () => {
    authModal.openLogin();
  };

  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };

  // Close dropdown on outside click
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#user-dropdown-wrapper")) {
      dropdownOpen.value = false;
    }
  };

  onMounted(() => document.addEventListener("click", handleClickOutside));
  onUnmounted(() => document.removeEventListener("click", handleClickOutside));

  const handleLogout = async () => {
    logoutLoading.value = true;
    dropdownOpen.value = false;
    try {
      await logout();
    } finally {
      logoutLoading.value = false;
    }
  };
</script>

<template>
  <!-- ── HOME NAVBAR ─────────────────────────────────────────── -->
  <header
    v-if="useNavHome"
    id="navbar"
    class="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1072px] transition-all duration-300 bg-transparent"
  >
    <div
      id="navbarInner"
      class="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-4 h-[70px] flex items-center justify-between transition-all duration-300"
    >
      <!-- Logo -->
      <NuxtLink to="/" class="brand-logo">
        <UIBrandLogo fill="#1E1E1E" />
      </NuxtLink>

      <!-- Nav links -->
      <nav class="hidden md:flex items-center gap-3 text-body-sm text-gray-700 magnetic-group">
        <a href="#" class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100">Moving</a>
        <a href="#" class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100">About Us</a>
        <a href="#" class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100">Articles</a>
        <a href="#" class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100">Jobs</a>
        <a href="#" class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-primary hover:text-neutral-100">FAQs</a>
      </nav>

      <!-- Right side -->
      <div class="flex items-center gap-4">
        <div class="text-body-sm px-4 py-2 font-medium text-neutral-100 cursor-pointer">EN</div>

        <template v-if="loading">
          <div class="w-[102px] h-[46px] bg-neutral-20 rounded-full animate-pulse" />
        </template>
        <template v-else>
          <!-- Guest -->
          <template v-if="!user">
            <button
              class="text-body-sm font-medium text-white bg-neutral-100 hover:bg-neutral-90 rounded-full w-[102px] h-[46px] flex items-center justify-center transition-colors"
              @click="openLogin"
            >
              Login
            </button>
          </template>

          <!-- Logged in -->
          <template v-else>
            <div id="user-dropdown-wrapper" class="relative">
              <button
                class="flex items-center gap-2 text-body-sm font-medium text-neutral-100 px-3 py-2 rounded-full hover:bg-neutral-20 transition-colors"
                @click.stop="toggleDropdown"
              >
                <span class="truncate max-w-[120px]">{{ user?.name?.split(" ")?.[0] || "..." }}</span>
                <IconAvatar />
              </button>

              <Transition name="dropdown">
                <div
                  v-if="dropdownOpen"
                  class="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-2xl shadow-xl border border-neutral-20 overflow-hidden z-[100]"
                >
                  <div class="px-4 pt-3 pb-2">
                    <p class="text-[12px] text-neutral-50 font-medium uppercase tracking-wide">Account</p>
                    <p class="text-body-sm font-medium text-neutral-90 truncate mt-0.5">{{ user?.name }}</p>
                  </div>
                  <div class="h-px bg-neutral-20" />
                  <button
                    class="w-full text-left flex items-center gap-2 px-4 py-3 text-body-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                    :disabled="logoutLoading"
                    @click="handleLogout"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    {{ logoutLoading ? "Logging out..." : "Logout" }}
                  </button>
                </div>
              </Transition>
            </div>
          </template>
        </template>
      </div>
    </div>
  </header>

  <!-- ── ORDER HUB / ELIGIBLE NAVBAR ───────────────────────────── -->
  <header
    v-if="useNavOrderHub || useNavEligible"
    id="navbar"
    class="fixed top-0 left-0 z-50 px-[28px] py-4 w-full transition-all duration-300"
    :class="useNavEligible ? 'bg-white' : 'bg-neutral-10'"
  >
    <div class="flex justify-between items-center">
      <UIBrandLogo fill="#1E1E1E" />
      <div class="flex items-center gap-2 px-3 py-2 bg-white shadow-lg rounded-full">
        <div class="text-body-lg px-3 py-1 font-medium text-neutral-100 cursor-pointer">EN</div>

        <div id="user-dropdown-wrapper" class="relative">
          <button
            class="flex items-center gap-2 text-body-sm font-medium text-neutral-100 px-2 py-1.5 rounded-full hover:bg-neutral-10 transition-colors"
            @click.stop="toggleDropdown"
          >
            <span class="truncate max-w-[120px]">{{ user?.name?.split(" ")?.[0] || "..." }}</span>
            <IconAvatar />
          </button>

          <Transition name="dropdown">
            <div
              v-if="dropdownOpen"
              class="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-2xl shadow-xl border border-neutral-20 overflow-hidden z-[100]"
            >
              <div class="px-4 pt-3 pb-2">
                <p class="text-[12px] text-neutral-50 font-medium uppercase tracking-wide">Account</p>
                <p class="text-body-sm font-medium text-neutral-90 truncate mt-0.5">{{ user?.name }}</p>
              </div>
              <div class="h-px bg-neutral-20" />
              <button
                class="w-full text-left flex items-center gap-2 px-4 py-3 text-body-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                :disabled="logoutLoading"
                @click="handleLogout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {{ logoutLoading ? "Logging out..." : "Logout" }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>

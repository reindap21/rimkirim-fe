<script setup lang="ts">

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

interface Props {
  use?: "order" | "home" | null | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  use: "home"
})

const { user, logout, loading } = useAuth()
const authModal = useAuthModal()

// When use home; fetching user will appear
// Default loggedin for order
const useNavHome = !props?.use || props.use === 'home';
const useNavOrder = !props?.use || props.use === 'order';

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Open modal login 
 */
const openLogin = () => {
  authModal.openLogin()
}

</script>

<template>
  <header id="navbar"
    class="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1072px] transition-all duration-300"
    v-if="useNavHome">
    <div id="navbarInner"
      class="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-4 h-[70px] flex items-center justify-between transition-all duration-300">
      <div>
        <NuxtLink to="/" class="brand-logo">
          <UIBrandLogo fill="#1E1E1E" />
        </NuxtLink>
      </div>
      <nav class="hidden md:flex items-center gap-3 text-[14px] leading-[22px] text-gray-700 magnetic-group" v-if="use === 'home'">
        <a href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#C1FF00] hover:text-[#1E1E1E]">Moving</a>
        <a href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#C1FF00] hover:text-[#1E1E1E]">About
          Us</a>
        <a href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#C1FF00] hover:text-[#1E1E1E]">Articles</a>
        <a href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#C1FF00] hover:text-[#1E1E1E]">Jobs</a>
        <a href="#"
          class="magnetic rounded-full px-3 py-2 font-medium leading-[22px] transition-transform duration-200 hover:scale-[1.03] hover:bg-[#C1FF00] hover:text-[#1E1E1E]">FAQs</a>
      </nav>
      <div class="flex items-center gap-4">
        <div class="text-[14px] leading-[22px] px-4 py-2 font-medium text-[#1E1E1E] cursor-pointer">EN</div>
        <template v-if="loading">...</template>
        <template v-else>
          <template v-if="!user && useNavHome">
            <button
              class="text-[14px] leading-[22px] font-medium text-white bg-[#1E1E1E] hover:bg-[#2E2E2E] rounded-full w-[102px] h-[46px] flex items-center justify-center"
              @click="openLogin">
              Login
            </button>
          </template>

          <template v-else>
            <div class="relative flex gap-2 items-center cursor-pointer">
              <button class="flex items-center gap-2 text-[14px] leading-[22px] font-medium text-[#1E1E1E]">
                <span class="truncate max-w-[120px]">
                  {{ user?.name?.split(" ")?.[0] || '...' }}
                </span>

              </button>
              <IconAvatar />
              <!-- <button class="w-full text-left text-[14px] leading-[22px] text-red-600" @click="logout">
                  Logout
                </button> -->
            </div>
          </template>
        </template>
      </div>
    </div>
  </header>
  <header id="navbar" class="fixed top-0 left-0 z-50 px-[28px] py-4 w-full transition-all duration-300 bg-[#FAFAFC]"
    v-if="useNavOrder">
    <div class="flex justify-between items-center">
      <UIBrandLogo fill="#1E1E1E" />
      <div class="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full">
        <div class="text-[18px] leading-[26px] px-4 py-2 font-medium text-[#1E1E1E] cursor-pointer">EN</div>
        <div class="relative flex gap-2 items-center cursor-pointer">
          <button class="flex items-center gap-2 text-[14px] leading-[22px] font-medium text-[#1E1E1E]">
            <span class="truncate max-w-[120px]">
              {{ user?.name?.split(" ")?.[0] || '...' }}
            </span>

          </button>
          <IconAvatar />
          <!-- <button class="w-full text-left text-[14px] leading-[22px] text-red-600" @click="logout">
                  Logout
                </button> -->
        </div>
      </div>
    </div>
  </header>

</template>
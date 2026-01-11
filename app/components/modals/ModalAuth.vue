<script setup>
defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: "login",
    validator: (v) => ["login", "signup"].includes(v),
  },
  source: {
    type: String,
    default: "header",
  },
});

const emit = defineEmits(["close", "update:mode"]);
</script>

<template>
  <!-- OVERLAY -->
  <Transition name="fade">
    <div
      v-if="open"
      id="modal-auth"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/50"
    >
      <div
        class="relative w-[450px] bg-[#1E1E1E] flex flex-col gap-6 rounded-2xl px-6 py-8 text-white overflow-hidden"
      >
        <div class="flex items-center justify-between">
          <!-- Brand Logo -->
          <UIBrandLogo width="95" height="32" />
          <!-- Close -->
          <button
            @click="emit('close')"
          >
            <IconClose />
          </button>
        </div>

        <!-- LOGIN -->
        <div v-if="mode === 'login'" id="login" class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex flex-col gap-1">
            <h5 class="text-[24px] leading-[130%] font-medium">Login</h5>
            <p class="text-[14px] leading-[22px] font-[400] text-white">Please enter your credential</p>
          </div>

          <!-- Form -->
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-[6px]">
              <label class="text-sm">Email</label>
              <input
                type="email"
                placeholder="example@mail.com"
                class="w-full h-[46px] rounded-lg px-4 text-black"
              />
            </div>

            <div class="flex flex-col gap-[6px]">
              <label class="text-sm">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                class="w-full h-[46px] rounded-lg px-4 text-black border-2 border-lime-400"
              />
              <div class="text-right text-[12px] leading-5 font-[400] text-[#399CE5] cursor-pointer">
                Forgot password?
              </div>
            </div>

            <button
              class="w-full h-[46px] rounded-lg bg-[#E6E6E6] text-black font-medium"
            >
              Login
            </button>

            <button
              class="w-full h-[46px] rounded-lg bg-white text-black font-medium flex items-center justify-center gap-2"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                class="w-5"
              />
              Login with Google
            </button>
          </div>

          <!-- Footer -->
          <p class="text-[14px] leading-[22px] font-[400] text-center text-white">
            Don’t have an account?
            <span
              class="text-[#399CE5] cursor-pointer"
              @click="$emit('update:mode', 'signup')"
            >
              Sign Up
            </span>
          </p>
        </div>

        <!-- SIGNUP -->
        <div v-if="mode === 'signup'" id="signup" class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex flex-col gap-1">
            <h5 class="text-[24px] leading-[130%] font-medium">Sign Up</h5>
            <p class="text-[14px] leading-[22px] font-[400] text-white">Please enter your credential</p>
          </div>

          <!-- Form -->
          <form class="flex flex-col gap-4">
            <!-- Name -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-white/70">Name</label>
              <input
                type="text"
                placeholder="Juliana"
                class="h-[46px] rounded-md bg-white px-4 text-sm text-black outline-none"
              />
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-white/70">Email</label>
              <input
                type="email"
                placeholder="juliana@hihihi.com"
                class="h-[46px] rounded-md bg-white px-4 text-sm text-black outline-none"
              />
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-white/70">Password</label>
              <input
                type="password"
                placeholder="********"
                class="h-[46px] rounded-md bg-white px-4 text-sm text-black outline-none"
              />
            </div>

            <!-- Confirm Password -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-white/70">Confirm Password</label>
              <input
                type="password"
                placeholder="H6ghr49!"
                class="h-[46px] rounded-md bg-white px-4 text-sm text-black outline-none"
              />
            </div>

            <!-- Primary Button -->
            <button
              type="submit"
              class="mt-2 h-[46px] rounded-md bg-[#E5E5E5] text-sm font-medium text-[#9E9E9E]"
            >
              Login
            </button>

            <!-- Divider -->
            <div class="flex items-center gap-3">
              <div class="h-px flex-1 bg-white/20"></div>
              <span class="text-xs text-white/40">or</span>
              <div class="h-px flex-1 bg-white/20"></div>
            </div>

            <!-- Google Login -->
            <button
              type="button"
              class="flex h-[46px] items-center justify-center gap-2 rounded-md bg-white text-sm font-medium text-black"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                class="h-4 w-4"
              />
              Login with Google
            </button>
          </form>

          <!-- Footer -->
          <p class="text-[14px] leading-[22px] font-[400] text-center text-white">
            Already have an account?
            <span
              class="text-[#399CE5] cursor-pointer"
              @click="$emit('update:mode', 'login')"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

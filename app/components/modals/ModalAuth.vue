<script setup>
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

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
          <button @click="emit('close')">
            <IconClose />
          </button>
        </div>

        <!-- LOGIN -->
        <div v-if="mode === 'login'" id="login" class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex flex-col gap-1">
            <h5 class="text-[24px] leading-[130%] font-medium">Login</h5>
            <p class="text-[14px] leading-[22px] font-[400] text-white">
              Please enter your credential
            </p>
          </div>

          <!-- Form -->
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-[6px]">
              <label class="text-sm">Email</label>
              <IconField>
                <InputIcon class="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.3333 6.01891L12.778 9.07794C11.7387 9.65022 10.8939 10 9.99996 10C9.10597 10 8.26119 9.65022 7.22192 9.07794L1.66663 6.01891L2.26147 5L7.81677 8.05903C8.8253 8.61435 9.43735 8.82855 9.99996 8.82855C10.5626 8.82855 11.1746 8.61435 12.1832 8.05903L17.7384 5L18.3333 6.01891Z"
                      fill="#9E9E9E"
                    />
                    <path
                      d="M7.7365 2.52984C9.25038 2.49006 10.7495 2.49005 12.2634 2.52984C13.4661 2.56145 14.4317 2.58486 15.2036 2.72542C16.0016 2.8708 16.6503 3.15019 17.1983 3.72551C17.7439 4.29842 18.0089 4.96702 18.1453 5.78823C18.2768 6.58046 18.296 7.56654 18.3209 8.79086C18.3374 9.59853 18.3374 10.4014 18.3209 11.2091C18.296 12.4334 18.2768 13.4195 18.1453 14.2117C18.0089 15.033 17.7439 15.7015 17.1983 16.2745C16.6503 16.8498 16.0016 17.1292 15.2036 17.2746C14.4317 17.4151 13.4661 17.4385 12.2634 17.4701C10.7495 17.51 9.25038 17.51 7.7365 17.4701C6.53375 17.4385 5.56815 17.4151 4.79631 17.2746C3.99827 17.1292 3.34955 16.8498 2.80161 16.2745C2.25602 15.7015 1.99093 15.0329 1.8546 14.2117C1.72309 13.4195 1.70393 12.4334 1.67897 11.2091C1.66251 10.4014 1.66251 9.59854 1.67897 8.79086C1.70393 7.56655 1.72309 6.58045 1.8546 5.78823C1.99093 4.96703 2.256 4.29841 2.80161 3.72551C3.34955 3.15017 3.99827 2.8708 4.79631 2.72542C5.56816 2.58486 6.53375 2.56145 7.7365 2.52984ZM12.2346 3.7453C10.7401 3.70602 9.25974 3.70603 7.76527 3.7453C6.52777 3.77782 5.66294 3.80265 4.9954 3.92426C4.35401 4.04112 3.95408 4.23856 3.62522 4.58385C3.29411 4.93156 3.10813 5.34478 2.99994 5.99648C2.88698 6.67712 2.86744 7.55528 2.84173 8.8162C2.82561 9.60679 2.82561 10.3932 2.84173 11.1838C2.86743 12.4447 2.88699 13.3229 2.99994 14.0035C3.10813 14.6552 3.29412 15.0684 3.62522 15.4161C3.95407 15.7614 4.35399 15.9589 4.9954 16.0757C5.66294 16.1973 6.52777 16.2221 7.76527 16.2547H7.76602C9.26035 16.294 10.7403 16.294 12.2346 16.2547C13.4721 16.2221 14.3369 16.1973 15.0045 16.0757C15.6459 15.9589 16.0458 15.7614 16.3746 15.4161C16.7058 15.0684 16.8917 14.6552 16.9999 14.0035C17.1129 13.3229 17.1325 12.4447 17.1581 11.1838C17.1743 10.3932 17.1743 9.60676 17.1581 8.8162C17.1325 7.55528 17.1129 6.67712 16.9999 5.99648C16.8917 5.34477 16.7058 4.93156 16.3746 4.58385C16.0458 4.23855 15.6459 4.04111 15.0045 3.92426C14.3369 3.80265 13.4721 3.77783 12.2346 3.7453Z"
                      fill="#9E9E9E"
                    />
                  </svg>
                </InputIcon>
                <InputText
                  v-model="value"
                  placeholder="Enter your email"
                  class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#9E9E9E] placeholder:text-[#9E9E9E]"
                  variant="filled"
                  fluid
                />
              </IconField>
            </div>

            <div class="flex flex-col gap-[6px]">
              <label class="text-sm">Password</label>
              <IconField>
                <InputIcon class="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.9533 9.20352C18.2066 9.55877 18.3333 9.73643 18.3333 9.99935C18.3333 10.2623 18.2066 10.4399 17.9533 10.7952C16.8149 12.3915 13.9076 15.8327 9.99996 15.8327C6.09228 15.8327 3.18504 12.3915 2.04666 10.7952C1.7933 10.4399 1.66663 10.2623 1.66663 9.99935C1.66663 9.73643 1.7933 9.55877 2.04666 9.20352C3.18504 7.60722 6.09228 4.16602 9.99996 4.16602C13.9076 4.16602 16.8149 7.60722 17.9533 9.20352Z"
                      stroke="#9E9E9E"
                      stroke-width="1.5"
                    />
                    <path
                      d="M12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10Z"
                      stroke="#9E9E9E"
                      stroke-width="1.5"
                    />
                  </svg>
                </InputIcon>
                <InputText
                  v-model="value"
                  placeholder="Enter your password"
                  class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#9E9E9E] placeholder:text-[#9E9E9E]"
                  type="email"
                  fluid
                />
              </IconField>
              <div
                class="text-right text-[12px] leading-5 font-[400] text-[#399CE5] cursor-pointer"
              >
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
          <p
            class="text-[14px] leading-[22px] font-[400] text-center text-white"
          >
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
            <p class="text-[14px] leading-[22px] font-[400] text-white">
              Please enter your credential
            </p>
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
          <p
            class="text-[14px] leading-[22px] font-[400] text-center text-white"
          >
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

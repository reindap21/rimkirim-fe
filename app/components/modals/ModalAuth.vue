<script setup>

import { Form } from '@primevue/forms';
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

const emit = defineEmits(["close", "update:mode", "success"]);

const loading = ref(false);
const loginError = ref('');
const signupError = ref('');

async function handleLogin({ values, valid }) {
  if (!valid) return

  loginError.value = ''
  loading.value = true

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: values,
    })

    emit('success', res)
    emit('close')
  } catch (err) {
    loginError.value =
      err?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
};

async function handleSignin({ values, valid }) {
  if (!valid) return;

  signupError.value = ''
  loading.value = true

  try {
    const res = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: values,
    })

    emit('success', res)
    emit('close')
  } catch (err) {
    signupError.value =
      err?.data?.message || 'Sign up failed'
  } finally {
    loading.value = false
  }
};

</script>

<template>
  <Transition name="fade">
    <div v-if="open" id="modal-auth" class="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
      <div class="relative w-[450px] bg-[#1E1E1E] flex flex-col gap-6 rounded-2xl px-6 py-8 text-white overflow-hidden">

        <div class="flex items-center justify-between">
          <UIBrandLogo width="95" height="32" />
          <button @click="emit('close')">
            <IconClose />
          </button>
        </div>

        <!-- LOGIN -->
        <div v-if="mode === 'login'" id="login" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <h5 class="text-[24px] leading-[130%] font-medium">Login</h5>
            <p class="text-[14px] leading-[22px] font-[400] text-white">
              Please enter your credential
            </p>
          </div>

          <p v-if="loginError"
            class="flex gap-4 px-4 py-3 text-[14px] leading-[22px] font-[400] bg-[#FFEDED] text-[#FF4D4F] rounded-[12px]">
            <span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.9999 2.25C13.4982 2.25 14.6341 3.11496 15.7059 4.47656C16.7686 5.82643 17.895 7.82858 19.3407 10.3926L19.705 11.0371C20.9038 13.1629 21.8522 14.8389 22.3475 16.1807C22.8484 17.5377 22.9667 18.7705 22.2089 19.8574C21.4734 20.9119 20.2464 21.3432 18.6991 21.5469C17.1457 21.7513 15.0527 21.75 12.3641 21.75H11.6366C8.94793 21.75 6.85411 21.7514 5.30067 21.5469C3.75346 21.3432 2.52631 20.9119 1.79091 19.8574C1.03307 18.7705 1.15229 17.5378 1.65321 16.1807C2.14853 14.8389 3.09598 13.1629 4.29481 11.0371L4.65907 10.3926C6.10492 7.8284 7.23213 5.82647 8.29481 4.47656C9.36662 3.1151 10.5018 2.25009 11.9999 2.25ZM11.9999 3.75C11.1873 3.75008 10.4382 4.17894 9.47352 5.4043C8.49958 6.64148 7.43762 8.52047 5.96571 11.1309H5.96473L5.60145 11.7754C4.3755 13.9493 3.50381 15.4991 3.06044 16.7002C2.62286 17.8857 2.68332 18.5141 3.02137 18.999C3.38194 19.5162 4.059 19.8703 5.49696 20.0596C6.92901 20.2481 8.90339 20.25 11.6366 20.25H12.3641C15.0975 20.25 17.0717 20.2481 18.5038 20.0596C19.9415 19.8703 20.6188 19.5161 20.9794 18.999C21.3173 18.5142 21.3778 17.8854 20.9403 16.7002C20.4969 15.499 19.6254 13.9486 18.3993 11.7744V11.7754L18.035 11.1309C16.5631 8.52048 15.5012 6.64148 14.5272 5.4043C13.5624 4.17865 12.8126 3.75 11.9999 3.75Z"
                  fill="#FF4D4F" />
                <path
                  d="M11.25 13V8C11.25 7.58579 11.5858 7.25 12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13Z"
                  fill="#FF4D4F" />
                <path
                  d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z"
                  fill="#FF4D4F" />
              </svg>

            </span>
            <span>
              {{ loginError }}
            </span>
          </p>

          <div v-if="mode === 'login'" id="login" class="flex flex-col gap-4">

            <!-- Form -->
            <Form @submit="handleLogin" validate-on="submit" class="flex flex-col gap-4">
              <div class="flex flex-col gap-4">
                <!-- Email -->
                <FormField name="email" rules="required|email" v-slot="{ value, errors, handleChange }">
                  <div class="flex flex-col gap-[6px]">
                    <label class="text-sm">Email</label>
                    <IconField>
                      <InputIcon class="">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M18.3333 6.01891L12.778 9.07794C11.7387 9.65022 10.8939 10 9.99996 10C9.10597 10 8.26119 9.65022 7.22192 9.07794L1.66663 6.01891L2.26147 5L7.81677 8.05903C8.8253 8.61435 9.43735 8.82855 9.99996 8.82855C10.5626 8.82855 11.1746 8.61435 12.1832 8.05903L17.7384 5L18.3333 6.01891Z"
                            fill="#9E9E9E" />
                          <path
                            d="M7.7365 2.52984C9.25038 2.49006 10.7495 2.49005 12.2634 2.52984C13.4661 2.56145 14.4317 2.58486 15.2036 2.72542C16.0016 2.8708 16.6503 3.15019 17.1983 3.72551C17.7439 4.29842 18.0089 4.96702 18.1453 5.78823C18.2768 6.58046 18.296 7.56654 18.3209 8.79086C18.3374 9.59853 18.3374 10.4014 18.3209 11.2091C18.296 12.4334 18.2768 13.4195 18.1453 14.2117C18.0089 15.033 17.7439 15.7015 17.1983 16.2745C16.6503 16.8498 16.0016 17.1292 15.2036 17.2746C14.4317 17.4151 13.4661 17.4385 12.2634 17.4701C10.7495 17.51 9.25038 17.51 7.7365 17.4701C6.53375 17.4385 5.56815 17.4151 4.79631 17.2746C3.99827 17.1292 3.34955 16.8498 2.80161 16.2745C2.25602 15.7015 1.99093 15.0329 1.8546 14.2117C1.72309 13.4195 1.70393 12.4334 1.67897 11.2091C1.66251 10.4014 1.66251 9.59854 1.67897 8.79086C1.70393 7.56655 1.72309 6.58045 1.8546 5.78823C1.99093 4.96703 2.256 4.29841 2.80161 3.72551C3.34955 3.15017 3.99827 2.8708 4.79631 2.72542C5.56816 2.58486 6.53375 2.56145 7.7365 2.52984ZM12.2346 3.7453C10.7401 3.70602 9.25974 3.70603 7.76527 3.7453C6.52777 3.77782 5.66294 3.80265 4.9954 3.92426C4.35401 4.04112 3.95408 4.23856 3.62522 4.58385C3.29411 4.93156 3.10813 5.34478 2.99994 5.99648C2.88698 6.67712 2.86744 7.55528 2.84173 8.8162C2.82561 9.60679 2.82561 10.3932 2.84173 11.1838C2.86743 12.4447 2.88699 13.3229 2.99994 14.0035C3.10813 14.6552 3.29412 15.0684 3.62522 15.4161C3.95407 15.7614 4.35399 15.9589 4.9954 16.0757C5.66294 16.1973 6.52777 16.2221 7.76527 16.2547H7.76602C9.26035 16.294 10.7403 16.294 12.2346 16.2547C13.4721 16.2221 14.3369 16.1973 15.0045 16.0757C15.6459 15.9589 16.0458 15.7614 16.3746 15.4161C16.7058 15.0684 16.8917 14.6552 16.9999 14.0035C17.1129 13.3229 17.1325 12.4447 17.1581 11.1838C17.1743 10.3932 17.1743 9.60676 17.1581 8.8162C17.1325 7.55528 17.1129 6.67712 16.9999 5.99648C16.8917 5.34477 16.7058 4.93156 16.3746 4.58385C16.0458 4.23855 15.6459 4.04111 15.0045 3.92426C14.3369 3.80265 13.4721 3.77783 12.2346 3.7453Z"
                            fill="#9E9E9E" />
                        </svg>
                      </InputIcon>
                      <InputText type="email" :model-value="value" @update:model-value="handleChange"
                        placeholder="Enter your email"
                        class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                        variant="filled" fluid />
                    </IconField>
                    <small v-if="errors?.length" class="text-red-400">
                      {{ errors[0] }}
                    </small>
                  </div>
                </FormField>
                <!-- Password -->
                <FormField name="password" rules="required|min:6" v-slot="{ value, errors, handleChange }">
                  <div class="flex flex-col gap-[6px]">
                    <label class="text-sm">Password</label>
                    <IconField>
                      <InputIcon class="">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M17.9533 9.20352C18.2066 9.55877 18.3333 9.73643 18.3333 9.99935C18.3333 10.2623 18.2066 10.4399 17.9533 10.7952C16.8149 12.3915 13.9076 15.8327 9.99996 15.8327C6.09228 15.8327 3.18504 12.3915 2.04666 10.7952C1.7933 10.4399 1.66663 10.2623 1.66663 9.99935C1.66663 9.73643 1.7933 9.55877 2.04666 9.20352C3.18504 7.60722 6.09228 4.16602 9.99996 4.16602C13.9076 4.16602 16.8149 7.60722 17.9533 9.20352Z"
                            stroke="#9E9E9E" stroke-width="1.5" />
                          <path
                            d="M12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10Z"
                            stroke="#9E9E9E" stroke-width="1.5" />
                        </svg>
                      </InputIcon>
                      <InputText type="password" :model-value="value" @update:model-value="handleChange"
                        placeholder="Enter your password"
                        class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                        fluid />
                    </IconField>
                    <small v-if="errors?.length" class="text-red-400">
                      {{ errors[0] }}
                    </small>
                    <div class="text-right text-[12px] leading-5 font-[400] text-[#399CE5] cursor-pointer">
                      Forgot password?
                    </div>
                  </div>
                </FormField>

                <button type="submit" :disabled="loading" :class="[
                  'w-full h-[46px] rounded-lg font-medium transition-colors',
                  loading
                    ? 'bg-[#E6E6E6] text-black cursor-not-allowed'
                    : 'bg-[#C1FF00] text-black hover:brightness-95'
                ]">
                  <span v-if="!loading">Login</span>
                  <span v-else>Login...</span>
                </button>

                <button
                  class="w-full h-[46px] rounded-lg bg-white text-black font-medium flex items-center justify-center gap-2">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5" />
                  Login with Google
                </button>
              </div>
            </Form>

            <!-- Footer -->
            <p class="text-[14px] leading-[22px] font-[400] text-center text-white">
              Don't have an account?
              <span class="text-[#399CE5] cursor-pointer" @click="$emit('update:mode', 'signup')">
                Sign Up
              </span>
            </p>
          </div>
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

          <p v-if="signupError"
            class="flex gap-4 px-4 py-3 text-[14px] leading-[22px] font-[400] bg-[#FFEDED] text-[#FF4D4F] rounded-[12px]">
            <span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.9999 2.25C13.4982 2.25 14.6341 3.11496 15.7059 4.47656C16.7686 5.82643 17.895 7.82858 19.3407 10.3926L19.705 11.0371C20.9038 13.1629 21.8522 14.8389 22.3475 16.1807C22.8484 17.5377 22.9667 18.7705 22.2089 19.8574C21.4734 20.9119 20.2464 21.3432 18.6991 21.5469C17.1457 21.7513 15.0527 21.75 12.3641 21.75H11.6366C8.94793 21.75 6.85411 21.7514 5.30067 21.5469C3.75346 21.3432 2.52631 20.9119 1.79091 19.8574C1.03307 18.7705 1.15229 17.5378 1.65321 16.1807C2.14853 14.8389 3.09598 13.1629 4.29481 11.0371L4.65907 10.3926C6.10492 7.8284 7.23213 5.82647 8.29481 4.47656C9.36662 3.1151 10.5018 2.25009 11.9999 2.25ZM11.9999 3.75C11.1873 3.75008 10.4382 4.17894 9.47352 5.4043C8.49958 6.64148 7.43762 8.52047 5.96571 11.1309H5.96473L5.60145 11.7754C4.3755 13.9493 3.50381 15.4991 3.06044 16.7002C2.62286 17.8857 2.68332 18.5141 3.02137 18.999C3.38194 19.5162 4.059 19.8703 5.49696 20.0596C6.92901 20.2481 8.90339 20.25 11.6366 20.25H12.3641C15.0975 20.25 17.0717 20.2481 18.5038 20.0596C19.9415 19.8703 20.6188 19.5161 20.9794 18.999C21.3173 18.5142 21.3778 17.8854 20.9403 16.7002C20.4969 15.499 19.6254 13.9486 18.3993 11.7744V11.7754L18.035 11.1309C16.5631 8.52048 15.5012 6.64148 14.5272 5.4043C13.5624 4.17865 12.8126 3.75 11.9999 3.75Z"
                  fill="#FF4D4F" />
                <path
                  d="M11.25 13V8C11.25 7.58579 11.5858 7.25 12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13Z"
                  fill="#FF4D4F" />
                <path
                  d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z"
                  fill="#FF4D4F" />
              </svg>

            </span>
            <span>
              {{ signupError }}
            </span>
          </p>

          <!-- Form -->
          <Form @submit="handleSignin" validate-on="submit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
              <!-- Name -->
              <FormField v-slot="{ value, errors, handleChange }">
                <div class="flex flex-col gap-[6px]">
                  <label class="text-sm">Name</label>
                  <IconField>
                    <InputIcon class="">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M13.6957 6.66602C13.6957 4.62497 12.041 2.97036 10 2.97036C7.95895 2.97036 6.30435 4.62497 6.30435 6.66602C6.30435 8.70705 7.95895 10.3617 10 10.3617C12.041 10.3617 13.6957 8.70705 13.6957 6.66602ZM15 6.66602C15 9.42742 12.7614 11.666 10 11.666C7.23858 11.666 5 9.42742 5 6.66602C5 3.90459 7.23858 1.66602 10 1.66602C12.7614 1.66602 15 3.90459 15 6.66602Z"
                          fill="#9E9E9E" />
                        <path
                          d="M16.0484 17.6722C16.0484 14.6265 13.3404 12.1575 10 12.1575C6.65957 12.1575 3.95161 14.6265 3.95161 17.6722C3.95161 18.0377 3.62666 18.334 3.22581 18.334C2.82495 18.334 2.5 18.0377 2.5 17.6722C2.5 13.8956 5.85787 10.834 10 10.834C14.1421 10.834 17.5 13.8956 17.5 17.6722C17.5 18.0377 17.175 18.334 16.7742 18.334C16.3733 18.334 16.0484 18.0377 16.0484 17.6722Z"
                          fill="#9E9E9E" />
                      </svg>

                    </InputIcon>
                    <InputText :model-value="value" @update:model-value="handleChange"
                      placeholder="Enter your name"
                      class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                      variant="filled" fluid />
                  </IconField>
                  <small v-if="errors?.length" class="text-red-400">
                    {{ errors[0] }}
                  </small>
                </div>
              </FormField>

              <!-- Email -->
              <FormField name="email" rules="required|email" v-slot="{ value, errors, handleChange }">
                <div class="flex flex-col gap-[6px]">
                  <label class="text-sm">Email</label>
                  <IconField>
                    <InputIcon class="">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M18.3333 6.01891L12.778 9.07794C11.7387 9.65022 10.8939 10 9.99996 10C9.10597 10 8.26119 9.65022 7.22192 9.07794L1.66663 6.01891L2.26147 5L7.81677 8.05903C8.8253 8.61435 9.43735 8.82855 9.99996 8.82855C10.5626 8.82855 11.1746 8.61435 12.1832 8.05903L17.7384 5L18.3333 6.01891Z"
                          fill="#9E9E9E" />
                        <path
                          d="M7.7365 2.52984C9.25038 2.49006 10.7495 2.49005 12.2634 2.52984C13.4661 2.56145 14.4317 2.58486 15.2036 2.72542C16.0016 2.8708 16.6503 3.15019 17.1983 3.72551C17.7439 4.29842 18.0089 4.96702 18.1453 5.78823C18.2768 6.58046 18.296 7.56654 18.3209 8.79086C18.3374 9.59853 18.3374 10.4014 18.3209 11.2091C18.296 12.4334 18.2768 13.4195 18.1453 14.2117C18.0089 15.033 17.7439 15.7015 17.1983 16.2745C16.6503 16.8498 16.0016 17.1292 15.2036 17.2746C14.4317 17.4151 13.4661 17.4385 12.2634 17.4701C10.7495 17.51 9.25038 17.51 7.7365 17.4701C6.53375 17.4385 5.56815 17.4151 4.79631 17.2746C3.99827 17.1292 3.34955 16.8498 2.80161 16.2745C2.25602 15.7015 1.99093 15.0329 1.8546 14.2117C1.72309 13.4195 1.70393 12.4334 1.67897 11.2091C1.66251 10.4014 1.66251 9.59854 1.67897 8.79086C1.70393 7.56655 1.72309 6.58045 1.8546 5.78823C1.99093 4.96703 2.256 4.29841 2.80161 3.72551C3.34955 3.15017 3.99827 2.8708 4.79631 2.72542C5.56816 2.58486 6.53375 2.56145 7.7365 2.52984ZM12.2346 3.7453C10.7401 3.70602 9.25974 3.70603 7.76527 3.7453C6.52777 3.77782 5.66294 3.80265 4.9954 3.92426C4.35401 4.04112 3.95408 4.23856 3.62522 4.58385C3.29411 4.93156 3.10813 5.34478 2.99994 5.99648C2.88698 6.67712 2.86744 7.55528 2.84173 8.8162C2.82561 9.60679 2.82561 10.3932 2.84173 11.1838C2.86743 12.4447 2.88699 13.3229 2.99994 14.0035C3.10813 14.6552 3.29412 15.0684 3.62522 15.4161C3.95407 15.7614 4.35399 15.9589 4.9954 16.0757C5.66294 16.1973 6.52777 16.2221 7.76527 16.2547H7.76602C9.26035 16.294 10.7403 16.294 12.2346 16.2547C13.4721 16.2221 14.3369 16.1973 15.0045 16.0757C15.6459 15.9589 16.0458 15.7614 16.3746 15.4161C16.7058 15.0684 16.8917 14.6552 16.9999 14.0035C17.1129 13.3229 17.1325 12.4447 17.1581 11.1838C17.1743 10.3932 17.1743 9.60676 17.1581 8.8162C17.1325 7.55528 17.1129 6.67712 16.9999 5.99648C16.8917 5.34477 16.7058 4.93156 16.3746 4.58385C16.0458 4.23855 15.6459 4.04111 15.0045 3.92426C14.3369 3.80265 13.4721 3.77783 12.2346 3.7453Z"
                          fill="#9E9E9E" />
                      </svg>
                    </InputIcon>
                    <InputText type="email" :model-value="value" @update:model-value="handleChange"
                      placeholder="Enter your email"
                      class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                      variant="filled" fluid />
                  </IconField>
                  <small v-if="errors?.length" class="text-red-400">
                    {{ errors[0] }}
                  </small>
                </div>
              </FormField>

              <!-- Password -->
              <FormField name="password" rules="required|min:6" v-slot="{ value, errors, handleChange }">
                <div class="flex flex-col gap-[6px]">
                  <label class="text-sm">Password</label>
                  <IconField>
                    <InputIcon class="">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M17.9533 9.20352C18.2066 9.55877 18.3333 9.73643 18.3333 9.99935C18.3333 10.2623 18.2066 10.4399 17.9533 10.7952C16.8149 12.3915 13.9076 15.8327 9.99996 15.8327C6.09228 15.8327 3.18504 12.3915 2.04666 10.7952C1.7933 10.4399 1.66663 10.2623 1.66663 9.99935C1.66663 9.73643 1.7933 9.55877 2.04666 9.20352C3.18504 7.60722 6.09228 4.16602 9.99996 4.16602C13.9076 4.16602 16.8149 7.60722 17.9533 9.20352Z"
                          stroke="#9E9E9E" stroke-width="1.5" />
                        <path
                          d="M12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10Z"
                          stroke="#9E9E9E" stroke-width="1.5" />
                      </svg>
                    </InputIcon>
                    <InputText type="password" :model-value="value" @update:model-value="handleChange"
                      placeholder="Enter your password"
                      class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                      fluid />
                  </IconField>
                  <small v-if="errors?.length" class="text-red-400">
                    {{ errors[0] }}
                  </small>
                </div>
              </FormField>

              <!-- Confirm Password -->
              <FormField name="confirm_password" rules="required|min:6" v-slot="{ value, errors, handleChange }">
                <div class="flex flex-col gap-[6px]">
                  <label class="text-sm">Confirm Password</label>
                  <IconField>
                    <InputIcon class="">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M17.8515 6.26812C18.0529 6.02364 18.4106 5.96655 18.6799 6.14605C18.9671 6.33752 19.0447 6.72555 18.8532 7.01275L18.3332 6.66607C18.8533 7.01276 18.8534 7.01335 18.8532 7.01356H18.8524L18.8516 7.01519C18.8509 7.01623 18.8502 7.01768 18.8492 7.01926C18.8469 7.02262 18.8433 7.02739 18.8394 7.0331C18.8317 7.04442 18.8209 7.06029 18.8069 7.0803C18.7784 7.12097 18.7369 7.17926 18.6832 7.25201C18.5758 7.39751 18.4184 7.60292 18.2144 7.84771C17.8071 8.33642 17.21 8.98779 16.4485 9.64052C14.935 10.9377 12.7111 12.2911 9.99989 12.2911C7.2887 12.2911 5.06475 10.9377 3.55133 9.64052C2.78983 8.98779 2.19264 8.33642 1.78537 7.84771C1.58138 7.60292 1.42402 7.39751 1.31662 7.25201C1.26293 7.17926 1.2214 7.12097 1.19293 7.0803C1.17893 7.06029 1.16811 7.04442 1.16037 7.0331C1.15648 7.02739 1.15288 7.02262 1.15061 7.01926C1.14954 7.01768 1.14887 7.01623 1.14817 7.01519L1.14735 7.01356H1.14654C1.1464 7.01335 1.14653 7.01276 1.66656 6.66607L1.14654 7.01275C0.95507 6.72555 1.03267 6.33752 1.31988 6.14605C1.60709 5.95458 1.99511 6.03219 2.18658 6.31939V6.31858C2.18667 6.31871 2.18691 6.31948 2.18739 6.32021C2.18839 6.32168 2.1898 6.32472 2.19228 6.32834C2.19741 6.33586 2.2062 6.348 2.2175 6.36415C2.2403 6.39671 2.27546 6.44612 2.32248 6.50982C2.41689 6.63773 2.55913 6.82309 2.74566 7.04693C3.11962 7.49568 3.66843 8.09446 4.36513 8.69162C5.76836 9.89436 7.71116 11.0411 9.99989 11.0411C12.2886 11.0411 14.2314 9.89436 15.6347 8.69162C16.3314 8.09446 16.8802 7.49568 17.2541 7.04693C17.4407 6.82309 17.5829 6.63773 17.6773 6.50982C17.7243 6.44612 17.7595 6.39671 17.7823 6.36415C17.7936 6.348 17.8024 6.33586 17.8075 6.32834C17.81 6.32472 17.8114 6.32168 17.8124 6.32021C17.8129 6.31948 17.8131 6.31871 17.8132 6.31858V6.31939L17.8515 6.26812Z"
                          fill="#9E9E9E" />
                        <path
                          d="M12.1788 10.7139C12.4747 10.5365 12.859 10.6329 13.0365 10.9288L14.2865 13.0121C14.4639 13.3081 14.3676 13.6923 14.0717 13.8699C13.7757 14.0473 13.3915 13.9509 13.2139 13.655L11.9639 11.5717C11.7865 11.2757 11.8829 10.8915 12.1788 10.7139Z"
                          fill="#9E9E9E" />
                        <path
                          d="M16.2246 8.72407C16.4686 8.48 16.8643 8.48 17.1084 8.72407L18.775 10.3907C19.0191 10.6348 19.0191 11.0305 18.775 11.2745C18.5309 11.5186 18.1353 11.5186 17.8912 11.2745L16.2246 9.60786C15.9805 9.36379 15.9805 8.96815 16.2246 8.72407Z"
                          fill="#9E9E9E" />
                        <path
                          d="M2.89123 8.72407C3.13531 8.48 3.53094 8.48 3.77502 8.72407C4.0191 8.96815 4.0191 9.36379 3.77502 9.60786L2.10835 11.2745C1.86427 11.5186 1.46864 11.5186 1.22456 11.2745C0.980484 11.0305 0.980485 10.6348 1.22456 10.3907L2.89123 8.72407Z"
                          fill="#9E9E9E" />
                        <path
                          d="M6.96393 10.9288C7.14147 10.6329 7.52572 10.5365 7.82168 10.7139C8.11759 10.8915 8.21392 11.2757 8.03652 11.5717L6.78652 13.655C6.60898 13.9509 6.22473 14.0473 5.92877 13.8699C5.63287 13.6923 5.53653 13.3081 5.71393 13.0121L6.96393 10.9288Z"
                          fill="#9E9E9E" />
                      </svg>
                    </InputIcon>
                    <InputText type="password" :model-value="value" @update:model-value="handleChange"
                      placeholder="Enter your password"
                      class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                      fluid />
                  </IconField>
                  <small v-if="errors?.length" class="text-red-400">
                    {{ errors[0] }}
                  </small>
                </div>
              </FormField>
            </div>

            <button type="submit" :disabled="loading" :class="[
              'w-full h-[46px] rounded-lg font-medium transition-colors',
              loading
                ? 'bg-[#E6E6E6] text-black cursor-not-allowed'
                : 'bg-[#C1FF00] text-black hover:brightness-95'
            ]">
              <span v-if="!loading">Sign Up</span>
              <span v-else>Sign Up...</span>
            </button>

            <!-- Divider -->
            <div class="flex items-center gap-3">
              <div class="h-px flex-1 bg-white/20"></div>
              <span class="text-xs text-white/40">or</span>
              <div class="h-px flex-1 bg-white/20"></div>
            </div>

            <!-- Google Sign Up -->
            <button type="button"
              class="flex h-[46px] items-center justify-center gap-2 rounded-md bg-white text-sm font-medium text-black">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-4 w-4" />
              Sign Up with Google
            </button>
          </Form>

          <!-- Footer -->
          <p class="text-[14px] leading-[22px] font-[400] text-center text-white">
            Already have an account?
            <span class="text-[#399CE5] cursor-pointer" @click="$emit('update:mode', 'login')">
              Login
            </span>
          </p>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>

import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useToast } from "primevue/usetoast";
import { ref } from 'vue';
import { z } from 'zod';


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

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const emit = defineEmits(["close", "update:mode", "success"]);

const showPasswordLogin = ref(false);
const showPasswordSignup = ref(false);

const loading = ref(false);
const loginError = ref('');
const signupError = ref('');

const toast = useToast();
const initialLoginValues = ref({
  email: '',
  password: ''
});

const initialSignupValues = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

// * ------- State

const userState = useState('user', () => null)

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

const resolverLogin = ref(zodResolver(
  z.object({
    email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
    password: z.string().min(3, { message: 'Minimum 3 characters.' }),
  })
));

const resolverSignup = ref(zodResolver(
  z.object({
    name: z.string().min(4, { message: 'Minimum 4 characters.' }),
    email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
    password: z.string().min(3, { message: 'Minimum 3 characters.' }),
    password_confirmation: z.string().min(3, { message: 'Minimum 3 characters.' }),
  })
));

const handleLogin = async ({ values, valid }) => {
  if (!valid) return

  loginError.value = ''
  loading.value = true

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: values,
      credentials: 'include', // Required
    })

    toast.add({ severity: 'success', summary: 'Login Success', life: 3000 });

    // Store state
    userState.value = res.user

    emit('success', res.user)
    emit('close')
  } catch (err) {
    loginError.value =
      err?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }


};

const handleLoginWithGoogle = () => {
  window.location.href = '/api/auth/google'
}

const handleSignup = async ({ values, valid }) => {
  if (!valid) return;

  signupError.value = ''
  loading.value = true

  try {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: values,
      credentials: 'include', // Required
    })

    toast.add({ severity: 'success', summary: 'Login Success', life: 3000 });

    // Store state
    userState.value = res.user

    emit('success', res.user)
    emit('close')
  } catch (err) {
    signupError.value =
      err?.data?.message || 'Sign up failed'
  } finally {
    loading.value = false
  }
};

const handleClose = () => {
  emit('close');
  loginError.value = ''
  signupError.value = ''
}

const toggleShowPasswordLogin = () => {
  showPasswordLogin.value = !showPasswordLogin.value
}

const toggleShowPasswordSignup = () => {
  showPasswordSignup.value = !showPasswordSignup.value
}

// * ------- Compute -----------------------------------------------------------------------------------------------------------------------------------------------


</script>

<template>
  <Transition name="fade">
    <div v-if="open" id="modal-auth" class="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
      <div class="relative w-[450px] bg-[#1E1E1E] flex flex-col gap-6 rounded-2xl px-6 py-8 text-white overflow-hidden">

        <div class="flex items-center justify-between">
          <UIBrandLogo width="95" height="32" />
          <button @click="handleClose">
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
            <IconExclamationError />
            <span>
              {{ loginError }}
            </span>
          </p>

          <div v-if="mode === 'login'" id="login" class="flex flex-col gap-4">
            <Form v-slot="$form" :resolver="resolverLogin" :initialValues="initialLoginValues" @submit="handleLogin"
              class="flex justify-center flex-col gap-4">
              <!-- Email -->
              <div class="flex flex-col gap-[6px]">
                <label class="text-sm">Email</label>
                <IconField>
                  <InputIcon class="">
                    <IconEmail />
                  </InputIcon>
                  <InputText name="email" type="email" placeholder="Enter your email"
                    class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                    variant="filled" fluid />
                </IconField>
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
                  $form.email.error?.message }}</Message>
              </div>
              <!-- Password -->
              <div class="flex flex-col gap-[6px]">
                <label class="text-sm">Password</label>
                <IconField>
                  <InputIcon class="cursor-pointer" @click="toggleShowPasswordLogin">
                    <IconEyeClosed v-if="showPasswordLogin" />
                    <IconEyeOpen v-else />
                  </InputIcon>
                  <InputText name="password" :type="showPasswordLogin ? 'text' : 'password'"
                    placeholder="Enter your password"
                    class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                    variant="filled" fluid />
                </IconField>
                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
                  $form.password.error?.message }}</Message>
              </div>
              <!-- Submit Button -->
              <button type="submit" severity="secondary" :disabled="loading || $form.invalid" :class="[
                'w-full h-[46px] border-none rounded-lg font-medium transition-colors',
                loading || $form.invalid
                  ? 'bg-[#E0E0E0] text-[#757575] cursor-not-allowed'
                  : 'bg-[#C1FF00] text-[#1E1E1E] hover:brightness-95'
              ]">Login</button>
              <!-- Google Login -->
              <button type="button"
                class="flex h-[46px] items-center justify-center gap-2 rounded-md bg-white text-sm font-medium text-black" @click="handleLoginWithGoogle">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-4 w-4" />
                Login with Google
              </button>
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
            <IconExclamationError />
            <span>
              {{ signupError }}
            </span>
          </p>

          <!-- Form -->
          <Form v-slot="$form" :resolver="resolverSignup" :initialValues="initialSignupValues" @submit="handleSignup"
            class="flex justify-center flex-col gap-4">
            <div class="flex flex-col gap-4">
              <!-- Name -->
              <div class="flex flex-col gap-[6px]">
                <label class="text-sm">Name</label>
                <IconField>
                  <InputIcon class="">
                    <IconUser />
                  </InputIcon>
                  <InputText name="name" type="text" placeholder="Enter your name"
                    class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                    variant="filled" fluid />
                </IconField>
                <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
                  $form.name.error?.message }}</Message>
              </div>
              <!-- Email -->
              <div class="flex flex-col gap-[6px]">
                <label class="text-sm">Email</label>
                <IconField>
                  <InputIcon class="">
                    <IconEmail />
                  </InputIcon>
                  <InputText name="email" type="email" placeholder="Enter your email"
                    class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                    variant="filled" fluid />
                </IconField>
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
                  $form.email.error?.message }}</Message>
              </div>
              <!-- Password -->
              <div class="flex flex-col gap-[6px]">
                <label class="text-sm">Password</label>
                <IconField>
                  <InputIcon class="cursor-pointer" @click="toggleShowPasswordLogin">
                    <IconEyeClosed v-if="showPasswordLogin" />
                    <IconEyeOpen v-else />
                  </InputIcon>
                  <InputText name="password" :type="showPasswordLogin ? 'text' : 'password'"
                    placeholder="Enter your password"
                    class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                    variant="filled" fluid />
                </IconField>
                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
                  $form.password.error?.message }}</Message>
              </div>
              <!-- Password Confirm -->
              <div class="flex flex-col gap-[6px]">
                <label class="text-sm">Confirm Password</label>
                <IconField>
                  <InputIcon class="cursor-pointer" @click="toggleShowPasswordLogin">
                    <IconEyeClosed v-if="showPasswordLogin" />
                    <IconEyeOpen v-else />
                  </InputIcon>
                  <InputText name="password_confirmation" :type="showPasswordLogin ? 'text' : 'password'"
                    placeholder="Enter your password"
                    class="text-[14px] leading-[22px] text-[400] px-4 py-3 rounded-[6px] text-[#1E1E1E] placeholder:text-[#9E9E9E]"
                    variant="filled" fluid />
                </IconField>
                <Message v-if="$form.password_confirmation?.invalid" severity="error" size="small" variant="simple">{{
                  $form.password_confirmation.error?.message }}</Message>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="loading || $form.invalid" :class="[
              'w-full h-[46px] rounded-lg font-medium transition-colors',
              loading || $form.invalid
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

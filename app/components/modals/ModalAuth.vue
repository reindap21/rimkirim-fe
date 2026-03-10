<script setup>
  // TODO: update jadi ts

  import { Form } from "@primevue/forms";
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import InputIcon from "primevue/inputicon";
  import { ref } from "vue";
  import { z } from "zod";

  // * ------- Defines -----------------------------------------------------------------------------------------------------------------------------------------------

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

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const showPasswordLogin = ref(false);
  const showPasswordSignUp = ref(false);

  const loginLoading = ref(false);
  const signUpLoading = ref(false);
  const errorLogin = ref("");
  const errorSignup = ref("");

  const initialLoginValues = {
    email: "",
    password: "",
  };

  const initialSignupValues = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  };

  // * ------- State

  const userState = useState("user", () => null);

  // * ------- Config -----------------------------------------------------------------------------------------------------------------------------------------------

  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  const resolverLogin = ref(
    zodResolver(
      z.object({
        email: z
          .string()
          .min(1, { message: "Email is required." })
          .email({ message: "Invalid email address." }),
        password: z.string().min(1, { message: "Password is required." }),
      }),
    ),
  );

  const resolverSignup = ref(
    zodResolver(
      z
        .object({
          name: z.string().min(4, { message: "Minimum 4 characters." }),
          email: z
            .string()
            .min(1, { message: "Email is required." })
            .email({ message: "Invalid email address." }),
          password: z.string().min(8, { message: "Minimum 8 characters." }),
          password_confirmation: z.string().min(8, { message: "Minimum 8 characters." }),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message: "Passwords do not match",
          path: ["password_confirmation"],
        }),
    ),
  );

  const handleLogin = async ({ values, valid }) => {
    if (!valid || loginLoading.value) return;

    errorLogin.value = "";
    loginLoading.value = true;

    try {
      const res = await $fetch("/api/auth/login", {
        method: "POST",
        body: values,
        credentials: "include", // Required
      });

      // Store state
      userState.value = res.user;

      emit("success", res.user);
      emit("close");
    } catch (err) {
      errorLogin.value = err?.data?.message || "Login failed";
    } finally {
      loginLoading.value = false;
    }
  };

  const handleLoginWithGoogle = () => {
    navigateTo(`${apiBaseUrl}/oauth/google`, {
      external: true,
    });
  };

  const handleSignup = async ({ values, valid }) => {
    if (!valid || signUpLoading.value) return;

    errorSignup.value = "";
    signUpLoading.value = true;

    try {
      const res = await $fetch("/api/auth/register", {
        method: "POST",
        body: values,
        credentials: "include", // Required
      });

      // Store state
      userState.value = res.user;

      emit("success", res.user);
      emit("close");
    } catch (err) {
      errorSignup.value = err?.data?.message || "Sign up failed";
    } finally {
      signUpLoading.value = false;
    }
  };

  const handleSignUpWithGoogle = () => {
    navigateTo(`${apiBaseUrl}/oauth/google`, {
      external: true,
    });
  };

  const handleClose = () => {
    emit("close");
    errorLogin.value = "";
    errorSignup.value = "";
  };

  const toggleShowPasswordLogin = () => {
    showPasswordLogin.value = !showPasswordLogin.value;
  };

  const toggleShowPasswordSignUp = () => {
    showPasswordSignUp.value = !showPasswordSignUp.value;
  };

  // * ------- Computed ----------------------------------------------------------------------------------------------------------------------------------------------
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      id="modal-auth"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/50"
    >
      <div
        class="relative w-[450px] bg-neutral-100 flex flex-col gap-6 rounded-2xl px-6 py-8 text-white overflow-hidden"
      >
        <div class="flex items-center justify-between">
          <UIBrandLogo width="95" height="32" />
          <button @click="handleClose">
            <IconClose />
          </button>
        </div>

        <!-- LOGIN -->
        <div v-if="mode === 'login'" id="login" class="flex flex-col gap-6">
          <!-- Header -->
          <div class="flex flex-col gap-1">
            <h5 class="text-[24px] leading-[130%] font-medium">Login</h5>
            <p class="text-[14px] leading-[22px] font-[400] text-white">
              Please enter your credential
            </p>
          </div>

          <p
            v-if="errorLogin"
            class="flex gap-4 px-4 py-3 text-[14px] leading-[22px] font-[400] bg-[#FFEDED] text-[#FF4D4F] rounded-[12px]"
          >
            <IconExclamationError />
            <span>
              {{ errorLogin }}
            </span>
          </p>

          <div class="flex flex-col gap-6">
            <!-- Form -->
            <Form
              v-slot="$form"
              class="flex justify-center flex-col gap-6"
              :resolver="resolverLogin"
              :initial-values="initialLoginValues"
              validate-on-blur
              @submit="handleLogin"
            >
              <!-- Forms -->
              <div class="flex flex-col gap-4">
                <!-- Email -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium">Email</label>
                  <div class="relative">
                    <InputIcon class="absolute !top-[13px] left-4 !mt-0">
                      <IconEmail />
                    </InputIcon>
                    <InputText
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      class="w-full !pl-12"
                    />
                  </div>
                  <Message
                    v-if="$form.email?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.email.error?.message }}</Message
                  >
                </div>
                <!-- Password -->
                <div class="relative flex flex-col gap-[6px]">
                  <div class="relative flex flex-col gap-[6px]">
                    <label class="font-medium">Password</label>
                    <div class="relative">
                      <InputIcon
                        class="absolute !top-[13px] left-4 !mt-0 cursor-pointer"
                        @click="toggleShowPasswordLogin"
                      >
                        <IconEyeClosed v-if="showPasswordLogin" />
                        <IconEyeOpen v-else />
                      </InputIcon>
                      <InputText
                        name="password"
                        :type="showPasswordLogin ? 'text' : 'password'"
                        placeholder="Enter your password"
                        class="w-full !pl-12"
                      />
                    </div>
                    <Message
                      v-if="$form.password?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ $form.password.error?.message }}</Message
                    >
                  </div>
                  <!-- Forgot Password -->
                  <p
                    class="text-[14px] leading-[22px] font-[400] text-right text-[#399CE5] cursor-default"
                  >
                    Forgot password?
                  </p>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex flex-col gap-4">
                <!-- Submit Button -->
                <PrimaryButton
                  type="submit"
                  :loading="loginLoading"
                  :disabled="$form.invalid && $form.touched"
                  class="w-full"
                >
                  Login
                </PrimaryButton>
                <!-- Google Login -->
                <DefaultButton
                  type="button"
                  class="w-full"
                  @click="handleLoginWithGoogle"
                  :disabled="loginLoading"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    class="h-4 w-4"
                  />
                  Login with Google
                </DefaultButton>
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
        <div v-if="mode === 'signup'" id="signup" class="flex flex-col gap-6">
          <!-- Header -->
          <div class="flex flex-col gap-1">
            <h5 class="text-[24px] leading-[130%] font-medium">Sign Up</h5>
            <p class="text-[14px] leading-[22px] font-[400] text-white">
              Please enter your credential
            </p>
          </div>

          <p
            v-if="errorSignup"
            class="flex gap-4 px-4 py-3 text-[14px] leading-[22px] font-[400] bg-[#FFEDED] text-[#FF4D4F] rounded-[12px]"
          >
            <IconExclamationError />
            <span>
              {{ errorSignup }}
            </span>
          </p>

          <div class="flex flex-col gap-6">
            <!-- Form -->
            <Form
              v-slot="$form"
              :resolver="resolverSignup"
              :initialValues="initialSignupValues"
              @submit="handleSignup"
              validateOnBlur
              class="flex justify-center flex-col gap-6"
            >
              <!-- Forms -->
              <div class="flex flex-col gap-4">
                <!-- Name -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium">Name</label>
                  <div class="relative">
                    <InputIcon class="absolute !top-[13px] left-4 !mt-0">
                      <IconUser />
                    </InputIcon>
                    <InputText
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      class="w-full !pl-12"
                    />
                  </div>
                  <Message
                    v-if="$form.name?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.name.error?.message }}</Message
                  >
                </div>
                <!-- Email -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium">Email</label>
                  <div class="relative">
                    <InputIcon class="absolute !top-[13px] left-4 !mt-0">
                      <IconEmail />
                    </InputIcon>
                    <InputText
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      class="w-full !pl-12"
                    />
                  </div>
                  <Message
                    v-if="$form.email?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.email.error?.message }}</Message
                  >
                </div>
                <!-- Password -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium">Password</label>
                  <div class="relative">
                    <InputIcon
                      class="absolute !top-[13px] left-4 !mt-0 cursor-pointer"
                      @click="toggleShowPasswordSignUp"
                    >
                      <IconEyeClosed v-if="showPasswordSignUp" />
                      <IconEyeOpen v-else />
                    </InputIcon>
                    <InputText
                      name="password"
                      :type="showPasswordSignUp ? 'text' : 'password'"
                      placeholder="Enter your password"
                      class="w-full !pl-12"
                    />
                  </div>
                  <Message
                    v-if="$form.password?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.password.error?.message }}</Message
                  >
                </div>
                <!-- Password Confirm -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium">Confirm Password</label>
                  <div class="relative">
                    <InputIcon
                      class="absolute !top-[13px] left-4 !mt-0 cursor-pointer"
                      @click="toggleShowPasswordSignUp"
                    >
                      <IconEyeClosed v-if="showPasswordSignUp" />
                      <IconEyeOpen v-else />
                    </InputIcon>
                    <InputText
                      name="password_confirmation"
                      :type="showPasswordSignUp ? 'text' : 'password'"
                      placeholder="Enter your comfirm password"
                      class="w-full !pl-12"
                    />
                  </div>
                  <Message
                    v-if="$form.password_confirmation?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.password_confirmation.error?.message }}</Message
                  >
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex flex-col gap-4">
                <!-- Submit Button -->
                <PrimaryButton
                  type="submit"
                  :loading="signUpLoading"
                  :disabled="$form.invalid && $form.touched"
                  class="w-full"
                >
                  Sign Up
                </PrimaryButton>
                <!-- Divider -->
                <!-- <div class="flex items-center gap-3">
                  <div class="h-px flex-1 bg-white/20"></div>
                  <span class="text-xs text-white/40">or</span>
                  <div class="h-px flex-1 bg-white/20"></div>
                </div> -->

                <!-- Google Sign Up -->
                <DefaultButton
                  type="button"
                  class="w-full"
                  @click="handleSignUpWithGoogle"
                  :disabled="signUpLoading"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    class="h-4 w-4"
                  />
                  Sign Up with Google
                </DefaultButton>
              </div>
            </Form>

            <!-- Footer -->
            <p class="text-[14px] leading-[22px] font-[400] text-center text-white mt-2">
              Already have an account?
              <span class="text-[#399CE5] cursor-pointer" @click="$emit('update:mode', 'login')">
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

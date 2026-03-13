<script setup lang="ts">
  import type { User } from "~/types/user";
  import type { GetSessionResponse } from "~/types/service";

  definePageMeta({
    layout: "clean",
  });

  const route = useRoute();
  const userState = useState<User | null>("user", () => null);

  onMounted(async () => {
    const query = route.query;

    if (!query.token) {
      return navigateTo("/login?error=no_token");
    }

    try {
      const token = query.token.toString();
      if (token) {
        const res = await $fetch<GetSessionResponse>("/api/auth/store", {
          method: "POST",
          body: {
            access_token: token,
          },
        });

        userState.value = res?.user;
        await navigateTo("/");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      navigateTo("/login?error=google_failed");
    }
  });
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <p>Signing you in with Google...</p>
  </div>
</template>

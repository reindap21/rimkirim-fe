<script setup lang="ts">
  import InputText from "primevue/inputtext";
  import type { Component } from "vue";
  import { onMounted, ref, computed, watch } from "vue";
  import { formatGooglePlaceToAddressGeocode } from "~/utils/address";
  import type {
    Autocomplete,
    AutocompleteOptions,
    GoogleAddressInputEmits,
    GoogleAddressInputProps,
  } from "~/types/google-maps";

  // * ------- Props --------------------------------------------------------------------------------

  const props = defineProps<GoogleAddressInputProps>();

  // * ------- Emits --------------------------------------------------------------------------------

  const emit = defineEmits<GoogleAddressInputEmits>();

  // Type for PrimeVue InputText component ref
  type InputTextComponent = Component & {
    $el: HTMLInputElement;
  };

  const inputRef = ref<InputTextComponent | null>(null);
  const autocompleteInstance = ref<Autocomplete | null>(null);

  // * ------- Country Code -------------------------------------------------------------------------

  const countryCode = computed(() => {
    if (!props.country) return undefined;
    return props.country.toUpperCase();
  });

  // * ------- Autocomplete Initialization ----------------------------------------------------------

  const initializeAutocomplete = () => {
    if (!inputRef.value?.$el) return;

    const options: AutocompleteOptions = {
      types: ["geocode"],
      ...(countryCode.value && {
        componentRestrictions: {
          country: countryCode.value,
        },
      }),
    };

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.value.$el, options);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry || !place?.address_components) return;

      try {
        // Use utility to format the place data
        const payload = formatGooglePlaceToAddressGeocode(place);

        emit("update:modelValue", payload.address);
        emit("select", payload);
      } catch (error) {
        console.error("Error formatting place data:", error);
      }
    });

    autocompleteInstance.value = autocomplete;
  };

  // * ------- Mounted ------------------------------------------------------------------------------

  onMounted(() => {
    if (process.server) return;
    if (!window?.google?.maps?.places) return;
    if (!inputRef.value?.$el) return;

    initializeAutocomplete();
  });

  // * ------- Watch Country Changes ----------------------------------------------------------------

  watch(
    () => props.country,
    () => {
      if (autocompleteInstance.value) {
        // Use setComponentRestrictions instead of recreating instance
        if (countryCode.value) {
          autocompleteInstance.value.setComponentRestrictions({
            country: countryCode.value,
          });
        } else {
          // Remove restrictions for worldwide search
          autocompleteInstance.value.setComponentRestrictions({
            country: [],
          });
        }
      }
    },
  );
</script>

<template>
  <div class="relative">
    <InputText
      :name="name"
      ref="inputRef"
      class="w-full !h-[46px] pr-12"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <InputIcon
      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
    >
      <IconPin />
    </InputIcon>
  </div>
</template>

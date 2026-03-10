<script setup lang="ts">
<<<<<<< HEAD
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
=======
import InputText from 'primevue/inputtext'
import { onMounted, ref, computed } from 'vue'

// * ------- Props --------------------------------------------------------------------------------

const props = defineProps<{
  name?: string;
  modelValue?: string
  placeholder?: string
  country?: string // ex: "japan"
}>()

// * ------- Emits --------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', place: any): void
}>()

const inputRef = ref<any>(null)

// * ------- Country Mapper -----------------------------------------------------------------------

const COUNTRY_MAP: Record<string, string> = {
  indonesia: 'ID',
  japan: 'JP',
  singapore: 'SG',
  malaysia: 'MY',
  australia: 'AU',
}

const countryCode = computed(() => {
  if (!props.country) return undefined

  console.log(props.country);

  return COUNTRY_MAP[props.country.toLowerCase()]
})

// * ------- Utils --------------------------------------------------------------------------------

const getAddressComponent = (
  components: any[],
  type: string,
  useShort = false
) => {
  const comp = components.find((c) => c.types.includes(type))
  return useShort ? comp?.short_name : comp?.long_name
}

// * ------- Mounted ------------------------------------------------------------------------------

onMounted(() => {
  if (process.server) return
  if (!window?.google?.maps?.places) return
  if (!inputRef.value?.$el) return

  const options: google.maps.places.AutocompleteOptions = {
    types: ['geocode'],
    ...(countryCode.value && {
      componentRestrictions: {
        country: countryCode.value
      }
    })
  }

  const autocomplete = new google.maps.places.Autocomplete(
    inputRef.value.$el,
    options
  )

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place?.geometry || !place?.address_components) return

    const payload = {
      address: place.formatted_address,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      postal_code: getAddressComponent(place.address_components, 'postal_code'),
      city:
        getAddressComponent(place.address_components, 'locality') ||
        getAddressComponent(place.address_components, 'postal_town') ||
        getAddressComponent(place.address_components, 'administrative_area_level_2') ||
        getAddressComponent(place.address_components, 'administrative_area_level_1'),
      province: getAddressComponent(
        place.address_components,
        'administrative_area_level_1'
      ),
      country: getAddressComponent(
        place.address_components,
        'country',
        true // ISO code
      )
    }

    emit('update:modelValue', payload.address)
    emit('select', payload)
  })
})
</script>

<template>
  <div class="relative border border-[#EDEDED] rounded-[6px]">
    <InputText
      :name="name"
      ref="inputRef"
      class="w-full pr-12"
>>>>>>> Refactor page structure; Page customer infor and item & packages
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
<<<<<<< HEAD
    <InputIcon
      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
    >
=======
    <InputIcon class="absolute top-5 right-4">
>>>>>>> Refactor page structure; Page customer infor and item & packages
      <IconPin />
    </InputIcon>
  </div>
</template>

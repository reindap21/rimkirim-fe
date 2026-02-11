<script setup lang="ts">
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
  <div class="relative">
    <InputText
      :name="name"
      ref="inputRef"
      class="w-full pr-12"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <InputIcon class="absolute top-5 right-4">
      <IconPin />
    </InputIcon>
  </div>
</template>

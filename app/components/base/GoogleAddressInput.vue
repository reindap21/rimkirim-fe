<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', place: any): void
}>()

const inputRef = ref<any>(null);

const getAddressComponent = (
  components: any[],
  type: string,
  useShort = false
) => {
  const comp = components.find((c) => c.types.includes(type))
  return useShort ? comp?.short_name : comp?.long_name
}


onMounted(() => {
  if (process.server) return

  const google = window.google
  if (!google?.maps?.places) return

  const autocomplete = new google.maps.places.Autocomplete(
    inputRef.value.$el,
    { types: ['geocode'] }
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
        getAddressComponent(place.address_components, 'administrative_area_level_2') || getAddressComponent(
          place.address_components,
          'administrative_area_level_1'
        ),
      province: getAddressComponent(
        place.address_components,
        'administrative_area_level_1'
      ),
      country: getAddressComponent(
        place.address_components,
        'country',
        true // 🇬🇧 short code
      )
    }

    emit('update:modelValue', payload.address)
    emit('select', payload)
  })
})

</script>

<template>
  <div class="relative border border-[#EDEDED] rounded-[6px]">
    <InputText ref="inputRef" class="w-full pr-12" :placeholder="placeholder" :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)" />
    <InputIcon class="absolute top-3 right-4">
      <IconPin />
    </InputIcon>
  </div>
</template>
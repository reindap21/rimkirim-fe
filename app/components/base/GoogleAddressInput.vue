<script setup>
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'

const props = defineProps({
  modelValue: String,
  placeholder: String,
})

const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref(null)

onMounted(() => {
  const autocomplete = new google.maps.places.Autocomplete(
    inputRef.value.$el,
    { types: ['geocode'] }
  )

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.formatted_address) return

    emit('update:modelValue', place.formatted_address)
    emit('select', place)
  })
})
</script>

<template>
  <InputText ref="inputRef" :value="modelValue" :placeholder="placeholder" class="w-full h-[46px]"
    @input="$emit('update:modelValue', $event.target.value)" />
</template>
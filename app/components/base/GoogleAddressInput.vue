<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: String
})

const emit = defineEmits(['update:modelValue', 'select'])

const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await customElements.whenDefined('gmp-place-autocomplete')

  const el = document.createElement('gmp-place-autocomplete')
  el.setAttribute('placeholder', props.placeholder || 'Enter address')
  el.setAttribute('types', 'geocode')

  el.addEventListener('gmp-placeselect', (event: any) => {
    const place = event.detail.place

    console.log('PLACE FROM GOOGLE:', place)

    if (!place?.formattedAddress) return

    emit('update:modelValue', place.formattedAddress)
    emit('select', place)
  })


  containerRef.value?.appendChild(el)
})
</script>

<template>
  <div ref="containerRef" class="w-full rounded-md border border-gray-300 py-2 h-[46px] flex items-center" />
</template>

<style>
gmp-place-autocomplete {
  background-color: transparent;
  width: 100%;
  max-width: 100%;
}

gmp-place-autocomplete input {
  all: unset;
  width: 100%;
  font-size: 14px;
  font-family: inherit;
}

gmp-place-autocomplete input::placeholder {
  font-size: 14px;
  line-height: 22px;
}
</style>
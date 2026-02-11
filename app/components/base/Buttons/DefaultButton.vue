<script setup lang="ts">
  interface Props {
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    rounded?: string // rounded-[8px] 
    fontWeight?: string  // font-medium
  }
  
  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
    type: 'button',
    rounded: 'rounded-lg', // lg -> 8px
    fontWeight: 'font-[400]'
  })
  </script>
  
  <template>
    <button 
      :type="type" 
      :disabled="disabled" 
      :class="[
        'h-[46px] text-[14px] leading-[22px] text-neutral-100 transition',
        'flex items-center justify-center gap-2',
        'hover:bg-gray-300',
        'disabled:bg-neutral-40 disabled:text-neutral-70 disabled:cursor-not-allowed',
        rounded,
        loading ? 'bg-gray-300' : 'bg-white',
        fontWeight
      ]"
      >
      <slot v-if="!loading" />
      <IconSpinner v-else />
    </button>
  </template>
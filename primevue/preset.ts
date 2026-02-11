import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

const RimkirimPreset = definePreset(Aura, {
  semantic: {
    focusRing: {
      color: '#00FF00'
    },
    formField: {
      focusBorderColor: '#00FF00'
    }
  }
})

export default RimkirimPreset

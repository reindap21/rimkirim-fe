<script setup lang="ts">

import { ref } from 'vue'

const router = useRouter();

const eligibleStep = ref('question'); // question | selection
const isSKPAvailable = ref(false);

const handleOnContinue = (payload: any) => {
  console.log(payload)
  isSKPAvailable.value = payload?.canApplySKP;
  eligibleStep.value = 'selection';
}

const handleOnSelect = (selection: string) => {
  console.log(selection);

  // If success
  router.push({
    path: '/booking',
    // query: {
    //   rateId: rate.id
    // }
  })

}

</script>

<template>
  <EligibleQuestionSection @continue="handleOnContinue" v-if="eligibleStep === 'question'" />
  <EligibleSelectionSection @select="handleOnSelect" :isSKPAvailable="isSKPAvailable" v-else />
</template>
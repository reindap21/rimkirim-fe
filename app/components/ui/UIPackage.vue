<script setup lang="ts">
  import { usePrimeVue } from "primevue/config";
  import { computed, ref } from "vue";
  import type { Package, PackageItem } from "~/types/order-hub";
  import type { FileUploadSelectEvent } from "primevue/fileupload";

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  type UIPackageProps = {
    currency?: string;
    modelValue: Package;
    index: number;
    totalPackages: number;
    bookingCode: string;
    hasError?: boolean;
  };

  // * ------- Defines -----------------------------------------------------------------------------------------------------------------------------------------------

  const props = withDefaults(defineProps<UIPackageProps>(), {
    currency: "",
  });

  const emit = defineEmits<{
    (e: "update:modelValue", value: Package): void;
    (e: "remove"): void;
  }>();

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const packagingType = ref<{ code: string; name: string }>();
  const weightInKgs = ref<number | null>(null);
  const dimensionInCcLength = ref<number | null>(null);
  const dimensionInCcWidth = ref<number | null>(null);
  const dimensionInCcHeight = ref<number | null>(null);
  const uploadedFiles = ref<any>([]);

  const showDetails = ref(true);

  const packagingTypeOptions = ref([{ code: "box", name: "Box" }]);

  const volumetricFactor = 5000; // cm³ / kg

  const items = ref<PackageItem[]>([
    {
      description: "",
      quantity: 1,
      valuePerItem: 0,
    },
  ]);

  // * ------- Computed ----------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Actual weightInKgs (1 item)
   */
  const totalActualWeight = computed(() => {
    return Number(weightInKgs.value) || 0;
  });

  /**
   * Volumetric weightInKgs (L × W × H / factor)
   */
  const totalVolumetricWeight = computed(() => {
    const l = Number(dimensionInCcLength.value) || 0;
    const w = Number(dimensionInCcWidth.value) || 0;
    const h = Number(dimensionInCcHeight.value) || 0;

    if (!l || !w || !h) return 0;

    return (l * w * h) / volumetricFactor;
  });

  /**
   * Chargeable Weight = max(actual, volumetric)
   */
  const chargeableWeight = computed(() => {
    return Math.max(totalActualWeight.value, totalVolumetricWeight.value);
  });

  // const packagePayload = computed<Package>(() => ({
  //   id: props.modelValue.id,
  //   packagingType: packagingType.value?.code,
  //   weightInKgs: weightInKgs.value ?? 0,
  //   dimensionInCcLength: dimensionInCcLength.value ?? 0,
  //   dimensionInCcWidth: dimensionInCcWidth.value ?? 0,
  //   dimensionInCcHeight: dimensionInCcHeight.value ?? 0,
  //   items: [...items.value],
  //   uploadedFiles: [...uploadedFiles.value],
  //   chargeableWeight: chargeableWeight.value,
  //   totalValue: totalValue.value,
  //   totalItem: items.value.length,
  // }));

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  const toggleShowDetail = () => {
    showDetails.value = !showDetails.value;
  };

  /**
   * Add new row
   */
  const addItem = () => {
    items.value.push({
      description: "",
      quantity: 1,
      valuePerItem: 0,
    });
    emitUpdate();
  };

  /**
   * Remove row
   */
  const removeItem = (index: number) => {
    if (items.value.length === 1) return;
    items.value.splice(index, 1);
    emitUpdate();
  };

  /**
   * Total per row
   */
  const rowTotal = (item: PackageItem) => {
    return (Number(item.quantity) || 0) * (Number(item.valuePerItem) || 0);
  };

  /**
   * Total quantity (items count)
   */
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0);
    }, 0);
  });

  /**
   * Total value
   */
  const totalValue = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + rowTotal(item);
    }, 0);
  });

  /**
   * Optional helper
   */
  const formatNumber = (val: number) => {
    return !val ? val : Math.ceil(val);
  };

  // * ------- Upload

  const primevue = usePrimeVue();

  const totalSize = ref(0);
  const totalSizePercent = ref(0);
  const files = computed(() => uploadedFiles.value);

  const fileUploadRef = ref<any>(null);

  /**
   * Open native file picker
   */
  const openFilePicker = () => {
    if (!fileUploadRef.value) return;

    // PrimeVue FileUpload public API
    fileUploadRef.value.choose();
  };

  const onSelectedFiles = async (event: FileUploadSelectEvent) => {
    const formData = new FormData();

    formData.append("booking_code", props.bookingCode);

    event.files.forEach((file: File) => {
      formData.append("files", file);
    });

    const res = await $fetch("/api/upload/package-photo", {
      method: "POST",
      body: formData,
    });

    uploadedFiles.value.push(...(res as any).files);
    emitUpdate();
  };

  const formatSize = (bytes: number): string => {
    const k = 1024;
    const dm = 3;

    const sizes = primevue.config?.locale?.fileSizeTypes ?? ["Bytes", "KB", "MB", "GB", "TB"];

    if (bytes === 0) return `0 ${sizes[0]}`;

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const removeFile = (index: number | string) => {
    files.value.splice(Number(index), 1);
  };

  const emitUpdate = () => {
    emit("update:modelValue", {
      id: props.modelValue.id,
      packagingType: packagingType.value?.code,
      weightInKgs: weightInKgs.value ?? 0,
      dimensionInCcLength: dimensionInCcLength.value ?? 0,
      dimensionInCcWidth: dimensionInCcWidth.value ?? 0,
      dimensionInCcHeight: dimensionInCcHeight.value ?? 0,
      items: [...items.value],
      uploadedFiles: [...uploadedFiles.value],
      chargeableWeight: chargeableWeight.value,
      totalValue: totalValue.value,
      totalItem: totalItems.value,
      // totalItem: items.value.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
    });
  };

  // * ------- watch

  watch(
    () => props.hasError,
    (val) => {
      if (val) {
        showDetails.value = true;
      }
    },
  );

  // * ------- mounted

  onMounted(() => {
    const p = props.modelValue;

    packagingType.value = packagingTypeOptions.value.find((o) => o.code === p.packagingType);

    weightInKgs.value = p.weightInKgs;
    dimensionInCcLength.value = p.dimensionInCcLength;
    dimensionInCcWidth.value = p.dimensionInCcWidth;
    dimensionInCcHeight.value = p.dimensionInCcHeight;

    items.value = p.items?.length
      ? JSON.parse(JSON.stringify(p.items))
      : [
          {
            description: "",
            quantity: 1,
            valuePerItem: 0,
          },
        ];

    uploadedFiles.value = p.uploadedFiles ?? [];
  });
</script>

<template>
  <div
    :id="`package-${index}`"
    :class="[
      'flex flex-col gap-6 bg-neutral-10 border rounded-[12px]',
      hasError ? 'border-red-500 ring-1 ring-red-300' : 'border-neutral-40',
    ]"
  >
    <div
      class="flex items-center justify-between gap-6 bg-neutral-20 p-6 h-[92px]"
      :class="!showDetails ? 'rounded-[11px]' : 'rounded-tl-[11px] rounded-tr-[11px]'"
    >
      <div class="flex items-center gap-3">
        <IconPackage :size="42" />
        <div class="flex flex-col">
          <div class="text-neutral-100">Package {{ index + 1 }}</div>
          <div class="text-neutral-60">Rename Your Package Here...</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="emit('remove')" v-if="totalPackages > 1">
          <IconTrash />
        </button>
        <button @click="toggleShowDetail">
          <IconChevronDown height="24" width="24" v-if="showDetails" />
          <IconChevronUp height="24" width="24" v-else />
        </button>
      </div>
    </div>

    <!-- Detail of Package -->
    <div class="flex flex-col gap-6 pb-6" v-if="showDetails">
      <!-- Dimension -->
      <div class="px-6">
        <div class="relative flex items-start gap-6">
          <!-- Packaging Type -->
          <div class="flex-[1] relative">
            <div class="flex flex-col gap-[6px]">
              <label class="text-[14px] font-medium text-neutral-90">Packaging Type</label>
              <div class="relative h-[46px]">
                <!-- <InputNumber v-model="quantity" placeholder="1" class="w-full h-full"
                  inputClass="w-full h-full pr-[49px]" /> -->
                <Select
                  class="align-center h-full"
                  name="packagingType"
                  v-model="packagingType"
                  :options="packagingTypeOptions"
                  optionLabel="name"
                  placeholder="Select packaging type"
                  @update:modelValue="emitUpdate"
                  fluid
                />
              </div>
            </div>
          </div>

          <!-- Weight -->
          <div class="flex-[1]">
            <div class="flex flex-col gap-[6px]">
              <label class="text-[14px] font-medium text-neutral-90">Weight (KG)</label>

              <div class="relative h-[46px]">
                <InputNumber
                  v-model="weightInKgs"
                  placeholder="Weight"
                  class="w-full h-full"
                  inputClass="w-full h-full pr-[56px]"
                  @update:modelValue="emitUpdate"
                />

                <InputIcon
                  class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]"
                >
                  KG
                </InputIcon>
              </div>
            </div>
          </div>

          <!-- Dimension -->
          <div class="flex-[3]">
            <div class="flex flex-col gap-[6px]">
              <label class="text-[14px] font-medium text-neutral-90"> Dimension (L × W × H) </label>

              <div class="flex items-center gap-2">
                <!-- L -->
                <div class="relative h-[46px] w-full">
                  <InputNumber
                    v-model="dimensionInCcLength"
                    placeholder="L"
                    class="w-full h-full"
                    inputClass="w-full h-full pr-[49px]"
                    @update:modelValue="emitUpdate"
                  />
                  <InputIcon
                    class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]"
                  >
                    cm
                  </InputIcon>
                </div>

                <span class="text-neutral-60 text-sm">×</span>

                <!-- W -->
                <div class="relative h-[46px] w-full">
                  <InputNumber
                    v-model="dimensionInCcWidth"
                    placeholder="W"
                    class="w-full h-full"
                    inputClass="w-full h-full pr-[49px]"
                    @update:modelValue="emitUpdate"
                  />
                  <InputIcon
                    class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]"
                  >
                    cm
                  </InputIcon>
                </div>

                <span class="text-neutral-60 text-sm">×</span>

                <!-- H -->
                <div class="relative h-[46px] w-full">
                  <InputNumber
                    v-model="dimensionInCcHeight"
                    placeholder="H"
                    class="w-full h-full"
                    inputClass="w-full h-full pr-[49px]"
                    @update:modelValue="emitUpdate"
                  />
                  <InputIcon
                    class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]"
                  >
                    cm
                  </InputIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chargeable Weight -->
      <div class="px-6">
        <div class="flex items-center justify-between bg-neutral-20 p-4 border-b border-[#F6F6FA]">
          <div class="flex gap-3">
            <div class="flex justify-center items-center w-[44px] h-[44px] bg-white rounded-[8px]">
              <IconChargeableWeight />
            </div>

            <div class="flex flex-col gap-1">
              <p
                class="flex items-center gap-1 text-[14px] leading-[22px] font-medium text-neutral-100"
              >
                Chargeable Weight for this Package
                <PopoverChargeableWeightPackage
                  :dimension="{
                    dimensionInCcLength: dimensionInCcLength ?? 0,
                    dimensionInCcWidth: dimensionInCcWidth ?? 0,
                    dimensionInCcHeight: dimensionInCcHeight ?? 0,
                  }"
                />
              </p>
              <p class="text-[14px] leading-[22px] text-neutral-60">
                Calculated as the greater of Actual Weight
                <span class="text-neutral-100"
                  >({{ formatNumber(Number(totalActualWeight)) }} Kg)</span
                >
                or Volumetric Weight
                <span class="text-neutral-100"
                  >({{ formatNumber(Number(totalVolumetricWeight)) }} Kg)</span
                >
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-1 text-lg font-semibold text-neutral-100 bg-white min-w-[100px] p-4 rounded-xl"
          >
            <div class="text-[18px] leading-[26px] font-bold w-full text-center">
              {{ formatNumber(Number(chargeableWeight)) }}
            </div>
            <div class="text-sm font-normal w-fit">Kg</div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-[1px] mx-6 border-y border-[#EDEDED]" />

      <!-- Item Details -->
      <div class="px-6 flex flex-col gap-4">
        <div class="text-[14px] font-medium text-neutral-90">Item Details</div>
        <div class="flex flex-col gap-3">
          <table class="w-full">
            <thead>
              <tr>
                <th
                  class="text-[12px] leading-[20px] font-[400] text-neutral-80 text-left px-4 h-[28px]"
                >
                  DESCRIPTION
                </th>
                <th
                  class="text-[12px] leading-[20px] font-[400] text-neutral-80 text-left px-4 h-[28px]"
                >
                  QTY
                </th>
                <th
                  class="text-[12px] leading-[20px] font-[400] text-neutral-80 text-left px-4 h-[28px]"
                >
                  VALUE / ITEM
                </th>
                <th
                  class="text-[12px] leading-[20px] font-[400] text-neutral-80 text-left px-4 h-[28px]"
                >
                  TOTAL
                </th>
                <th
                  class="text-[12px] leading-[20px] font-[400] text-neutral-80 text-center px-4 h-[28px]"
                >
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index" class="bg-neutral-20">
                <!-- Description -->
                <td class="p-2">
                  <InputText
                    v-model="item.description"
                    placeholder="Item description"
                    class="w-full"
                  />
                  <!-- @update:modelValue="emitUpdate" -->
                </td>

                <!-- Qty -->
                <td class="p-2">
                  <InputNumber v-model="item.quantity" :min="1" class="w-full" />
                  <!-- @update:modelValue="emitUpdate" -->
                </td>

                <!-- Value -->
                <td class="p-2">
                  <div class="relative h-[46px] w-full">
                    <InputIcon
                      class="absolute !top-[9px] h-[46px] px-4 bg-transparent !text-neutral-70 flex items-center justify-center"
                    >
                      {{ currency }}
                    </InputIcon>
                    <InputNumber
                      v-model="item.valuePerItem"
                      placeholder="0"
                      class="w-full h-full"
                      inputClass="w-full h-full !pl-[56px]"
                    />
                    <!-- @update:modelValue="emitUpdate" -->
                  </div>
                </td>

                <!-- Total -->
                <td class="p-2 text-neutral-100 font-medium">
                  <!-- {{ formatCurrency(rowTotal(item)) }} -->
                  <div class="relative h-[46px] w-full">
                    <InputIcon
                      class="absolute !top-[9px] h-[46px] px-4 bg-transparent !text-neutral-70 flex items-center justify-center"
                    >
                      {{ currency }}
                    </InputIcon>
                    <div
                      class="w-full h-full flex items-center border border-neutral-200 rounded-[8px] !pl-[56px] min-w-[120px]"
                    >
                      {{ rowTotal(item) }}
                    </div>
                    <!-- <InputNumber :value="rowTotal(item)" placeholder="0" class="w-full h-full" disabled
                      inputClass="w-full h-full !pl-[56px] disabled:bg-neutral-20" /> -->
                  </div>
                </td>

                <!-- Action -->
                <td class="p-2 text-center">
                  <button
                    @click="removeItem(index)"
                    :disabled="items.length === 1"
                    class="disabled:opacity-40"
                  >
                    <IconRemoveItemDetail />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Action add Item -->
          <div class="w-fit">
            <button @click="addItem">
              <ButtonTextAddItem />
            </button>
          </div>
        </div>
      </div>

      <!-- Total items for this package -->
      <!-- Total items for this package -->
      <div class="p-6 flex items-center justify-between gap-2 bg-neutral-20">
        <div class="text-neutral-80">
          Total items for this package:
          <b class="text-neutral-100">{{ totalItems }}</b>
        </div>

        <div class="text-neutral-80">
          Total value for this package:
          <b class="text-neutral-100"> {{ currency }} {{ totalValue }} </b>
        </div>
      </div>

      <!-- Package Photos -->
      <div class="px-6 flex flex-col gap-2">
        <div class="flex items-center gap-1 text-[14px] font-medium text-neutral-90">
          Package Photos
          <PopoverPackagePhotos />
        </div>

        <!-- List Uploaded Files Here -->
        <div
          v-for="(file, index) in files"
          :key="file.name + index"
          class="flex items-center justify-between bg-white border border-neutral-30 p-4 rounded-[6px]"
        >
          <div class="flex items-start gap-3">
            <div>
              <IconDocImg />
            </div>

            <div class="flex flex-col gap-1">
              <div class="text-neutral-100">
                {{ file?.name }}
              </div>

              <div class="text-neutral-60 flex items-center gap-1 text-sm">
                <span>{{ formatSize(file?.size) }}</span>
                <span>•</span>
                <span>Uploaded just now</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- <button type="button">
              <IconEdit />
            </button> -->
            <button type="button" @click="removeFile(index)">
              <IconTrash />
            </button>
          </div>
        </div>

        <!-- <UIUploadedItem
          v-for="(file, i) in pkg.uploadedFiles"
          :key="i"
          :name="file.name"
          :size="file.size"
          :uploadedAt="file.uploadedAt"
          @remove="removeUploadedFile(i)"
        /> -->

        <!-- Upload Area Only -->
        <FileUpload
          ref="fileUploadRef"
          mode="advanced"
          name="packagePhotos[]"
          url="/api/upload"
          accept="image/*"
          :multiple="true"
          :maxFileSize="1000000"
          :showUploadButton="false"
          :showCancelButton="false"
          :showChooseButton="false"
          @select="onSelectedFiles"
          :customUpload="true"
          class="border border-dashed border-neutral-40 rounded-[8px]"
        >
          <template #header></template>
          <template #content>
            <div
              class="flex flex-col items-center justify-center py-10 gap-3 cursor-pointer hover:bg-neutral-10 transition"
              tabindex="0"
              role="button"
              @click="openFilePicker"
              @keydown.enter="openFilePicker"
              @keydown.space.prevent="openFilePicker"
            >
              <UITextUpload />
            </div>
          </template>
          <!-- Upload Area -->
          <template #empty></template>
        </FileUpload>
      </div>
    </div>
  </div>
</template>

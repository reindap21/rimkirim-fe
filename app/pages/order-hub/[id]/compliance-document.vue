<script setup lang="ts">
<<<<<<< HEAD
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { ref, computed, onMounted } from "vue";
  import { z } from "zod";
  import type {
    ComplianceDocument,
    OrderHubProgress,
    OrderHubStep,
    PurposeOfShipment,
    UploadDocumentResponse,
  } from "~/types/order-hub";
  import { camelToTitleCase, toCamelCase } from "~/utils/string";
  import { useOrderHub } from "~/composables/useOrderHub";
  import type { FormInstance } from "@primevue/forms";
  import IconSaveProgress from "~/components/icons/IconSaveProgress.vue";

  const formRef = ref<FormInstance | null>(null);

  type ComplianceDocumentType =
    | "ktpDocument"
    | "npwpDocument"
    | "passportDocument"
    | "skpKbriDocument"
    | "otherDocument";

  const REQUIRED_DOCUMENT_TYPES: ComplianceDocumentType[] = [
    "ktpDocument",
    "npwpDocument",
    "passportDocument",
    "skpKbriDocument",
  ];

  type FileObjType = Omit<ComplianceDocument, "uploadedAt"> & {
    upload?: boolean;
    uploadedAt?: Date;
  };

  type AdditionalDocument = {
    id: string;
    name: string;
    file?: FileObjType;
  };

  type FileUploadSelectEvent = {
    files: File[];
  };

  type UploadApiData = UploadDocumentResponse["data"];

  type DocumentPayload = {
    path: string;
    mimeType?: string;
    uploadedAt?: string;
  };

  definePageMeta({ layout: "order-hub" });

  const {
    loading: bookingProgressLoading,
    bookingCode,
    navigateToOrderHub: handleBack,
    navigateToOrderHub,
    fetchProgress,
  } = useOrderHub();

  const purposeOfShipment = ref<"" | PurposeOfShipment>("");
  const isPassengerGoods = purposeOfShipment.value === "passenger_goods";
  const viewMode = ref<"form" | "success">("form");
  const currentStep: OrderHubStep = "compliance_document";
  const submittedResponse = ref<any>();

  const submitLoading = ref(false);
  const finishLaterLoading = ref(false);
  const errorSubmit = ref("");

  const visibleConfirmSaveLater = ref(false);

  const documents = ref<Record<string, FileObjType | null>>({
    ktpDocument: null,
    npwpDocument: null,
    passportDocument: null,
    skpKbriDocument: null,
  });

  const ktpDocument = computed(() => documents.value.ktpDocument);
  const npwpDocument = computed(() => documents.value.npwpDocument);
  const passportDocument = computed(() => documents.value.passportDocument);
  const skpKbriDocument = computed(() => documents.value.skpKbriDocument);

  const additionalDocumentName = ref("");
  const additionalDocuments = ref<AdditionalDocument[]>([]);

  const initialValues = {
    ktpDocument: "",
    npwpDocument: "",
    passportDocument: "",
    skpKbriDocument: "",
  };

  const resolver = zodResolver(
    z.object({
      ktpDocument: z.string().min(1, "KTP is required"),
      npwpDocument: z.string().optional().nullable(),
      passportDocument: z.string().optional().nullable(),
      skpKbriDocument: z.string().min(1, "Surat Keterangan Pindah is required"),
    }),
  );

  const buildPayload = () => {
    const payload: Record<string, DocumentPayload | string> = {
      bookingCode: bookingCode.value,
    };

    Object.entries(documents.value).forEach(([key, doc]) => {
      if (!doc?.localPath) return;

      payload[key] = {
        path: doc.localPath,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt?.toISOString(),
      };
    });

    additionalDocuments.value.forEach((d) => {
      if (!d.file?.localPath) return;
      payload[toCamelCase(d.name)] = {
        path: d.file.localPath,
        mimeType: d.file.mimeType,
        uploadedAt: d.file.uploadedAt?.toISOString(),
      };
    });

    return payload;
  };

  /**
   * Popup FinishLater : Show popup
   */
  const showPopupFinishLater = () => {
    visibleConfirmSaveLater.value = true;
  };

  /**
   * Popup FinishLater : Close popup
   */
  const closePopupFinishLater = () => {
    visibleConfirmSaveLater.value = false;
  };

  /**
   * Finish Later
   * @param $form
   */
  const handleFinishLater = async ($form: any) => {
    if (finishLaterLoading.value) return;

    finishLaterLoading.value = true;

    try {
      const res = await $fetch<OrderHubProgress>("/api/order-hub/compliance-document", {
        method: "PUT",
        body: buildPayload(),
        credentials: "include",
      });

      if (res) {
        navigateToOrderHub();
      }
    } finally {
      finishLaterLoading.value = false;
    }
  };

  /**
   * Submit
   * @param param0
   */
  const handleSubmit = async ({ values, valid }: { values: any; valid: boolean }) => {
    if (!valid || submitLoading.value) return;

    submitLoading.value = true;

    try {
      const payload: Record<string, DocumentPayload | string> = {
        ...values,
        ...buildPayload(),
      };

      const res = await $fetch<OrderHubProgress>("/api/order-hub/compliance-document", {
        method: "PUT",
        body: payload,
        credentials: "include",
      });

      if (res) {
        submittedResponse.value = res;
        viewMode.value = "success";
      }
    } finally {
      submitLoading.value = false;
    }
  };

  const uploadDocument = async (
    files: File[],
    documentType: ComplianceDocumentType,
    target?: AdditionalDocument,
  ) => {
    const formData = new FormData();
    formData.append("booking_code", bookingCode.value);
    formData.append("document_type", documentType);
    files.forEach((f) => formData.append("files", f));

    const res = await $fetch<UploadApiData>("/api/upload/compliance-document", {
      method: "POST",
      body: formData,
    });

    const uploaded: FileObjType = {
      localPath: res.local_path,
      documentType: res.document_type,
      name: res.name,
      size: res.size,
      mimeType: res.mime_type,
      upload: true,
      uploadedAt: new Date(),
    };

    if (target)
      target.file = uploaded; // For Additional File
    else documents.value[documentType] = uploaded;

    return uploaded;
  };

  const onSelectedFiles = (e: FileUploadSelectEvent, type: ComplianceDocumentType) =>
    uploadDocument(e.files, type);

  const onFileSelect = async (
    e: FileUploadSelectEvent,
    documentType: ComplianceDocumentType,
    props: any,
    target?: AdditionalDocument,
  ) => {
    const uploaded = await uploadDocument(e.files, documentType, target);

    // ⬅️ INI WAJIB
    props.onInput({
      target: {
        value: uploaded.localPath,
      },
    });
  };

  const onFileRemove = (documentType: string, props: any, target?: AdditionalDocument) => {
    if (target) target.file = undefined;
    else documents.value[documentType] = null;

    props.onInput({
      target: {
        value: "",
      },
    });
  };

  const addAdditionalDocument = () => {
    if (!additionalDocumentName.value.trim()) return;

    additionalDocuments.value.push({
      id: crypto.randomUUID(),
      name: additionalDocumentName.value.trim(),
      file: undefined,
    });

    additionalDocumentName.value = "";
  };

  const onUploadAdditionalFile = async (e: FileUploadSelectEvent, doc: AdditionalDocument) => {
    await uploadDocument(e.files, toCamelCase(doc.name) as ComplianceDocumentType, doc);
  };

  const removeAdditionalDocument = (id: string) => {
    additionalDocuments.value = additionalDocuments.value.filter((d) => d.id !== id);
  };

  const hydrateFromApi = (
    compliance: {
      data?: ComplianceDocument[];
    },
    form: FormInstance,
  ) => {
    if (!compliance?.data?.length) return;

    compliance.data.forEach((doc) => {
      const uploadedFile: FileObjType = {
        localPath: doc.localPath,
        documentType: doc.documentType,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        uploadedAt: new Date(doc.uploadedAt as ComplianceDocumentType),
        upload: true,
      };

      // 1️⃣ REQUIRED DOCUMENT
      if (REQUIRED_DOCUMENT_TYPES.includes(doc.documentType as any)) {
        const type = doc.documentType as ComplianceDocumentType;

        documents.value[type] = uploadedFile;

        // sync ke form (biar validasi hilang)
        form.setFieldValue(type, doc.localPath);
        return;
      }

      // 2️⃣ ADDITIONAL DOCUMENT
      additionalDocuments.value.push({
        id: crypto.randomUUID(),
        name: camelToTitleCase(doc.documentType), // insurance → Insurance
        file: uploadedFile,
      });
    });
  };

  // * ------- mounted ---------------------------------------------------------------------------------------------------------------------------------------------

  onMounted(async () => {
    const progress = await fetchProgress();
    // pastikan data ada
    if (progress?.compliance_document && formRef.value) {
      hydrateFromApi(progress.compliance_document as any, formRef.value); // type: any -> OrderHubProgress['compliance_document']
    }
  });
</script>

=======

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { z } from 'zod';
import { MENU } from '~/config';

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------


// * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

definePageMeta({
  layout: 'order-hub',
  // middleware: 'auth'
})

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const route = useRoute();
const router = useRouter();
const { user, loading } = useAuth()

const bookingCode = route.params.id as string;

const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");
const packingListCode = ref("-");

const viewMode = ref<'form' | 'success'>("form")

// * ------- Form Handling

const formRef = ref<any>(null)
const submitLoading = ref(false);
const errorSubmit = ref("");

const initialValues = {

}

const resolver = ref(zodResolver(
  z.object({
    // Sender
    // senderContactName: z.string().min(1, { message: 'Full name is required.' }),
  })
));

// const actionFormContent = {
//   customer_information: {
//     title: "CUSTOMER INFORMATION",
//     description: "Please provide customer information details. This information will be used for shipping updates and verification purposes."
//   },
//   item_and_package: {
//     title: "ITEM & PACKAGES",
//     description: "Add details of your packages, including dimensions, weight, contents and value.",
//   },
//   compliance_document: {
//     title: "COMPLIANCE DOCUMENT",
//     description: "Please Upload the necessary document to proceed. Accepted formats: PDF, JPG, PNG (Max 5MB).",
//   },
//   pickup_detail_schedule: {
//     title: "PICKUP DETAILS & SCHEDULE",
//     description: "Please provide the exact location where courier should collect your items. Accurate details help ensure a smooth pickup process.",
//   }
// }

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

const handleSubmit = async ({ values, valid }: { values: any, valid: boolean }) => {

  if (!valid || submitLoading.value) return;

  viewMode.value = 'success';

  errorSubmit.value = ''
  submitLoading.value = true

  const payload = {
    ...values,
    bookingCode: bookingCode,
  }

  try {
    const res = await $fetch('/order-hub/item-and-package', {
      method: 'POST',
      body: payload,
      credentials: 'include', // Required
    })

    // Store state
    // userState.value = res.user

    viewMode.value = 'success';

  } catch (err: any) {
    errorSubmit.value =
      err?.data?.message || 'Error submit item and packages'
  } finally {
    submitLoading.value = false
  }
};

const handleFinishLater = () => {
  // actionForm.value = ""
}

const handleBack = () => {
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  })
}

const handleGoToOrderHubPage = () => {
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  })
}

// * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

onMounted(() => {

})


</script>


>>>>>>> Refactor page structure; Page customer infor and item & packages
<template>
  <section class="flex flex-col relative gap-6 max-w-7xl mx-auto px-6 pt-28 pb-24">
    <!-- <div
      class="fixed top-[14px] left-1/2  transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full w-fit z-[100]">
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium cursor-pointer rounded-full"
<<<<<<< HEAD
        :class="purposeOfShipment === 'moving_goods' ? 'bg-[#0093FF] text-white' : 'text-neutral-60'">
        Personal Belongings
      </div>
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium  cursor-pointer rounded-full"
        :class="purposeOfShipment === 'passenger_goods' ? 'bg-[#FF7C00] text-white' : 'text-neutral-60'">
=======
        :class="purposeOfShipment === 'moving_goods' ? 'bg-[#0093FF] text-white' : 'text-[#9E9E9E]'">
        Personal Belongings
      </div>
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium  cursor-pointer rounded-full"
        :class="purposeOfShipment === 'passenger_goods' ? 'bg-[#FF7C00] text-white' : 'text-[#9E9E9E]'">
>>>>>>> Refactor page structure; Page customer infor and item & packages
        Passenger Goods
      </div>
    </div> -->

    <template v-if="viewMode === 'form'">
      <!-- Section Form -->
      <section class="w-[1024px] mx-auto flex flex-col gap-6 mt-4">
<<<<<<< HEAD
        <FormHeader
          title="COMPLIANCE DOCUMENT"
          description="Please Upload the necessary document to proceed. Accepted formats: PDF, JPG, PNG (Max 5MB)."
        />

        <Form
          ref="formRef"
          v-slot="$form"
          class="flex flex-col gap-6"
          :resolver="resolver"
          :initial-values="initialValues"
          validate-on-blur
          @submit="handleSubmit"
        >
          <div
            class="flex flex-col gap-6 pb-6 bg-neutral-10 rounded-[12px] border border-[#EDEDED]"
          >
            <!-- Required Documents -->
            <div
              class="flex items-center p-6 gap-6 bg-neutral-20 rounded-tl-[12px] rounded-tr-[12px]"
            >
              <div class="flex-1 flex items-center gap-2">
                <div
                  class="h-[42px] w-[42px] bg-white rounded-full flex items-center justify-center"
                >
                  <IconRequiredDocument />
                </div>
                <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
                  Required Documents
                </div>
              </div>
            </div>

            <!-- KTP -->
            <div class="px-6">
              <div class="flex flex-col gap-[6px]">
                <div class="flex flex-wrap gap-6 items-center justify-between">
                  <div class="flex items-center gap-1 font-medium text-neutral-90">
                    <label>
                      KTP (Identity Card)
                      <span class="text-red-500">*</span>
                    </label>
                  </div>
                  <PillSuccessUpload v-if="ktpDocument" />
                </div>
                <FormField class="relative" name="ktpDocument" v-slot="{ props, invalid, error }">
                  <div class="card" :class="invalid ? 'border border-red-600 rounded-[8px]' : ''">
                    <FileUpload
                      v-if="!ktpDocument"
                      ref="fileUploadRef"
                      class="rimkirim-basic-upload h-full"
                      mode="basic"
                      name="npwp"
                      url="/api/upload/compliance-document"
                      accept="image/*"
                      :max-file-size="1000000"
                      @select="(e) => onFileSelect(e, 'ktpDocument', props)"
                    />

                    <UIUploadedFileItem
                      v-else
                      :name="ktpDocument.name"
                      :size="ktpDocument.size"
                      :uploaded-at="ktpDocument.uploadedAt"
                      :mime-type="ktpDocument.mimeType"
                      @remove="() => onFileRemove('ktpDocument', props)"
                    />
                  </div>
                  <Message v-if="invalid" severity="error" size="small" variant="simple">
                    {{ error?.message }}
                  </Message>
                </FormField>
              </div>
            </div>

            <!-- e-NPWP -->
            <div class="px-6">
              <div class="flex flex-col gap-[6px]">
                <div class="flex flex-wrap gap-6 items-center justify-between">
                  <label class="flex items-center gap-1 font-medium text-neutral-90">
                    e-NPWP (Tax ID)
                    <PopoverENPWP />
                  </label>
                  <PillSuccessUpload v-if="npwpDocument" />
                </div>
                <div class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]">
                  <FileUpload
                    v-if="!npwpDocument"
                    ref="fileUploadRef"
                    class="rimkirim-basic-upload h-full"
                    mode="basic"
                    name="npwpDocument"
                    url="/api/upload/compliance-document"
                    accept="image/*"
                    :max-file-size="1000000"
                    @select="(e) => onSelectedFiles(e, 'npwpDocument')"
                  />
                  <UIUploadedFileItem
                    v-else
                    key="npwpDocument"
                    class="w-full"
                    :size="npwpDocument?.size"
                    :name="npwpDocument?.name"
                    :uploaded-at="npwpDocument?.uploadedAt"
                    :mime-type="npwpDocument?.mimeType"
                    @remove="
                      documents.npwpDocument = null
                      // field.onChange(uploaded.localPath);
                    "
                  />
                </div>
              </div>
            </div>

            <!-- Passport -->
            <div class="px-6">
              <div class="flex flex-col gap-[6px]">
                <div class="flex flex-wrap gap-6 items-center justify-between">
                  <label class="font-medium text-neutral-90">Passport</label>
                  <PillSuccessUpload v-if="passportDocument" />
                </div>
                <div class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]">
                  <FileUpload
                    v-if="!passportDocument"
                    ref="fileUploadRef"
                    class="rimkirim-basic-upload h-full"
                    mode="basic"
                    name="passportDocument"
                    url="/api/upload/compliance-document"
                    accept="image/*"
                    :max-file-size="1000000"
                    @select="(e) => onSelectedFiles(e, 'passportDocument')"
                  />
                  <UIUploadedFileItem
                    v-else
                    key="passportDocument"
                    class="w-full"
                    :size="passportDocument?.size"
                    :name="passportDocument?.name"
                    :uploaded-at="passportDocument?.uploadedAt"
                    :mime-type="passportDocument?.mimeType"
                    @remove="
                      documents.passportDocument = null
                      // field.onChange(uploaded.localPath);
                    "
                  />
                </div>
              </div>
            </div>

            <!-- Surat Keterangan Pindah -->
            <div v-if="isPassengerGoods" class="px-6">
              <div class="flex flex-col gap-[6px]">
                <div class="flex flex-wrap gap-6 items-center justify-between">
                  <div class="flex items-center gap-1 font-medium text-neutral-90">
                    <label>
                      Surat Keterangan Pindah
                      <span class="text-red-500">*</span>
                    </label>
                    <PopoverSuratKeteranganPindah />
                  </div>
                  <PillSuccessUpload v-if="skpKbriDocument" />
                </div>

                <FormField name="skpKbriDocument" v-slot="{ props, invalid, error }">
                  <div class="card" :class="invalid ? 'border border-red-600 rounded-[8px]' : ''">
                    <FileUpload
                      v-if="!skpKbriDocument"
                      ref="fileUploadRef"
                      class="rimkirim-basic-upload h-full"
                      mode="basic"
                      name="npwp"
                      url="/api/upload/compliance-document"
                      accept="image/*"
                      :max-file-size="1000000"
                      @select="(e) => onFileSelect(e, 'skpKbriDocument', props)"
                    />

                    <UIUploadedFileItem
                      v-else
                      :name="skpKbriDocument.name"
                      :size="skpKbriDocument.size"
                      :uploaded-at="skpKbriDocument.uploadedAt"
                      :mime-type="skpKbriDocument.mimeType"
                      @remove="() => onFileRemove('skpKbriDocument', props)"
                    />
                  </div>
                  <Message v-if="invalid" severity="error" size="small" variant="simple">
                    {{ error?.message }}
                  </Message>
                </FormField>
              </div>
            </div>

            <div class="px-6">
              <div class="h-[1px] border-y border-[#EDEDED]" />
            </div>

            <div class="px-6 flex flex-col gap-6">
              <div class="flex flex-col gap-[6px]">
                <div class="font-medium text-neutral-80">Additional Documents (Optional)</div>
                <div class="font-medium text-neutral-60">
                  If you have another supporting documents, specify the name and upload them here.
                </div>
              </div>

              <!-- Add Document -->
              <div class="flex gap-4">
                <InputText
                  v-model="additionalDocumentName"
                  placeholder="Input Document Name (e.g., Letter of Acceptance, Insurance Policy)"
                  class="flex-1"
                />
                <BlackButton class="w-[119px]" @click="addAdditionalDocument">
                  <IconPlusWhite /> Add File
                </BlackButton>
              </div>

              <!-- List Additional Docs -->
              <div v-for="doc in additionalDocuments" :key="doc.id" class="flex flex-col gap-[6px]">
                <div class="flex flex-wrap gap-6 items-center justify-between">
                  <label class="font-medium text-neutral-90">{{ doc.name }}</label>
                  <PillSuccessUpload v-if="doc?.file?.upload" />
                </div>

                <FileUpload
                  v-if="!doc.file"
                  mode="basic"
                  class="rimkirim-basic-upload h-full"
                  accept="image/*,application/pdf"
                  :max-file-size="1000000"
                  @select="(e) => onUploadAdditionalFile(e, doc)"
                />

                <UIUploadedFileItem
                  v-else
                  class="w-full"
                  :name="doc.file.name"
                  :size="doc.file.size"
                  :uploaded-at="doc.file.uploadedAt"
                  :mime-type="doc.file.mimeType"
                  @remove="removeAdditionalDocument(doc.id)"
                />
              </div>
            </div>
          </div>
=======
        <FormHeader title="COMPLIANCE DOCUMENT"
          description="Please Upload the necessary document to proceed. Accepted formats: PDF, JPG, PNG (Max 5MB)." />

        <Form class="flex flex-col gap-6" v-slot="$form" :resolver="resolver" :initialValues="initialValues"
          validateOnBlur @submit="handleSubmit">
>>>>>>> Refactor page structure; Page customer infor and item & packages

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
<<<<<<< HEAD
              <!--  @click="handleFinishLater" -->
              <TextButton
                :disabled="submitLoading || bookingProgressLoading"
                @click="showPopupFinishLater"
              >
                Finish Later
              </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton
                type="submit"
                class="w-[100px]"
                :loading="submitLoading"
                :disabled="finishLaterLoading || bookingProgressLoading"
              >
=======
              <!-- @click="actionForm = ''" -->
              <TextButton @click="handleFinishLater" :disabled="submitLoading">
                Finish Later
              </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton type="submit" class="w-[100px]" :loading="submitLoading">
>>>>>>> Refactor page structure; Page customer infor and item & packages
                Done
              </PrimaryButton>
            </div>
          </div>
<<<<<<< HEAD

          <!-- Confirm Save Later -->
          <BasePopup
            v-model:visible="visibleConfirmSaveLater"
            :icon="IconSaveProgress"
            title="Your progress will be saved"
            :description="`Finish later will automatically save your progress in \ncompliance document.\nYou can comeback later to complete the form.`"
            @cancel="closePopupFinishLater"
            @ok="handleFinishLater($form)"
            :okLoading="finishLaterLoading"
          />
        </Form>
=======
        </Form>

        <!-- <BasePopup v-model:visible="visibleConfirmChangeShipmentOwner" :icon="IconAlertCircle"
          title="Change Information"
          :description="`Are you sure you want to replace all information with ${firstCapital(pendingShipmentOwnerSameAs as string)} Information?`"
          @cancel="handleOnCancelChangeShipmentOwner" @ok="handleOnOkChangeShipmentOwner" /> -->

>>>>>>> Refactor page structure; Page customer infor and item & packages
      </section>
    </template>

    <template v-else>
<<<<<<< HEAD
      <UISuccessSubmitFormStepOrderHub
        :step="currentStep"
        :response="submittedResponse"
        @go-to-order-hub="navigateToOrderHub"
      />
    </template>
  </section>
</template>
=======
      <!-- Success Notification -->
      <div class="w-[500px] mx-auto flex flex-col gap-6 bg-[#F6F6FA] rounded-[16px] mt-16 px-6 py-8">
        <div class="flex flex-col items-center gap-4">
          <!-- Icon -->
          <!-- <component v-if="props.icon" :is="props.icon" class="mx-auto text-[#C1FF00]" /> -->
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30.0288 7.03829C32.6859 4.83503 36.5738 5.41643 38.5977 8.13204C40.5039 10.69 40.1408 14.3181 37.6868 16.3984C31.2286 21.8725 26.2433 25.615 21.0396 31.1828C19.5905 32.7333 18.4204 33.9863 17.4046 34.8366C16.3842 35.6908 15.3069 36.3248 14.0259 36.3132C12.7644 36.3016 11.7282 35.6945 10.7532 34.8606C9.79494 34.0408 8.71569 32.8397 7.38992 31.3691L3.77713 27.3632C1.88851 25.268 1.65882 22.1515 3.21658 19.7993C5.4471 16.432 10.246 16.0946 12.9202 19.1225L15.1778 21.6792C19.5258 16.6538 24.124 11.936 30.0288 7.03829ZM36.4939 9.70089C35.3267 8.13453 33.1509 7.85959 31.7036 9.06002C25.9131 13.863 21.4074 18.4869 17.1226 23.4428C16.9639 23.6263 16.6966 23.9584 16.3689 24.164C15.7382 24.5595 14.9639 24.6119 14.2942 24.3213L14.0139 24.176C13.6845 23.9741 13.4162 23.6472 13.2569 23.4668L10.9532 20.8589C9.42405 19.1281 6.6846 19.3182 5.40579 21.2485C4.50823 22.6035 4.64154 24.3999 5.72708 25.6047L9.33987 29.6123C10.7148 31.1374 11.6612 32.1839 12.4588 32.8662C13.2394 33.5338 13.6902 33.6849 14.0498 33.6882C14.3904 33.6913 14.8615 33.5433 15.7195 32.8252C16.5824 32.1028 17.6246 30.9924 19.1221 29.3901C24.4641 23.6744 29.6594 19.7613 35.9898 14.3955C37.3629 13.2312 37.5899 11.1721 36.4939 9.70089Z"
              fill="#27C827" />
          </svg>


          <!-- Title -->
          <h3 class="text-[24px] leading-[32px] font-semibold text-[#1E1E1E] text-center">
            <!-- {{ props.title }} -->
            Customer Information <br />
            Saved!
          </h3>

          <!-- Description -->
          <p class="text-[#9E9E9E] text-center px-2">
            <!-- {{ props.description }} -->
            Your Customer Information has been successfully saved. Please proceed to finish the remaining form for your
            booking.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-center">
          <PrimaryButton class="w-[244px]" @click="handleGoToOrderHubPage">Go To Booking Order Hub</PrimaryButton>
        </div>
      </div>
    </template>
  </section>
</template>
>>>>>>> Refactor page structure; Page customer infor and item & packages

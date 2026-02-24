<script setup lang="ts">
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
  const errorSubmit = ref("");

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

  const handleSubmit = async ({ values, valid }: { values: any; valid: boolean }) => {
    if (!valid || submitLoading.value) return;

    submitLoading.value = true;

    try {
      const payload: Record<string, DocumentPayload | string> = {
        ...values,
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

      const res = await $fetch<OrderHubProgress>("/api/order-hub/compliance-document", {
        method: "PUT",
        body: payload,
        credentials: "include",
      });

      submittedResponse.value = res;
      viewMode.value = "success";
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

<template>
  <section class="flex flex-col relative gap-6 max-w-7xl mx-auto px-6 pt-28 pb-24">
    <!-- <div
      class="fixed top-[14px] left-1/2  transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full w-fit z-[100]">
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium cursor-pointer rounded-full"
        :class="purposeOfShipment === 'moving_goods' ? 'bg-[#0093FF] text-white' : 'text-neutral-60'">
        Personal Belongings
      </div>
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium  cursor-pointer rounded-full"
        :class="purposeOfShipment === 'passenger_goods' ? 'bg-[#FF7C00] text-white' : 'text-neutral-60'">
        Passenger Goods
      </div>
    </div> -->

    <template v-if="viewMode === 'form'">
      <!-- Section Form -->
      <section class="w-[1024px] mx-auto flex flex-col gap-6 mt-4">
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
                <FormField name="ktpDocument" v-slot="{ props, invalid, error }">
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

                  <p v-if="invalid" class="text-[12px] text-red-500 mt-2">
                    {{ error?.message }}
                  </p>
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

                  <p v-if="invalid" class="text-[12px] text-red-500 mt-2">
                    {{ error?.message }}
                  </p>
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
                <!-- 
                <FormField :name="toCamelCase(doc.name)" v-slot="{ props }">
                  <FileUpload
                    v-if="!doc.file"
                    mode="basic"
                    @select="(e) => onFileSelect(e, toCamelCase(doc.name), props, doc)"
                  />

                  <UIUploadedFileItem
                    v-else
                    :name="doc.file.name"
                    :size="doc.file.size"
                    :uploaded-at="doc.file.uploadedAt"
                    :mime-type="doc.file.mimeType"
                    @remove="() => onFileRemove(toCamelCase(doc.name), props, doc)"
                  />
                </FormField> -->
              </div>
            </div>
          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!--  @click="handleFinishLater" -->
              <TextButton :disabled="submitLoading"> Finish Later </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton type="submit" class="w-[100px]" :loading="submitLoading">
                Done
              </PrimaryButton>
            </div>
          </div>
        </Form>

        <!-- <BasePopup v-model:visible="visibleConfirmChangeShipmentOwner" :icon="IconAlertCircle"
          title="Change Information"
          :description="`Are you sure you want to replace all information with ${firstCapital(pendingShipmentOwnerSameAs as string)} Information?`"
          @cancel="handleOnCancelChangeShipmentOwner" @ok="handleOnOkChangeShipmentOwner" /> -->
      </section>
    </template>

    <template v-else>
      <UISuccessSubmitFormStepOrderHub
        :step="currentStep"
        :response="submittedResponse"
        @go-to-order-hub="navigateToOrderHub"
      />
    </template>
  </section>
</template>

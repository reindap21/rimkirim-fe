<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { ref } from "vue";
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

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

// Extended file object with frontend-specific fields
// Omit uploadedAt from ComplianceDocument (which is string) and use Date instead
type FileObjType = Omit<ComplianceDocument, "uploadedAt"> & {
  upload?: boolean; // Added by frontend after upload
  uploadedAt?: Date; // Frontend uses Date object instead of string
};

type AdditionalDocument = {
  id: string;
  name: string;
  file?: FileObjType;
};

type FileUploadSelectEvent = {
  files: File[];
};

// Upload API response data type (snake_case from /api/upload/compliance-document)
type UploadApiData = UploadDocumentResponse["data"];

// Document payload for submission
type DocumentPayload = {
  path: string;
  mimeType?: string;
  uploadedAt?: string;
};

// * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

definePageMeta({
  layout: "order-hub",
  // middleware: 'auth'
});

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

// Use order hub composable for shared state and methods
const {
  bookingCode,
  navigateToOrderHub: handleBack,
  fetchProgress: getBookingProgress,
} = useOrderHub();

const purposeOfShipment = ref<"" | PurposeOfShipment>("");
const packingListCode = ref<string | null>("-");

const viewMode = ref<"form" | "success">("form");

const currentStep: OrderHubStep = "compliance_document";

const submittedResponse = ref<any>(); // eslint-disable-line

// * ------- Form Handling

const submitLoading = ref(false);
const errorSubmit = ref("");

const documentMap = {
  ktp: "ktpDocument",
  npwp: "npwpDocument",
  passport: "passportDocument",
  skpKbri: "skpKbriDocument",
} as const;

const documents = ref<Record<string, FileObjType | null>>({
  ktp: null,
  npwp: null,
  passport: null,
  skpKbri: null,
});

const ktp = computed(() => documents.value.ktp);
const npwp = computed(() => documents.value.npwp);
const passport = computed(() => documents.value.passport);
const skpKbri = computed(() => documents.value.skpKbri);

const additionalDocumentName = ref("");
const additionalDocuments = ref<AdditionalDocument[]>([]);

// * ------- Upload

const $primevue = usePrimeVue();

const initialValues = {};

const resolver = ref(
  zodResolver(
    z.object({
      // Sender
      // senderContactName: z.string().min(1, { message: 'Full name is required.' }),
    }),
  ),
);

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

// Load booking progress and map compliance documents
// eslint-disable-next-line
const loadBookingProgress = async () => {
  const res = await getBookingProgress();

  if (!res) return;

  // Map the initial data
  packingListCode.value = res?.packing_list_code || "-";
  purposeOfShipment.value = res?.purpose_of_shipment;

  const { compliance_document } = res;

  if (compliance_document.data && Array.isArray(compliance_document.data) && compliance_document.data.length > 0) {
    // Compliance document data from progress API is already in camelCase
    (compliance_document.data as ComplianceDocument[]).forEach((fileData: ComplianceDocument) => {
      const file: FileObjType = {
        ...fileData,
        googleDrivePath: fileData.googleDrivePath || null,
        googleDriveUrl: fileData.googleDriveUrl || null,
        upload: fileData.uploadedAt !== undefined, // Mark as uploaded if uploadedAt exists
        uploadedAt: fileData.uploadedAt ? new Date(fileData.uploadedAt) : undefined,
      };

      if (file.documentType === "ktpDocument") documents.value.ktp = file;
      else if (file.documentType === "npwpDocument") documents.value.npwp = file;
      else if (file.documentType === "passportDocument")
        documents.value.passport = file;
      else if (file.documentType === "skpKbriDocument")
        documents.value.skpKbri = file;
      else {
        // Additional documents use camelCase (e.g., "letterOfAcceptance")
        // Convert to title case for display (e.g., "Letter Of Acceptance")
        additionalDocuments.value.push({
          id: crypto.randomUUID(),
          name: camelToTitleCase(file.documentType),
          file
        })
      }
    });
  }

  submittedResponse.value = res;
};

const handleSubmit = async ({
  values,
  valid,
}: {
  values: Record<string, unknown>;
  valid: boolean;
}) => {

  if (!valid || submitLoading.value) return;

  errorSubmit.value = "";
  submitLoading.value = true;

  const payload: Record<string, DocumentPayload | string> = {
    ...values,
    bookingCode: bookingCode.value,
    ...Object.fromEntries(
      Object.entries(documentMap)
        .filter(
          ([key]) =>
            documents.value[key as keyof typeof documentMap]?.localPath,
        )
        .map(([key, apiKey]) => {
          const doc = documents.value[key as keyof typeof documentMap]!;
          return [
            apiKey,
            {
              path: doc.localPath,
              mimeType: doc.mimeType,
              uploadedAt: doc.uploadedAt?.toISOString(),
            }
          ];
        }),
    ),
  };

  if (additionalDocuments.value.length > 0) {
    additionalDocuments.value
      .filter((d) => d.file?.localPath)
      .forEach((d) => {
        // Convert display name back to camelCase (e.g., "Letter Of Acceptance" -> "letterOfAcceptance")
        const camelCaseKey = toCamelCase(d.name || "");

        payload[camelCaseKey] = {
          path: d.file!.localPath,
          mimeType: d.file!.mimeType,
          uploadedAt: d.file!.uploadedAt?.toISOString(),
        };
      });
  }

  try {
    const res = await $fetch<OrderHubProgress>("/api/order-hub/compliance-document", {
      method: "PUT",
      body: payload,
      credentials: "include", // Required
    });

    // Store state
    // userState.value = res.user

    if (res) {
      submittedResponse.value = res
      viewMode.value = "success";
    }
  } catch (err: any) { // eslint-disable-line
    errorSubmit.value = err?.data?.message || "Error submit item and packages";
  } finally {
    submitLoading.value = false;
  }
};

// * ------- Upload

const uploadDocument = async (
  files: File[],
  documentType: string,
  target?: AdditionalDocument,
) => {
  const formData = new FormData();

  formData.append("booking_code", bookingCode.value);
  formData.append("document_type", documentType);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await $fetch<UploadApiData>("/api/upload/compliance-document", {
    method: "POST",
    body: formData,
  });

  // Transform snake_case API response to camelCase
  const uploaded: FileObjType = {
    localPath: res.local_path,
    documentType: res.document_type,
    name: res.name,
    size: res.size,
    mimeType: res.mime_type,
    googleDrivePath: null, // Upload API doesn't return Google Drive fields
    googleDriveUrl: null, // Upload API doesn't return Google Drive fields
    upload: true,
    uploadedAt: new Date(),
  };

  if (target) {
    target.file = uploaded;
  } else {
    documents.value[documentType] = uploaded;
  }
};

const onSelectedFiles = (event: FileUploadSelectEvent, documentType: string) => {
  uploadDocument(event.files, documentType);
};

const onUploadAdditionalFile = (event: FileUploadSelectEvent, doc: AdditionalDocument) => {
  // Convert document name to camelCase (e.g., "Letter of Acceptance" -> "letterOfAcceptance")
  const documentType = toCamelCase(doc.name);
  uploadDocument(event.files, documentType, doc);
};

// UX Upload progress
// const uploadEvent = (callback) => {
//   totalSizePercent.value = totalSize.value / 10;
//   callback();
// };

// const formatSize = (bytes) => {
//   const k = 1024;
//   const dm = 3;
//   const sizes = $primevue.config.locale.fileSizeTypes;

//   if (bytes === 0) {
//     return `0 ${sizes[0]}`;
//   }

//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

//   return `${formattedSize} ${sizes[i]}`;
// };

const removeUploadedFile = (key: string) => {
  if (key in documents.value) {
    documents.value[key as keyof typeof documents.value] = null;
  }
};

const addAdditionalDocument = () => {
  if (!additionalDocumentName.value.trim()) return;

  additionalDocuments.value.push({
    id: crypto.randomUUID(),
    name: additionalDocumentName.value.trim(),
  });

  additionalDocumentName.value = "";
};

const removeAdditionalDocument = (id: string) => {
  additionalDocuments.value = additionalDocuments.value.filter(
    (d) => d.id !== id,
  );
};

const handleFinishLater = () => {
  // actionForm.value = ""
};

const handleGoToOrderHubPage = () => {
  handleBack(); // Use the composable's navigateToOrderHub
};

// * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

onMounted(() => {
  loadBookingProgress();
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
        <FormHeader title="COMPLIANCE DOCUMENT"
          description="Please Upload the necessary document to proceed. Accepted formats: PDF, JPG, PNG (Max 5MB)." />

        <div class="flex flex-col gap-6 pb-6 bg-neutral-10 rounded-[12px] border border-[#EDEDED]">
          <!-- Required Documents -->
          <div class="flex items-center p-6 gap-6 bg-neutral-20 rounded-tl-[12px] rounded-tr-[12px]">
            <div class="flex-1 flex items-center gap-2">
              <div class="h-[42px] w-[42px] bg-white rounded-full flex items-center justify-center">
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
                <PillSuccessUpload v-if="ktp && ktp?.upload" />
              </div>
              <div class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]">
                <FileUpload v-if="!ktp" ref="fileUploadRef" class="rimkirim-basic-upload h-full" mode="basic" name="ktp"
                  url="/api/upload/compliance-document" accept="image/*" :max-file-size="1000000"
                  @select="(e) => onSelectedFiles(e, 'ktp')" />
                <UIUploadedFileItem v-else key="ktp" class="w-full" :size="ktp?.size" :name="ktp?.name"
                  :uploaded-at="ktp?.uploadedAt" :mime-type="ktp?.mimeType" @remove="removeUploadedFile('ktp')" />
              </div>
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
                <PillSuccessUpload v-if="npwp && npwp?.upload" />
              </div>
              <div class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]">
                <FileUpload v-if="!npwp" ref="fileUploadRef" class="rimkirim-basic-upload h-full" mode="basic"
                  name="npwp" url="/api/upload/compliance-document" accept="image/*" :max-file-size="1000000"
                  @select="(e) => onSelectedFiles(e, 'npwp')" />
                <UIUploadedFileItem v-else key="npwp" class="w-full" :size="npwp?.size" :name="npwp?.name"
                  :uploaded-at="npwp?.uploadedAt" :mime-type="npwp?.mimeType" @remove="removeUploadedFile('npwp')" />
              </div>
            </div>
          </div>

          <!-- Passport -->
          <div class="px-6">
            <div class="flex flex-col gap-[6px]">
              <div class="flex flex-wrap gap-6 items-center justify-between">
                <label class="font-medium text-neutral-90">Passport</label>
                <PillSuccessUpload v-if="passport && passport?.upload" />
              </div>
              <div class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]">
                <FileUpload v-if="!passport" ref="fileUploadRef" class="rimkirim-basic-upload h-full" mode="basic"
                  name="passport" url="/api/upload/compliance-document" accept="image/*" :max-file-size="1000000"
                  @select="(e) => onSelectedFiles(e, 'passport')" />
                <UIUploadedFileItem v-else key="passport" class="w-full" :size="passport?.size" :name="passport?.name"
                  :uploaded-at="passport?.uploadedAt" :mime-type="passport?.mimeType" @remove="removeUploadedFile('passport')" />
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
                <PillSuccessUpload v-if="skpKbri && skpKbri?.upload" />
              </div>
              <div class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]">
                <FileUpload v-if="!skpKbri" ref="fileUploadRef" class="rimkirim-basic-upload h-full" mode="basic"
                  name="skpKbri" url="/api/upload/compliance-document" accept="image/*" :max-file-size="1000000"
                  @select="(e) => onSelectedFiles(e, 'skpKbri')" />
                <UIUploadedFileItem v-else key="skpKbri" class="w-full" :size="skpKbri?.size" :name="skpKbri?.name"
                  :uploaded-at="skpKbri?.uploadedAt" :mime-type="skpKbri?.mimeType" @remove="removeUploadedFile('skpKbri')" />
              </div>
            </div>
          </div>

          <div class="px-6">
            <div class="h-[1px] border-y border-[#EDEDED]" />
          </div>

          <div class="px-6 flex flex-col gap-6">
            <div class="flex flex-col gap-[6px]">
              <div class="font-medium text-neutral-80">
                Additional Documents (Optional)
              </div>
              <div class="font-medium text-neutral-60">
                If you have another supporting documents, specify the name and
                upload them here.
              </div>
            </div>

            <!-- Add Document -->
            <div class="flex gap-4">
              <InputText v-model="additionalDocumentName"
                placeholder="Input Document Name (e.g., Letter of Acceptance, Insurance Policy)" class="flex-1" />
              <BlackButton class="w-[119px]" @click="addAdditionalDocument">
                <IconPlusWhite /> Add File
              </BlackButton>
            </div>

            <!-- List Additional Docs -->
            <div v-for="doc in additionalDocuments" :key="doc.id" class="flex flex-col gap-[6px]">
              <div class="flex flex-wrap gap-6 items-center justify-between">
                <label class="font-medium text-neutral-90">{{
                  doc.name
                  }}</label>
                <PillSuccessUpload v-if="doc?.file?.upload" />
              </div>

              <FileUpload v-if="!doc.file" mode="basic" class="rimkirim-basic-upload h-full"
                accept="image/*,application/pdf" :max-file-size="1000000"
                @select="(e) => onUploadAdditionalFile(e, doc)" />

              <UIUploadedFileItem v-else class="w-full" :name="doc.file.name" :size="doc.file.size"
                :uploaded-at="doc.file.uploadedAt" :mime-type="doc.file.mimeType" @remove="removeAdditionalDocument(doc.id)" />
            </div>
          </div>
        </div>

        <Form v-slot="$form" class="flex flex-col gap-6" :resolver="resolver" :initial-values="initialValues"
          validate-on-blur @submit="handleSubmit">
          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!-- @click="actionForm = ''" -->
              <TextButton :disabled="submitLoading" @click="handleFinishLater">
                Finish Later
              </TextButton>
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
      <UISuccessSubmitFormStepOrderHub :step="currentStep" :response="submittedResponse"
        @go-to-order-hub="handleGoToOrderHubPage" />
    </template>
  </section>
</template>

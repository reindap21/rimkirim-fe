<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { ref } from "vue";
import { z } from "zod";
import { MENU } from "~/config";

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

type FileObjType = {
  local_path: string;
  document_type: string;
  name: string;
  size: number;
  mime_type: string;
};

type DocumentType =
  | "ktpDocument"
  | "npwpDocument"
  | "passportDocument"
  | "skpKbriDocument";

type AdditionalDocument = {
  id: string;
  name: string;
  file?: FileObjType;
};

// * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

definePageMeta({
  layout: "order-hub",
  // middleware: 'auth'
});

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const route = useRoute();
const router = useRouter();
const { user, loading } = useAuth();

const bookingCode = route.params.id as string;

const bookingProgressLoading = ref(true);

const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");
const packingListCode = ref("-");

const viewMode = ref<"form" | "success">("form");

// * ------- Form Handling

const submitLoading = ref(false);
const errorSubmit = ref("");

const documentMap = {
  ktp: "ktpDocument",
  npwp: "npwpDocument",
  passport: "passportDocument",
  skpKbri: "skpKbriDocument",
} as const;

const documents = ref<Record<DocumentType, FileObjType | null>>({
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

const totalSize = ref(0);
const totalSizePercent = ref(0);

const fileUploadRef = ref<any>(null);

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

// eslint-disable-next-line
const getBookingProgress = async (bookingCode: any) => {
  bookingProgressLoading.value = true;

  try {
    const res = await $fetch(`/api/order-hub/progress`, {
      method: "GET",
      credentials: "include", // Required
      params: {
        bookingCode,
      },
    });
    // Map the initial data
    // Head
    packingListCode.value = res?.packing_list_code;
    purposeOfShipment.value = res?.purpose_of_shipment;

    const { compliance_document } = res;

    if (compliance_document.data?.length > 0) {
      compliance_document.data.forEach((file) => {
        if (file.documentType === "ktpDocument") documents.value.ktp = file;
        else if (file.documentType === "npwpDocument") documents.value.npwp = file;
        else if (file.documentType === "passportDocument")
          documents.value.passport = file;
        else if (file.documentType === "skpKbriDocument")
          documents.value.skpKbri = file;
        else {
          additionalDocuments.value.push({
            id: crypto.randomUUID(),
            name: file.documentType?.split('_').join(" "),
            file
          })
        }
      });
    }

    // Content
    const { item_and_package } = res;
    // Fill the packages
    packages.value =
      item_and_package.data?.length > 0
        ? item_and_package.data.map((v) => ({ ...v, id: nanoid() }))
        : [createPackage()];

    console.log(packages.value);
  } catch (err) {
    if ((err as any)?.statusCode === 401) router.push("/"); // eslint-disable-line
    bookingProgressLoading.value = false;
  }
};

const handleSubmit = async ({
  values,
  valid,
}: {
  values: any;
  valid: boolean;
}) => {
  if (!valid || submitLoading.value) return;

  viewMode.value = "success";

  errorSubmit.value = "";
  submitLoading.value = true;

  let payload = {
    ...values,
    bookingCode,
    ...Object.fromEntries(
      Object.entries(documentMap)
        .filter(
          ([key]) =>
            documents.value[key as keyof typeof documentMap]?.local_path,
        )
        .map(([key, apiKey]) => [
          apiKey,
          documents.value[key as keyof typeof documentMap]!.local_path,
        ]),
    ),
  };

  if (additionalDocuments.value.length > 0) {
    additionalDocuments.value
      .filter((d) => d.file?.local_path)
      .forEach((d) => {
        payload[d.name?.split(" ")?.join("-")] = d.file!.local_path;
      });
  }

  try {
    const res = await $fetch("/api/order-hub/compliance-document", {
      method: "PUT",
      body: payload,
      credentials: "include", // Required
    });

    // Store state
    // userState.value = res.user

    if (res?.statusCode === 200) viewMode.value = "success";
    viewMode.value = "success";
  } catch (err: any) {
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

  formData.append("booking_code", bookingCode);
  formData.append("document_type", documentType);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await $fetch("/api/upload/compliance-document", {
    method: "POST",
    body: formData,
  });

  const uploaded = {
    ...(res as any).files,
    upload: true,
    uploadedAt: new Date(),
  };

  if (target) {
    target.file = uploaded;
  } else {
    documents.value[documentType] = uploaded;
  }
};

const onSelectedFiles = (event, documentType: string) => {
  uploadDocument(event.files, documentType);
};

const onUploadAdditionalFile = (event, doc: AdditionalDocument) => {
  uploadDocument(event.files, "additional_document", doc);
};

// UX Upload progress
// const uploadEvent = (callback) => {
//   totalSizePercent.value = totalSize.value / 10;
//   callback();
// };

const formatSize = (bytes) => {
  const k = 1024;
  const dm = 3;
  const sizes = $primevue.config.locale.fileSizeTypes;

  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
};

const removeUploadedFile = (key: string) => {
  if (key in documents.value) {
    documents.value[key as keyof typeof documents.value] = undefined;
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

const handleBack = () => {
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  });
};

const handleGoToOrderHubPage = () => {
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  });
};

// * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

onMounted(() => {
  getBookingProgress(bookingCode);
});
</script>

<template>
  <section
    class="flex flex-col relative gap-6 max-w-7xl mx-auto px-6 pt-28 pb-24"
  >
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
              <div
                class="text-[20px] leading-[130%] font-medium text-neutral-90"
              >
                Required Documents
              </div>
            </div>
          </div>

          <!-- KTP -->
          <div class="px-6">
            <div class="flex flex-col gap-[6px]">
              <div class="flex flex-wrap gap-6 items-center justify-between">
                <label class="font-medium text-neutral-90"
                  >KTP (Identity Card)<span class="text-red-500">*</span></label
                >
                <PillSuccessUpload v-if="ktp && ktp?.upload" />
              </div>
              <div
                class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]"
              >
                <FileUpload
                  v-if="!ktp"
                  ref="fileUploadRef"
                  class="rimkirim-basic-upload h-full"
                  mode="basic"
                  name="ktp"
                  url="/api/upload/compliance-document"
                  accept="image/*"
                  :maxFileSize="1000000"
                  @select="(e) => onSelectedFiles(e, 'ktp')"
                  @upload="onUpload"
                />
                <UIUploadedFileItem
                  v-else
                  key="ktp"
                  class="w-full"
                  :size="ktp?.size"
                  :name="ktp?.name"
                  :uploadedAt="ktp?.uploadedAt"
                  @remove="removeUploadedFile('ktp')"
                />
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
              <div
                class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]"
              >
                <FileUpload
                  v-if="!npwp"
                  ref="fileUploadRef"
                  class="rimkirim-basic-upload h-full"
                  mode="basic"
                  name="npwp"
                  url="/api/upload/compliance-document"
                  accept="image/*"
                  :maxFileSize="1000000"
                  @select="(e) => onSelectedFiles(e, 'npwp')"
                  @upload="onUpload"
                />
                <UIUploadedFileItem
                  v-else
                  key="npwp"
                  class="w-full"
                  :size="npwp?.size"
                  :name="npwp?.name"
                  :uploadedAt="npwp?.uploadedAt"
                  @remove="removeUploadedFile('npwp')"
                />
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
              <div
                class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]"
              >
                <FileUpload
                  v-if="!passport"
                  ref="fileUploadRef"
                  class="rimkirim-basic-upload h-full"
                  mode="basic"
                  name="passport"
                  url="/api/upload/compliance-document"
                  accept="image/*"
                  :maxFileSize="1000000"
                  @select="(e) => onSelectedFiles(e, 'passport')"
                  @upload="onUpload"
                />
                <UIUploadedFileItem
                  v-else
                  key="passport"
                  class="w-full"
                  :size="passport?.size"
                  :name="passport?.name"
                  :uploadedAt="passport?.uploadedAt"
                  @remove="removeUploadedFile('passport')"
                />
              </div>
            </div>
          </div>

          <!-- Surat Keterangan Pindah -->
          <div class="px-6">
            <div class="flex flex-col gap-[6px]">
              <div class="flex flex-wrap gap-6 items-center justify-between">
                <label class="flex items-center gap-1 font-medium text-neutral-90">
                  Surat Keterangan Pindah
                  <PopoverSuratKeteranganPindah />
                </label>
                <PillSuccessUpload v-if="skpKbri && skpKbri?.upload" />
              </div>
              <div
                class="card flex flex-wrap gap-6 items-center justify-between min-h-[46px]"
              >
                <FileUpload
                  v-if="!skpKbri"
                  ref="fileUploadRef"
                  class="rimkirim-basic-upload h-full"
                  mode="basic"
                  name="skpKbri"
                  url="/api/upload/compliance-document"
                  accept="image/*"
                  :maxFileSize="1000000"
                  @select="(e) => onSelectedFiles(e, 'skpKbri')"
                  @upload="onUpload"
                />
                <UIUploadedFileItem
                  v-else
                  key="skpKbri"
                  class="w-full"
                  :size="skpKbri?.size"
                  :name="skpKbri?.name"
                  :uploadedAt="skpKbri?.uploadedAt"
                  @remove="removeUploadedFile('skpKbri')"
                />
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
            <div
              v-for="doc in additionalDocuments"
              :key="doc.id"
              class="flex flex-col gap-[6px]"
            >
              <div class="flex flex-wrap gap-6 items-center justify-between">
                <label class="font-medium text-neutral-90">{{
                  doc.name
                }}</label>
                <PillSuccessUpload v-if="doc?.file?.upload" />
              </div>

              <FileUpload
                v-if="!doc.file"
                mode="basic"
                class="rimkirim-basic-upload h-full"
                accept="image/*,application/pdf"
                :maxFileSize="1000000"
                @select="(e) => onUploadAdditionalFile(e, doc)"
              />

              <UIUploadedFileItem
                v-else
                class="w-full"
                :name="doc.file.name"
                :size="doc.file.size"
                :uploadedAt="doc.file.uploadedAt"
                @remove="removeAdditionalDocument(doc.id)"
              />
            </div>
          </div>
        </div>

        <Form
          class="flex flex-col gap-6"
          v-slot="$form"
          :resolver="resolver"
          :initialValues="initialValues"
          validateOnBlur
          @submit="handleSubmit"
        >
          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!-- @click="actionForm = ''" -->
              <TextButton @click="handleFinishLater" :disabled="submitLoading">
                Finish Later
              </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton
                type="submit"
                class="w-[100px]"
                :loading="submitLoading"
              >
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
      <!-- Success Notification -->
      <div
        class="w-[500px] mx-auto flex flex-col gap-6 bg-neutral-20 rounded-[16px] mt-16 px-6 py-8"
      >
        <div class="flex flex-col items-center gap-4">
          <!-- Icon -->
          <!-- <component v-if="props.icon" :is="props.icon" class="mx-auto text-[#C1FF00]" /> -->
          <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.0288 7.03829C32.6859 4.83503 36.5738 5.41643 38.5977 8.13204C40.5039 10.69 40.1408 14.3181 37.6868 16.3984C31.2286 21.8725 26.2433 25.615 21.0396 31.1828C19.5905 32.7333 18.4204 33.9863 17.4046 34.8366C16.3842 35.6908 15.3069 36.3248 14.0259 36.3132C12.7644 36.3016 11.7282 35.6945 10.7532 34.8606C9.79494 34.0408 8.71569 32.8397 7.38992 31.3691L3.77713 27.3632C1.88851 25.268 1.65882 22.1515 3.21658 19.7993C5.4471 16.432 10.246 16.0946 12.9202 19.1225L15.1778 21.6792C19.5258 16.6538 24.124 11.936 30.0288 7.03829ZM36.4939 9.70089C35.3267 8.13453 33.1509 7.85959 31.7036 9.06002C25.9131 13.863 21.4074 18.4869 17.1226 23.4428C16.9639 23.6263 16.6966 23.9584 16.3689 24.164C15.7382 24.5595 14.9639 24.6119 14.2942 24.3213L14.0139 24.176C13.6845 23.9741 13.4162 23.6472 13.2569 23.4668L10.9532 20.8589C9.42405 19.1281 6.6846 19.3182 5.40579 21.2485C4.50823 22.6035 4.64154 24.3999 5.72708 25.6047L9.33987 29.6123C10.7148 31.1374 11.6612 32.1839 12.4588 32.8662C13.2394 33.5338 13.6902 33.6849 14.0498 33.6882C14.3904 33.6913 14.8615 33.5433 15.7195 32.8252C16.5824 32.1028 17.6246 30.9924 19.1221 29.3901C24.4641 23.6744 29.6594 19.7613 35.9898 14.3955C37.3629 13.2312 37.5899 11.1721 36.4939 9.70089Z"
              fill="#27C827"
            />
          </svg>

          <!-- Title -->
          <h3
            class="text-[24px] leading-[32px] font-semibold text-neutral-100 text-center"
          >
            <!-- {{ props.title }} -->
            Compliance Document <br />
            Submitted!
          </h3>

          <!-- Description -->
          <p class="text-neutral-60 text-center px-2">
            <!-- {{ props.description }} -->
            Thank you for submitting your document. We will review them shortly.
            You can track your progress in the Customer Order Hub.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-center">
          <PrimaryButton class="w-[244px]" @click="handleGoToOrderHubPage"
            >Go To Booking Order Hub</PrimaryButton
          >
        </div>
      </div>
    </template>
  </section>
</template>

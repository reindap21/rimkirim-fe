<script setup lang="ts">
<<<<<<< HEAD
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { ref } from "vue";
  import { z } from "zod";
  import IconAlertCircle from "~/components/icons/IconAlertCircle.vue";
  import IconSaveProgress from "~/components/icons/IconSaveProgress.vue";
  import type { AddressGeocode, CustomerInformationPayload, OrderHubStep } from "~/types/order-hub";
  import { hasValidGeocode } from "~/utils/address";

  // * ------- Schema ------------------------------------------------------------------------------------------------------------------------------------------------

  const schema = z.object({
    // Sender
    senderContactName: z.string().min(1, { message: "Full name is required." }),
    senderCountry: z
      .object({
        name: z.string(),
        code: z.string(),
        iso: z.string().optional(),
      })
      .nullable()
      .refine((v) => !!v?.code, {
        message: "Country is required.",
      }),
    senderFullAddress: z.string().min(1, {
      message: "Full address is required.",
    }),
    senderEmail: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
    senderPhoneNumber: z.string().min(1, { message: "Phone number is required." }),

    // Receiver
    receiverContactName: z.string().min(1, { message: "Full name is required." }),
    receiverCountry: z
      .object({
        name: z.string(),
        code: z.string(),
        iso: z.string().optional(),
      })
      .nullable()
      .refine((v) => !!v?.code, {
        message: "Country is required.",
      }),
    receiverFullAddress: z.string().min(1, {
      message: "Full address is required.",
    }),
    receiverEmail: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
    receiverPhoneNumber: z.string().min(1, { message: "Phone number is required." }),

    // Shipper
    shipperFullName: z.string().min(1, { message: "Owner name is required." }),
    shipperOriginPhoneNumber: z.string().min(1, { message: "Phone number is required." }),
    shipperDestinationPhoneNumber: z.string().min(1, { message: "Phone number is required." }),
    shipperEmail: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
  });

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  type CustomerInformationFormValues = z.infer<typeof schema>;

  type PrimeFormField<T> = {
    value: T;
    invalid: boolean;
    error?: { message?: string };
  };

  type PrimeFormInstance<T> = {
    [K in keyof T]: PrimeFormField<T[K]>;
  };

  type FormInstance = PrimeFormInstance<CustomerInformationFormValues>;

  // * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

  definePageMeta({
    layout: "order-hub",
    // middleware: 'auth'
  });

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const {
    loading: bookingProgressLoading,
    bookingCode,
    packingListCode,
    navigateToOrderHub,
    fetchProgress,
  } = useOrderHub(); // other vars: purposeOfShipment

  const { user, loading } = useAuth();

  const viewMode = ref<"form" | "success">("form");
  const dataLoading = ref(true); // Add loading state
  const formReady = ref(false);

  const currentStep: OrderHubStep = "customer_information";

  const submittedResponse = ref<any>(); // eslint-disable-line

  // * ------- Form Handling

  const formRef = ref<FormInstance | null>(null);
  const submitLoading = ref(false);
  const finishLaterLoading = ref(false);
  const errorSubmit = ref("");
  const isReceiverSameAsSender = ref(false);
  const shipmentOwnerInformationSameAs = ref<"" | "sender" | "receiver">("");
  const pendingShipmentOwnerSameAs = ref<"sender" | "receiver" | null>(null);

  const countries = ref<{ name: string; code: string }[]>([]);
  const countriesLoading = ref(true);

  const visibleConfirmChangeShipmentOwner = ref(false);
  const visibleConfirmSaveLater = ref(false);

  const initialValues = ref<CustomerInformationFormValues>({
    shipperFullName: "",
    shipperEmail: "",
    shipperOriginPhoneNumber: "",
    shipperDestinationPhoneNumber: "",

    senderContactName: "",
    senderEmail: "",
    senderPhoneNumber: "",
    senderCountry: null,
    senderFullAddress: "",

    receiverContactName: "",
    receiverEmail: "",
    receiverPhoneNumber: "",
    receiverCountry: null,
    receiverFullAddress: "",
  });

  const resolver = zodResolver(schema);

  // Customer Information
  const origin = ref<Partial<AddressGeocode>>({});
  const originAddress = ref("");
  const destination = ref<Partial<AddressGeocode>>({});
  const destinationAddress = ref("");

  // Address selection handlers
  const handleOriginSelect = (geocode: AddressGeocode) => {
    origin.value = geocode;
  };

  const handleDestinationSelect = (geocode: AddressGeocode) => {
    destination.value = geocode;
  };

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  const fetchCountries = async () => {
    try {
      const res = await $fetch(`/api/order-hub/countries`, {
        method: "GET",
        credentials: "include", // Required
      });
      countries.value = res; // API returns { code, iso, name }
      countriesLoading.value = false;
    } catch (err) {
      console.error("fetch countries error:", err);
      countriesLoading.value = false;
    }
  };

  const handleOnChangeIsReceiverSameAsSender = ($form: FormInstance) => {
    if (isReceiverSameAsSender.value) {
      // Copy all sender data to receiver (only these 3 property)
      $form.receiverContactName.value = $form.senderContactName.value;
      $form.receiverEmail.value = $form.senderEmail.value;
      $form.receiverPhoneNumber.value = $form.senderPhoneNumber.value;
    }
  };

  const handleOnClickSameAs = (sameAs: "sender" | "receiver", $form: FormInstance) => {
    if (shipmentOwnerInformationSameAs.value === "") {
      fillShipmentOwner(sameAs, $form);
    } else {
      if (shipmentOwnerInformationSameAs.value === sameAs) return;
      formRef.value = $form;
      showConfirmChangeShipmentOwner();
      pendingShipmentOwnerSameAs.value = sameAs;
    }
  };

  /**
   * Popup: Cancel Button Handler
   */
  const handleOnCancelChangeShipmentOwner = () => {
    pendingShipmentOwnerSameAs.value = null;
    visibleConfirmChangeShipmentOwner.value = false;
  };

  /**
   * Popup: OK Button Handler
   */
  const handleOnOkChangeShipmentOwner = () => {
    if (!pendingShipmentOwnerSameAs.value || !formRef.value) return;
    fillShipmentOwner(pendingShipmentOwnerSameAs.value, formRef.value);
    pendingShipmentOwnerSameAs.value = null;
    visibleConfirmChangeShipmentOwner.value = false;
  };

  /**
   * Popup: Show popup
   */
  const showConfirmChangeShipmentOwner = () => (visibleConfirmChangeShipmentOwner.value = true);

  /**
   * Fill shipment / package owner
   * @param sameAs
   * @param $form
   */
  const fillShipmentOwner = (sameAs: "sender" | "receiver", $form: FormInstance) => {
    if (sameAs === "sender") fillShipmentOwnerFromSender($form);
    if (sameAs === "receiver") fillShipmentOwnerFromReceiver($form);
  };

  /**
   * Implementation Fill shipment / package owner from sender
   * @param $form
   */
  const fillShipmentOwnerFromSender = ($form: FormInstance) => {
    $form.shipperFullName.value = $form.senderContactName.value;
    $form.shipperEmail.value = $form.senderEmail.value;
    $form.shipperOriginPhoneNumber.value = $form.senderPhoneNumber.value;
    $form.shipperDestinationPhoneNumber.value = $form.senderPhoneNumber.value;
    shipmentOwnerInformationSameAs.value = "sender";
  };

  /**
   * Implementation Fill shipment / package owner from receiver
   * @param $form
   */

  const fillShipmentOwnerFromReceiver = ($form: FormInstance) => {
    $form.shipperFullName.value = $form.receiverContactName.value;
    $form.shipperEmail.value = $form.receiverEmail.value;
    $form.shipperOriginPhoneNumber.value = $form.receiverPhoneNumber.value;
    $form.shipperDestinationPhoneNumber.value = $form.receiverPhoneNumber.value;
    shipmentOwnerInformationSameAs.value = "receiver";
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
  const handleFinishLater = async ($form: FormInstance) => {
    if (finishLaterLoading.value) return;

    finishLaterLoading.value = true;
    errorSubmit.value = "";

    const payload: Partial<CustomerInformationPayload> = {
      bookingCode: bookingCode.value,

      // sender
      senderContactName: $form?.senderContactName.value,
      senderEmail: $form?.senderEmail.value,
      senderPhoneNumber: $form?.senderPhoneNumber.value,
      senderCountry: $form?.senderCountry?.value?.code,
      senderFullAddress: originAddress.value ?? null,
      senderAddressGeocode: hasValidGeocode(origin.value) ? toRaw(origin.value) : null,

      // receiver
      receiverContactName: $form?.receiverContactName.value,
      receiverEmail: $form?.receiverEmail.value,
      receiverPhoneNumber: $form?.receiverPhoneNumber.value,
      receiverCountry: $form?.receiverCountry?.value?.code,
      receiverFullAddress: destinationAddress.value ?? null,
      receiverAddressGeocode: hasValidGeocode(destination.value) ? toRaw(destination.value) : null,

      // shipper
      shipperFullName: $form?.shipperFullName.value,
      shipperEmail: $form?.shipperEmail.value,
      shipperOriginPhoneNumber: $form?.shipperOriginPhoneNumber.value,
      shipperDestinationPhoneNumber: $form?.shipperDestinationPhoneNumber.value,

      receiverSameAsSender: isReceiverSameAsSender.value,
      shipmentOwnerSameAs: shipmentOwnerInformationSameAs.value ?? null,

      status: "draft",
    };

    try {
      const res = await $fetch("/api/order-hub/customer-information", {
        method: "PUT",
        body: payload,
        credentials: "include",
      });

      if (res) {
        navigateToOrderHub();
      }
    } catch (err: any) {
      errorSubmit.value = err?.data?.message || "Error saving draft customer information";
    } finally {
      finishLaterLoading.value = false;
    }
  };

  /**
   * Submit
   * @param param0
   */
  const handleSubmit = async ({
    values,
    valid,
  }: {
    values: CustomerInformationFormValues;
    valid: boolean;
  }) => {
    console.log("valid", valid);
    console.log("submitLoading", submitLoading.value);

    if (!valid || submitLoading.value) return;

    if (!hasValidGeocode(origin.value)) {
      errorSubmit.value = "Sender address must be selected from suggestions.";
      submitLoading.value = false;
      return;
    }

    if (!hasValidGeocode(destination.value)) {
      errorSubmit.value = "Receiver address must be selected from suggestions.";
      submitLoading.value = false;
      return;
    }

    errorSubmit.value = "";
    submitLoading.value = true;

    const payload: CustomerInformationPayload = {
      bookingCode: bookingCode.value,

      // ---- Sender
      senderContactName: values.senderContactName,
      senderEmail: values.senderEmail,
      senderPhoneNumber: values.senderPhoneNumber,
      senderCountry: values?.senderCountry?.code,
      senderFullAddress: originAddress.value,
      senderProvince: origin.value?.province || "",
      senderCity: origin.value?.city || "",
      senderPostalCode: origin.value?.postal_code || "",
      senderAddressGeocode: toRaw(origin.value),

      // ---- Receiver
      receiverContactName: values.receiverContactName,
      receiverEmail: values.receiverEmail,
      receiverPhoneNumber: values.receiverPhoneNumber,
      receiverCountry: values?.receiverCountry?.code,
      receiverFullAddress: destinationAddress.value,
      receiverProvince: destination.value?.province || "",
      receiverCity: destination.value?.city || "",
      receiverPostalCode: destination.value?.postal_code || "",
      receiverAddressGeocode: toRaw(destination.value),

      // ---- Shipper
      shipperFullName: values.shipperFullName,
      shipperEmail: values.shipperEmail,
      shipperOriginPhoneNumber: values.shipperOriginPhoneNumber,
      shipperDestinationPhoneNumber: values.shipperDestinationPhoneNumber,

      receiverSameAsSender: isReceiverSameAsSender.value,
      shipmentOwnerSameAs: shipmentOwnerInformationSameAs.value || null,
    };

    try {
      const res = await $fetch("/api/order-hub/customer-information", {
        method: "PUT",
        body: payload,
        credentials: "include", // Required
      });

      // Store response for success view
      if (res) {
        submittedResponse.value = res;
        viewMode.value = "success";
      }
    } catch (err: any) {
      errorSubmit.value = err?.data?.message || "Error submit customer information";
    } finally {
      submitLoading.value = false;
    }
  };

  // * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

  onMounted(async () => {
    dataLoading.value = true;

    await fetchCountries();
    const progress = await fetchProgress();

    if (progress?.customer_information?.data) {
      const data = progress.customer_information.data;

      initialValues.value = {
        shipperFullName: data.shipperFullName || "",
        shipperEmail: data.shipperEmail || "",
        shipperOriginPhoneNumber: data.shipperOriginPhoneNumber || "",
        shipperDestinationPhoneNumber: data.shipperDestinationPhoneNumber || "",

        senderContactName: data.senderContactName || "",
        senderEmail: data.senderEmail || "",
        senderPhoneNumber: data.senderPhoneNumber || "",
        senderCountry: countries.value.find((c) => c.code === data.senderCountry) ?? null,
        senderFullAddress: data.senderFullAddress || "",

        receiverContactName: data.receiverContactName || "",
        receiverEmail: data.receiverEmail || "",
        receiverPhoneNumber: data.receiverPhoneNumber || "",
        receiverCountry: countries.value.find((c) => c.code === data.receiverCountry) ?? null,
        receiverFullAddress: data.receiverFullAddress || "",
      };

      // geocode
      origin.value = data.senderAddressGeocode || {};
      destination.value = data.receiverAddressGeocode || {};
      originAddress.value = data.senderFullAddress || "";
      destinationAddress.value = data.receiverFullAddress || "";
    }

    dataLoading.value = false;
    formReady.value = true; // ⬅️ KUNCI
  });

  watchEffect(() => {});
</script>

=======

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { z } from 'zod';
import IconAlertCircle from '~/components/icons/IconAlertCircle.vue';
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
const isReceiverSameAsSender = ref(false);
const shipmentOwnerInformationSameAs = ref<"" | "sender" | "receiver">("");
const pendingShipmentOwnerSameAs = ref<"sender" | "receiver" | null>(null);

const countries = ref<{ name: string, code: string }[]>([]);
const countiesLoading = ref(true);

const visibleConfirmChangeShipmentOwner = ref(false);

const initialValues = {
  // Sender
  senderContactName: '',
  senderCountry: '',
  // sender_full_address: '',
  senderEmail: '',
  senderPhoneNumber: '',
  // Receiver
  receiverContactName: '',
  receiverCountry: '',
  // receiver_full_address: '',
  receiverEmail: '',
  receiverPhoneNumber: '',
  // Package Owner
  shipperFullName: '',
  shipperOriginPhoneNumber: '',
  shipperDestinationPhoneNumber: '',
  shipperEmail: '',
}

const resolver = ref(zodResolver(
  z.object({
    // Sender
    senderContactName: z.string().min(1, { message: 'Full name is required.' }),
    senderCountry: z.any().optional(),
    // originAddress: z.string().min(1, { message: 'Full address is required.' }),
    senderEmail: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
    senderPhoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
    // Receiver
    receiverContactName: z.string().min(1, { message: 'Full name is required.' }),
    receiverCountry: z.any().optional(),
    receiverEmail: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
    receiverPhoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
    // Package Owner
    shipperFullName: z.string().min(1, { message: 'Owner name is required.' }),
    shipperOriginPhoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
    shipperDestinationPhoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
    shipperEmail: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
  })
));

// Customer Information
const origin = ref<any | {}>({})
const originAddress = ref("")
const destination = ref<any | {}>({})
const destinationAddress = ref("")

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

const fetchCountries = async () => {
  try {
    const res = await $fetch(`/api/order-hub/countries`, {
      method: "GET",
      credentials: 'include', // Required
    })
    countries.value = res.map((c: string) => ({ name: wordCapital(c, "_").replaceAll("_", " ") as string, code: c as string })); // Array of country
    countiesLoading.value = false;
  } catch (err) {
    console.error('fetch countries error:', err);
    countiesLoading.value = false;
  }
}

const handleSubmit = async ({ values, valid }: { values: any, valid: boolean }) => {

  if (!valid || submitLoading.value) return;

  viewMode.value = 'success';

  errorSubmit.value = ''
  submitLoading.value = true

  const payload = {
    ...values,
    bookingCode: bookingCode,
    receiverSameAsSender: isReceiverSameAsSender.value,
    senderSameAsShipper: shipmentOwnerInformationSameAs.value === "sender"

    // "senderProvince": "Perak",
    // "senderCity": "Kamunting",
    // "senderFullAddress": "Jalan Sarawak, Taman Rakyat, Kamunting, Perak, Malaysia",
    // "senderPostalCode": "34600",
    // "senderAddressGeocode": obj

    // "receiverProvince": "Jakarta",
    // "receiverCity": "South Jakarta City",
    // "receiverFullAddress": "RT 10 RW 07, Srengseng Sawah, Jagakarsa, South Jakarta City, Jakarta, Indonesia",
    // "receiverPostalCode": "12640",
    // "receiverAddressGeocode": obj
  }

  console.log('values', values);
  console.log('payload', payload);
  console.log("originAddress", originAddress.value);
  console.log("destinationAddress", destinationAddress.value);
  submitLoading.value = false
  return;

  try {
    const res = await $fetch('/order-hub/customer-information', {
      method: 'POST',
      body: payload,
      credentials: 'include', // Required
    })

    // Store state
    // userState.value = res.user

    viewMode.value = 'success';

  } catch (err: any) {
    errorSubmit.value =
      err?.data?.message || 'Error submit customer information'
  } finally {
    submitLoading.value = false
  }
};

const handleOnChangeIsReceiverSameAsSender = ($form: any) => {
  $form.receiverContactName.value = isReceiverSameAsSender.value ? $form.senderContactName.value : "";
  $form.receiverCountry.value = isReceiverSameAsSender.value ? $form.senderCountry.value : "";
  // Todo: Full Address
  $form.receiverEmail.value = isReceiverSameAsSender.value ? $form.senderEmail.value : "";
  $form.receiverPhoneNumber.value = isReceiverSameAsSender.value ? $form.senderPhoneNumber.value : "";
}

const handleOnClickSameAs = (sameAs: "sender" | "receiver", $form: any) => {
  if (shipmentOwnerInformationSameAs.value === "") {
    fillShipmentOwner(sameAs, $form);
  } else {
    if (shipmentOwnerInformationSameAs.value === sameAs) return;
    formRef.value = $form;
    showConfirmChangeShipmentOwner();
    pendingShipmentOwnerSameAs.value = sameAs;
  }
}

/**
 * Popup: Cancel Button Handler
 */
const handleOnCancelChangeShipmentOwner = () => {
  pendingShipmentOwnerSameAs.value = null;
  visibleConfirmChangeShipmentOwner.value = false;
}

/**
 * Popup: OK Button Handler
 */
const handleOnOkChangeShipmentOwner = () => {
  if (!pendingShipmentOwnerSameAs.value || !formRef.value) return;
  fillShipmentOwner(pendingShipmentOwnerSameAs.value, formRef.value)
  pendingShipmentOwnerSameAs.value = null
  visibleConfirmChangeShipmentOwner.value = false
}

/**
 * Popup: Show popup
 */
const showConfirmChangeShipmentOwner = () => visibleConfirmChangeShipmentOwner.value = true;

/**
 * Fill shipment / package owner
 * @param sameAs 
 * @param $form 
 */
const fillShipmentOwner = (sameAs: "sender" | "receiver", $form: any) => {
  if (sameAs === "sender") fillShipmentOwnerFromSender($form);
  if (sameAs === "receiver") fillShipmentOwnerFromReceiver($form);
}

/**
 * Implementation Fill shipment / package owner from sender
 * @param $form 
 */
const fillShipmentOwnerFromSender = ($form: any) => {
  $form.shipperFullName.value = $form.senderContactName.value;
  $form.shipperEmail.value = $form.senderEmail.value;
  $form.shipperOriginPhoneNumber.value = $form.senderPhoneNumber.value;
  $form.shipperDestinationPhoneNumber.value = $form.senderPhoneNumber.value;
  shipmentOwnerInformationSameAs.value = 'sender';
}

/**
 * Implementation Fill shipment / package owner from receiver
 * @param $form 
 */

const fillShipmentOwnerFromReceiver = ($form: any) => {
  $form.shipperFullName.value = $form.receiverContactName.value;
  $form.shipperEmail.value = $form.receiverEmail.value;
  $form.shipperOriginPhoneNumber.value = $form.receiverPhoneNumber.value;
  $form.shipperDestinationPhoneNumber.value = $form.receiverPhoneNumber.value;
  shipmentOwnerInformationSameAs.value = 'receiver';
}

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
  fetchCountries();
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
          title="CUSTOMER INFORMATION"
          description="Please provide customer information details. This information will be used for shipping updates and verification purposes."
          :packingListCode="packingListCode"
        />

        <!-- Form (only render after data is loaded) -->
        <!-- :key="JSON.stringify(initialValues)" -->
        <Form
          v-if="formReady"
          class="flex flex-col gap-6"
          v-slot="$form"
          :resolver="resolver"
          :initialValues="initialValues"
          validateOnBlur
          @submit="handleSubmit"
        >
          <div
            class="flex flex-col gap-6 pb-6 bg-neutral-10 rounded-[12px] border border-[#EDEDED]"
          >
            <!-- Sender & Receiver Title -->
            <div
              class="flex items-center p-6 gap-6 bg-neutral-20 rounded-tl-[12px] rounded-tr-[12px]"
            >
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <div
                  class="h-[42px] w-[42px] bg-white rounded-full flex items-center justify-center"
                >
                  <IconArrowUpCircle height="18" width="18" />
                </div>
                <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
=======
        <FormHeader title="CUSTOMER INFORMATION"
          description="Please provide customer information details. This information will be used for shipping updates and verification purposes."
          :packingListCode="packingListCode" />

        <Form class="flex flex-col gap-6" v-slot="$form" :resolver="resolver" :initialValues="initialValues"
          validateOnBlur @submit="handleSubmit">

          <div class="flex flex-col gap-6 pb-6 bg-[#FAFAFC] rounded-[12px] border border-[#EDEDED]">

            <!-- Sender & Receiver Title -->
            <div class="flex items-center p-6 gap-6 bg-[#F6F6FA] rounded-tl-[12px] rounded-tr-[12px]">
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <div class="h-[42px] w-[42px] bg-white rounded-full flex items-center justify-center">
                  <IconArrowUpCircle height="18" width="18" />
                </div>
                <div class="text-[20px] leading-[130%] font-medium text-[#404040]">
>>>>>>> Refactor page structure; Page customer infor and item & packages
                  Sender Details
                </div>
              </div>
              <!-- Receiver Details -->
              <div class="flex-1 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
<<<<<<< HEAD
                  <div
                    class="h-[42px] w-[42px] bg-white rounded-full flex items-center justify-center"
                  >
                    <IconArrowDownCircle height="32" width="32" />
                  </div>
                  <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
                    Receiver Details
                  </div>
                </div>
                <div
                  class="flex items-center gap-2 py-1 px-3 rounded-full"
                  :class="
                    isReceiverSameAsSender
                      ? 'bg-primary text-neutral-100'
                      : 'bg-white !text-neutral-70'
                  "
                >
                  <ToggleSwitch
                    v-model="isReceiverSameAsSender"
                    @change="handleOnChangeIsReceiverSameAsSender($form)"
                  />
                  Same as Sender
=======
                  <div class="h-[42px] w-[42px] bg-white rounded-full flex items-center justify-center">
                    <IconArrowDownCircle height="32" width="32" />
                  </div>
                  <div class="text-[20px] leading-[130%] font-medium text-[#404040]">
                    Receiver Details
                  </div>
                </div>
                <div class="flex items-center gap-2 py-1 px-3 rounded-full"
                  :class="isReceiverSameAsSender ? 'bg-[#C1FF00] text-[#1E1E1E]' : 'bg-white text-[#757575]'">
                  <ToggleSwitch v-model="isReceiverSameAsSender"
                    @change="handleOnChangeIsReceiverSameAsSender($form)" />
                  Same as
                  Sender
>>>>>>> Refactor page structure; Page customer infor and item & packages
                </div>
              </div>
            </div>

            <!-- Sender & Receiver Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
              <!-- Sender -->
              <div class="flex flex-col gap-6">
                <!-- Sender Full Name -->
<<<<<<< HEAD
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Sender Full Name</label>
                  <div class="relative">
                    <InputText
                      nostyle
                      name="senderContactName"
                      type="text"
                      placeholder="e.g. Dzulfan"
                      class="w-full pr-12"
                    />
                    <InputIcon
                      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
                    >
                      <IconUser />
                    </InputIcon>
                  </div>
                  <Message
                    v-if="$form.senderContactName?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.senderContactName.error?.message }}</Message
                  >
                </div>
                <!-- Sender Country -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Sender Country</label>
                  <div class="relative">
                    <!-- <InputText unsstyled name="senderCountry" type="text" placeholder="Enter Sender Origin Country"
                  class="w-full pr-12" /> -->
                    <Select
                      name="senderCountry"
                      :options="countries"
                      optionLabel="name"
                      dataKey="code"
                      placeholder="Select sender country"
                      fluid
                    />
                    <!-- <InputIcon class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]">
                  <IconChevronDown />
                </InputIcon> -->
                  </div>
                  <Message
                    v-if="$form.senderCountry?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.senderCountry.error?.message }}</Message
                  >
                </div>
                <!-- Sender Full Address -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Sender Full Address</label>
                  <ClientOnly>
                    <GoogleAddressInput
                      name="senderFullAddress"
                      v-model="originAddress"
                      :country="$form.senderCountry?.value?.iso"
                      placeholder="Sender full address"
                      @select="
                        (geo) => {
                          handleOriginSelect(geo);
                          if ($form?.senderFullAddress) $form.senderFullAddress.value = geo.address;
                        }
                      "
                    />
                  </ClientOnly>
                  <Message
                    v-if="$form.senderFullAddress?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.senderFullAddress.error?.message }}</Message
                  >
                </div>
                <!-- Sender Email Address -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Sender Email Address</label>
                  <div class="relative">
                    <InputText
                      name="senderEmail"
                      type="email"
                      placeholder="e.g. dzulfan@example.com"
                      class="w-full pr-12"
                    />
                    <InputIcon
                      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
                    >
                      <IconEmail />
                    </InputIcon>
                  </div>
                  <Message
                    v-if="$form.senderEmail?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.senderEmail.error?.message }}</Message
                  >
                </div>
                <!-- Sender Phone Number -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Sender Phone Number</label>
                  <div class="relative">
                    <InputIcon
                      class="absolute !top-[1px] !mt-0 h-[44px] left-[1px] flex items-center justify-center py-3 w-[51px] bg-neutral-20 !text-neutral-70 rounded-tl-[5px] rounded-bl-[5px]"
                    >
                      +62
                    </InputIcon>
                    <InputText
                      name="senderPhoneNumber"
                      type="phone"
                      placeholder="Enter phone number"
                      class="w-full !pl-[67px]"
                    />
                  </div>
                  <Message
                    v-if="$form.senderPhoneNumber?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.senderPhoneNumber.error?.message }}</Message
                  >
=======
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Sender Full Name</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputText name="senderContactName" type="text" placeholder="e.g. Dzulfan Fadli"
                      class="w-full pr-12" />
                    <InputIcon class="absolute top-5 right-4">
                      <IconUser />
                    </InputIcon>
                  </div>
                  <Message v-if="$form.senderContactName?.invalid" severity="error" size="small" variant="simple">{{
                    $form.senderContactName.error?.message }}</Message>
                </div>
                <!-- Sender Country -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Sender Country</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <!-- <InputText unsstyled name="senderCountry" type="text" placeholder="Enter Sender Origin Country"
                  class="w-full pr-12" /> -->
                    <Select name="senderCountry" :options="countries" optionLabel="name"
                      placeholder="Select sender country" fluid />
                    <!-- <InputIcon class="absolute top-5 right-4">
                  <IconChevronDown />
                </InputIcon> -->
                  </div>
                  <Message v-if="$form.senderCountry?.invalid" severity="error" size="small" variant="simple">{{
                    $form.senderCountry.error?.message }}</Message>
                </div>
                <!-- Sender Full Address -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Sender Full Address</label>
                  <ClientOnly>
                    <!-- @select="handleOriginSelect" -->
                    <GoogleAddressInput name="senderFullAddress" v-model="originAddress"
                      placeholder="Sender full address" />
                  </ClientOnly>
                  <Message v-if="$form.senderFullAddress?.invalid" severity="error" size="small" variant="simple">{{
                    $form.senderFullAddress.error?.message }}</Message>
                </div>
                <!-- Sender Email Address -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Sender Email Address</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputText name="senderEmail" type="email" placeholder="e.g. dzulfan@example.com"
                      class="w-full pr-12" />
                    <InputIcon class="absolute top-5 right-4">
                      <IconEmail />
                    </InputIcon>
                  </div>
                  <Message v-if="$form.senderEmail?.invalid" severity="error" size="small" variant="simple">{{
                    $form.senderEmail.error?.message }}</Message>
                </div>
                <!-- Sender Phone Number -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Sender Phone Number</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputIcon
                      class="absolute top-[9px] h-[44px] left-[2px] flex items-center justify-center py-3 w-[51px] bg-[#F6F6FA] text-[#757575] rounded-tl-[8px] rounded-bl-[8px]">
                      +62
                    </InputIcon>
                    <InputText name="senderPhoneNumber" type="phone" placeholder="Enter phone number"
                      class="w-full pl-[67px]" />
                  </div>
                  <Message v-if="$form.senderPhoneNumber?.invalid" severity="error" size="small" variant="simple">{{
                    $form.senderPhoneNumber.error?.message }}</Message>
>>>>>>> Refactor page structure; Page customer infor and item & packages
                </div>
              </div>

              <!-- Receiver -->
              <div class="flex flex-col gap-6">
                <!-- Receiver Full Name -->
<<<<<<< HEAD
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Receiver Full Name</label>
                  <div class="relative">
                    <InputText
                      name="receiverContactName"
                      type="text"
                      placeholder="e.g. Dzulfan"
                      class="w-full pr-12"
                    />
                    <InputIcon
                      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
                    >
                      <IconUser />
                    </InputIcon>
                  </div>
                  <Message
                    v-if="$form.receiverContactName?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.receiverContactName.error?.message }}</Message
                  >
                </div>
                <!-- Receiver Country -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Receiver Country</label>
                  <div class="relative">
                    <!-- <InputText name="receiverCountry" type="text" placeholder="Enter Receiver Origin Country"
                  class="w-full pr-12" />
                <InputIcon class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]">
                  <IconChevronDown />
                </InputIcon> -->
                    <Select
                      name="receiverCountry"
                      :options="countries"
                      dataKey="code"
                      optionLabel="name"
                      placeholder="Select receiver country"
                      fluid
                    />
                  </div>
                  <Message
                    v-if="$form.receiverCountry?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.receiverCountry.error?.message }}</Message
                  >
                </div>
                <!-- Receiver Full Address -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Receiver Full Address</label>
                  <ClientOnly>
                    <GoogleAddressInput
                      name="receiverFullAddress"
                      v-model="destinationAddress"
                      :country="$form.receiverCountry?.value?.iso"
                      placeholder="Receiver full address"
                      @select="
                        (geo) => {
                          handleDestinationSelect(geo);
                          if ($form?.receiverFullAddress)
                            $form.receiverFullAddress.value = geo.address;
                        }
                      "
                    />
                  </ClientOnly>
                  <Message
                    v-if="$form.receiverFullAddress?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.receiverFullAddress.error?.message }}</Message
                  >
                </div>
                <!-- Receiver Email Address -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Receiver Email Address</label>
                  <div class="relative">
                    <InputText
                      name="receiverEmail"
                      type="email"
                      placeholder="e.g. dzulfan@example.com"
                      class="w-full pr-12"
                    />
                    <InputIcon
                      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
                    >
                      <IconEmail />
                    </InputIcon>
                  </div>
                  <Message
                    v-if="$form.receiverEmail?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.receiverEmail.error?.message }}</Message
                  >
                </div>
                <!-- Receiver Phone Number -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Receiver Phone Number</label>
                  <div class="relative">
                    <InputIcon
                      class="absolute !top-[1px] !mt-0 h-[44px] left-[1px] flex items-center justify-center py-3 w-[51px] bg-neutral-20 !text-neutral-70 rounded-tl-[5px] rounded-bl-[5px]"
                    >
                      +62
                    </InputIcon>
                    <InputText
                      name="receiverPhoneNumber"
                      type="phone"
                      placeholder="Enter phone number"
                      class="w-full !pl-[67px]"
                    />
                  </div>
                  <Message
                    v-if="$form.receiverPhoneNumber?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                  >
                    {{ $form.receiverPhoneNumber.error?.message }}</Message
                  >
=======
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Receiver Full Name</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputText name="receiverContactName" type="text" placeholder="e.g. Dzulfan Fadli"
                      class="w-full pr-12" />
                    <InputIcon class="absolute top-5 right-4">
                      <IconUser />
                    </InputIcon>
                  </div>
                  <Message v-if="$form.receiverContactName?.invalid" severity="error" size="small" variant="simple">{{
                    $form.receiverContactName.error?.message }}</Message>
                </div>
                <!-- Receiver Country -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Receiver Country</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <!-- <InputText name="receiverCountry" type="text" placeholder="Enter Receiver Origin Country"
                  class="w-full pr-12" />
                <InputIcon class="absolute top-5 right-4">
                  <IconChevronDown />
                </InputIcon> -->
                    <Select name="receiverCountry" :options="countries" optionLabel="name"
                      placeholder="Select receiver country" fluid />
                  </div>
                  <Message v-if="$form.receiverCountry?.invalid" severity="error" size="small" variant="simple">{{
                    $form.receiverCountry.error?.message }}</Message>
                </div>
                <!-- Receiver Full Address -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Receiver Full Address</label>
                  <ClientOnly>
                    <!-- @select="handleDestinationSelect" -->
                    <GoogleAddressInput name="receiverFullAddress" v-model="destinationAddress"
                      placeholder="Receiver full address" />
                  </ClientOnly>
                  <Message v-if="$form.receiverFullAddress?.invalid" severity="error" size="small" variant="simple">{{
                    $form.receiverFullAddress.error?.message }}</Message>
                </div>
                <!-- Receiver Email Address -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Receiver Email Address</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputText name="receiverEmail" type="email" placeholder="e.g. dzulfan@example.com"
                      class="w-full pr-12" />
                    <InputIcon class="absolute top-5 right-4">
                      <IconEmail />
                    </InputIcon>
                  </div>
                  <Message v-if="$form.receiverEmail?.invalid" severity="error" size="small" variant="simple">{{
                    $form.receiverEmail.error?.message }}</Message>
                </div>
                <!-- Receiver Phone Number -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Receiver Phone Number</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputIcon
                      class="absolute top-[9px] h-[44px] left-[2px] flex items-center justify-center py-3 w-[51px] bg-[#F6F6FA] text-[#757575] rounded-tl-[8px] rounded-bl-[8px]">
                      +62
                    </InputIcon>
                    <InputText name="receiverPhoneNumber" type="phone" placeholder="Enter phone number"
                      class="w-full pl-[67px]" />
                  </div>
                  <Message v-if="$form.receiverPhoneNumber?.invalid" severity="error" size="small" variant="simple">
                    {{
                      $form.receiverPhoneNumber.error?.message }}</Message>
>>>>>>> Refactor page structure; Page customer infor and item & packages
                </div>
              </div>
            </div>

            <!-- Shipment Owner Information Title -->
<<<<<<< HEAD
            <div class="flex items-center px-6 py-4 bg-neutral-20">
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <IconShipmentOwnerInformation />
                <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
=======
            <div class="flex items-center px-6 py-4 bg-[#F6F6FA]">
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <IconShipmentOwnerInformation />
                <div class="text-[20px] leading-[130%] font-medium text-[#404040]">
>>>>>>> Refactor page structure; Page customer infor and item & packages
                  Shipment Owner Information
                </div>
              </div>
            </div>

            <!-- Shipment Owner Information Body -->
            <div class="flex flex-col px-6 gap-6">
<<<<<<< HEAD
              <div class="flex items-center justify-between px-6 py-4 bg-neutral-20 w-full">
                <!-- Sender Details -->
                <div class="flex flex-col gap-2">
                  <div class="flex-1 flex items-center gap-2">
                    <IconQuickFill />
                    <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
                      Quick Fill
                    </div>
                  </div>
                  <p class="text-[14px] leading-[22px] spacing-[0%] font-[400] text-neutral-60">
=======
              <div class="flex items-center justify-between px-6 py-4 bg-[#F6F6FA] w-full">
                <!-- Sender Details -->
                <div class="flex flex-col gap-2">
                  <div class="flex-1 flex items-center gap-2">
                    <IconShipmentOwnerInformation />
                    <div class="text-[20px] leading-[130%] font-medium text-[#404040]">
                      Quick Fill
                    </div>
                  </div>
                  <p class="text-[14px] leading-[22px] spacing-[0%] font-[400] text-[#9E9E9E]">
>>>>>>> Refactor page structure; Page customer infor and item & packages
                    Pre-fill Information from Sender or Receiver details to save time.
                  </p>
                </div>
                <div class="flex gap-2">
<<<<<<< HEAD
                  <OutlinedButton
                    type="button"
                    :primaryWhenHover="true"
                    class="w-[169px]"
                    :active="shipmentOwnerInformationSameAs === 'sender'"
                    @click="handleOnClickSameAs('sender', $form)"
                  >
                    <IconArrowUpCircleSmall />
                    Same as Sender
                  </OutlinedButton>
                  <OutlinedButton
                    type="button"
                    :primaryWhenHover="true"
                    class="w-[169px]"
                    :active="shipmentOwnerInformationSameAs === 'receiver'"
                    @click="handleOnClickSameAs('receiver', $form)"
                  >
=======
                  <OutlinedButton type="button" :primaryWhenHover="true" class="w-[169px]"
                    :active="shipmentOwnerInformationSameAs === 'sender'" @click="handleOnClickSameAs('sender', $form)">
                    <IconArrowUpCircleSmall />
                    Same as Sender
                  </OutlinedButton>
                  <OutlinedButton type="button" :primaryWhenHover="true" class="w-[169px]"
                    :active="shipmentOwnerInformationSameAs === 'receiver'"
                    @click="handleOnClickSameAs('receiver', $form)">
>>>>>>> Refactor page structure; Page customer infor and item & packages
                    <IconArrowDownCircleSmall />
                    Same as Receiver
                  </OutlinedButton>
                </div>
              </div>

              <!-- Shipment Owner Information Body -->
              <div class="flex flex-col gap-6">
                <!-- Package Owner Name -->
<<<<<<< HEAD
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Package Owner Name</label>
                  <div class="relative">
                    <InputText
                      name="shipperFullName"
                      type="text"
                      placeholder="e.g. Dzulfan"
                      class="w-full pr-12"
                    />
                    <InputIcon
                      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
                    >
                      <IconUser />
                    </InputIcon>
                  </div>
                  <Message
                    v-if="$form.shipperFullName?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.shipperFullName.error?.message }}</Message
                  >
=======
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Package Owner Name</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputText name="shipperFullName" type="text" placeholder="e.g. Dzulfan Fadli"
                      class="w-full pr-12" />
                    <InputIcon class="absolute top-5 right-4">
                      <IconUser />
                    </InputIcon>
                  </div>
                  <Message v-if="$form.shipperFullName?.invalid" severity="error" size="small" variant="simple">{{
                    $form.shipperFullName.error?.message }}</Message>
>>>>>>> Refactor page structure; Page customer infor and item & packages
                </div>
                <!-- Package Phone Number -->
                <div class="flex gap-6">
                  <!-- Origin -->
<<<<<<< HEAD
                  <div class="flex-1 relative flex flex-col gap-[6px]">
                    <label class="font-medium text-neutral-90"
                      >Active International Phone Number [Origin]</label
                    >
                    <div class="relative">
                      <InputIcon
                        class="absolute !top-[1px] !mt-0 h-[44px] left-[1px] flex items-center justify-center py-3 w-[51px] bg-neutral-20 !text-neutral-70 rounded-tl-[5px] rounded-bl-[5px]"
                      >
                        +62
                      </InputIcon>
                      <InputText
                        name="shipperOriginPhoneNumber"
                        type="phone"
                        placeholder="Enter phone number"
                        class="w-full !pl-[67px]"
                      />
                    </div>
                    <Message
                      v-if="$form.shipperOriginPhoneNumber?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                    >
                      {{ $form.shipperOriginPhoneNumber.error?.message }}</Message
                    >
                  </div>
                  <!-- Destination -->
                  <div class="flex-1 relative flex flex-col gap-[6px]">
                    <label class="font-medium text-neutral-90"
                      >Active International Phone Number [Destination]</label
                    >
                    <div class="relative">
                      <InputIcon
                        class="absolute !top-[1px] !mt-0 h-[44px] left-[1px] flex items-center justify-center py-3 w-[51px] bg-neutral-20 !text-neutral-70 rounded-tl-[5px] rounded-bl-[5px]"
                      >
                        +62
                      </InputIcon>
                      <InputText
                        name="shipperDestinationPhoneNumber"
                        type="phone"
                        placeholder="Enter phone number"
                        class="w-full !pl-[67px]"
                      />
                    </div>
                    <Message
                      v-if="$form.shipperDestinationPhoneNumber?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ $form.shipperDestinationPhoneNumber.error?.message }}</Message
                    >
=======
                  <div class="flex-1 flex flex-col gap-[6px]">
                    <label class="font-medium text-[#404040]">Active International Phone Number [Origin]</label>
                    <div class="relative rounded-[8px] border border-[#EDEDED]">
                      <InputIcon
                        class="absolute top-[9px] h-[44px] left-[2px] flex items-center justify-center py-3 w-[51px] bg-[#F6F6FA] text-[#757575] rounded-tl-[8px] rounded-bl-[8px]">
                        +62
                      </InputIcon>
                      <InputText name="shipperOriginPhoneNumber" type="phone" placeholder="Enter phone number"
                        class="w-full pl-[67px]" />
                    </div>
                    <Message v-if="$form.shipperOriginPhoneNumber?.invalid" severity="error" size="small"
                      variant="simple">
                      {{
                        $form.shipperOriginPhoneNumber.error?.message }}</Message>
                  </div>
                  <!-- Destination -->
                  <div class="flex-1 flex flex-col gap-[6px]">
                    <label class="font-medium text-[#404040]">Active International Phone Number [Destination]</label>
                    <div class="relative rounded-[8px] border border-[#EDEDED]">
                      <InputIcon
                        class="absolute top-[9px] h-[44px] left-[2px] flex items-center justify-center py-3 w-[51px] bg-[#F6F6FA] text-[#757575] rounded-tl-[8px] rounded-bl-[8px]">
                        +62
                      </InputIcon>
                      <InputText name="shipperDestinationPhoneNumber" type="phone" placeholder="Enter phone number"
                        class="w-full pl-[67px]" />
                    </div>
                    <Message v-if="$form.shipperDestinationPhoneNumber?.invalid" severity="error" size="small"
                      variant="simple">{{
                        $form.shipperDestinationPhoneNumber.error?.message }}</Message>
>>>>>>> Refactor page structure; Page customer infor and item & packages
                  </div>
                </div>

                <!-- Package Owner Email Address -->
<<<<<<< HEAD
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Package Owner Email Address</label>
                  <div class="relative">
                    <InputText
                      name="shipperEmail"
                      type="email"
                      placeholder="e.g. dzulfan@example.com"
                      class="w-full pr-12"
                    />
                    <InputIcon
                      class="absolute h-[44px] !top-[1px] !mt-0 right-[1px] flex items-center justify-center py-3 w-[51px]"
                    >
                      <IconEmail />
                    </InputIcon>
                  </div>
                  <Message
                    v-if="$form.shipperEmail?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.shipperEmail.error?.message }}</Message
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="navigateToOrderHub">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!-- @click="actionForm = ''" -->
              <TextButton
                @click="showPopupFinishLater"
                :disabled="submitLoading || bookingProgressLoading"
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
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-[#404040]">Package Owner Email Address</label>
                  <div class="relative rounded-[8px] border border-[#EDEDED]">
                    <InputText name="shipperEmail" type="email" placeholder="e.g. dzulfan@example.com"
                      class="w-full pr-12" />
                    <InputIcon class="absolute top-5 right-4">
                      <IconEmail />
                    </InputIcon>
                  </div>
                  <Message v-if="$form.shipperEmail?.invalid" severity="error" size="small" variant="simple">{{
                    $form.shipperEmail.error?.message }}</Message>
                </div>
              </div>
            </div>

          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
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
          <!-- Confirm Change Shipment Owner -->
          <BasePopup
            v-model:visible="visibleConfirmChangeShipmentOwner"
            :icon="IconAlertCircle"
            title="Change Information"
            :description="`Are you sure you want to replace all information with ${firstCapital(pendingShipmentOwnerSameAs as string)} Information?`"
            @cancel="handleOnCancelChangeShipmentOwner"
            @ok="handleOnOkChangeShipmentOwner"
          />

          <!-- Confirm Save Later -->
          <BasePopup
            v-model:visible="visibleConfirmSaveLater"
            :icon="IconSaveProgress"
            title="Your progress will be saved"
            :description="`Finish later will automatically save your progress in \ncustomer information.\nYou can comeback later to complete the form.`"
            @cancel="closePopupFinishLater"
            @ok="handleFinishLater($form)"
            :okLoading="finishLaterLoading"
          />
        </Form>
      </section>
    </template>

    <template v-if="viewMode === 'success'">
      <UISuccessSubmitFormStepOrderHub
        :step="currentStep"
        :response="submittedResponse"
        @go-to-order-hub="navigateToOrderHub"
      />
    </template>
  </section>
</template>
=======
        </Form>

        <BasePopup v-model:visible="visibleConfirmChangeShipmentOwner" :icon="IconAlertCircle"
          title="Change Information"
          :description="`Are you sure you want to replace all information with ${firstCapital(pendingShipmentOwnerSameAs as string)} Information?`"
          @cancel="handleOnCancelChangeShipmentOwner" @ok="handleOnOkChangeShipmentOwner" />

      </section>
    </template>

    <template v-else>
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

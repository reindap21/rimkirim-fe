<script setup lang="ts">
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import { ref } from "vue";
  import { z } from "zod";
  import IconAlertCircle from "~/components/icons/IconAlertCircle.vue";
  import IconSaveProgress from "~/components/icons/IconSaveProgress.vue";
  import type { AddressGeocode, CustomerInformationPayload, OrderHubStep } from "~/types/order-hub";
  import { hasValidGeocode } from "~/utils/address";

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  interface CustomerInformationFormValues {
    senderContactName: string;
    senderCountry: { name: string; code: string } | null;
    senderFullAddress: string;
    senderEmail: string;
    senderPhoneNumber: string;
    receiverContactName: string;
    receiverCountry: { name: string; code: string } | null;
    receiverFullAddress: string;
    receiverEmail: string;
    receiverPhoneNumber: string;
    shipperFullName: string;
    shipperOriginPhoneNumber: string;
    shipperDestinationPhoneNumber: string;
    shipperEmail: string;
  }

  // * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

  definePageMeta({
    layout: "order-hub",
    // middleware: 'auth'
  });

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const { bookingCode, packingListCode, navigateToOrderHub, fetchProgress } = useOrderHub(); // other vars: purposeOfShipment

  const { user, loading } = useAuth();

  const viewMode = ref<"form" | "success">("form");
  const dataLoading = ref(true); // Add loading state
  const formReady = ref(false);

  const currentStep: OrderHubStep = "customer_information";

  const submittedResponse = ref<any>(); // eslint-disable-line

  // * ------- Form Handling

  const formRef = ref<any>(null);
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

  type CustomerInformationHydration = Partial<typeof initialValues>;

  const resolver = zodResolver(
    z.object({
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
      // Package Owner
      shipperFullName: z.string().min(1, { message: "Owner name is required." }),
      shipperOriginPhoneNumber: z.string().min(1, { message: "Phone number is required." }),
      shipperDestinationPhoneNumber: z.string().min(1, { message: "Phone number is required." }),
      shipperEmail: z
        .string()
        .min(1, { message: "Email is required." })
        .email({ message: "Invalid email address." }),
    }),
  );

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

  const handleOnChangeIsReceiverSameAsSender = ($form: any) => {
    if (isReceiverSameAsSender.value) {
      // Copy all sender data to receiver
      $form.receiverContactName.value = $form.senderContactName.value;
      $form.receiverCountry.value = $form.senderCountry.value;
      destinationAddress.value = originAddress.value;
      destination.value = { ...origin.value };
      $form.receiverEmail.value = $form.senderEmail.value;
      $form.receiverPhoneNumber.value = $form.senderPhoneNumber.value;
    }
    // else {
    //   // Clear all receiver fields
    //   $form.receiverContactName.value = ""
    //   $form.receiverCountry.value = ""
    //   destinationAddress.value = ""
    //   destination.value = {}
    //   $form.receiverEmail.value = ""
    //   $form.receiverPhoneNumber.value = ""
    // }
  };

  const handleOnClickSameAs = (sameAs: "sender" | "receiver", $form: any) => {
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
  const fillShipmentOwner = (sameAs: "sender" | "receiver", $form: any) => {
    if (sameAs === "sender") fillShipmentOwnerFromSender($form);
    if (sameAs === "receiver") fillShipmentOwnerFromReceiver($form);
  };

  /**
   * Implementation Fill shipment / package owner from sender
   * @param $form
   */
  const fillShipmentOwnerFromSender = ($form: any) => {
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

  const fillShipmentOwnerFromReceiver = ($form: any) => {
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
  const handleFinishLater = async ($form: any) => {
    if (finishLaterLoading.value) return;

    finishLaterLoading.value = true;
    errorSubmit.value = "";

    const payload: Partial<CustomerInformationPayload> = {
      bookingCode: bookingCode.value,

      // sender
      senderContactName: $form?.senderContactName.value,
      senderEmail: $form?.senderEmail.value,
      senderPhoneNumber: $form?.senderPhoneNumber.value,
      senderCountry: $form?.senderCountry?.code,
      senderFullAddress: originAddress.value ?? null,
      senderAddressGeocode: hasValidGeocode(origin.value) ? toRaw(origin.value) : null,

      // receiver
      receiverContactName: $form?.receiverContactName.value,
      receiverEmail: $form?.receiverEmail.value,
      receiverPhoneNumber: $form?.receiverPhoneNumber.value,
      receiverCountry: $form?.receiverCountry?.code,
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
  const handleSubmit = async ({ values, valid }: { values: any; valid: boolean }) => {
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
      senderCountry: values.senderCountry.code,
      senderFullAddress: originAddress.value,
      senderProvince: origin.value?.province || "",
      senderCity: origin.value?.city || "",
      senderPostalCode: origin.value?.postal_code || "",
      senderAddressGeocode: toRaw(origin.value),

      // ---- Receiver
      receiverContactName: values.receiverContactName,
      receiverEmail: values.receiverEmail,
      receiverPhoneNumber: values.receiverPhoneNumber,
      receiverCountry: values.receiverCountry.code,
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
                  Sender Details
                </div>
              </div>
              <!-- Receiver Details -->
              <div class="flex-1 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
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
                </div>
              </div>
            </div>

            <!-- Sender & Receiver Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
              <!-- Sender -->
              <div class="flex flex-col gap-6">
                <!-- Sender Full Name -->
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                </div>
              </div>

              <!-- Receiver -->
              <div class="flex flex-col gap-6">
                <!-- Receiver Full Name -->
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                <div class="flex flex-col gap-[6px]">
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
                </div>
              </div>
            </div>

            <!-- Shipment Owner Information Title -->
            <div class="flex items-center px-6 py-4 bg-neutral-20">
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <IconShipmentOwnerInformation />
                <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
                  Shipment Owner Information
                </div>
              </div>
            </div>

            <!-- Shipment Owner Information Body -->
            <div class="flex flex-col px-6 gap-6">
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
                    Pre-fill Information from Sender or Receiver details to save time.
                  </p>
                </div>
                <div class="flex gap-2">
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
                    <IconArrowDownCircleSmall />
                    Same as Receiver
                  </OutlinedButton>
                </div>
              </div>

              <!-- Shipment Owner Information Body -->
              <div class="flex flex-col gap-6">
                <!-- Package Owner Name -->
                <div class="flex flex-col gap-[6px]">
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
                </div>
                <!-- Package Phone Number -->
                <div class="flex gap-6">
                  <!-- Origin -->
                  <div class="flex-1 flex flex-col gap-[6px]">
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
                  <div class="flex-1 flex flex-col gap-[6px]">
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
                  </div>
                </div>

                <!-- Package Owner Email Address -->
                <div class="flex flex-col gap-[6px]">
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
              <TextButton @click="showPopupFinishLater" :disabled="submitLoading">
                Finish Later
              </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton
                type="submit"
                class="w-[100px]"
                :loading="submitLoading"
                :disabled="finishLaterLoading"
              >
                Done
              </PrimaryButton>
            </div>
          </div>

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

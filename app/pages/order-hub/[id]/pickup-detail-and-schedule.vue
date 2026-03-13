<script setup lang="ts">
  import { zodResolver } from "@primevue/forms/resolvers/zod";
  import type Textarea from "primevue/textarea";
  import { ref } from "vue";
  import { z } from "zod";
  import type { AddressGeocode, OrderHubStep } from "~/types/order-hub";

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  // * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

  definePageMeta({
    layout: "order-hub",
    // middleware: 'auth'
  });

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  const { bookingCode, navigateToOrderHub } = useOrderHub(); // other vars: purposeOfShipment

  const viewMode = ref<"form" | "success">("form");

  const currentStep: OrderHubStep = "pickup_detail_schedule";

  const submittedResponse = ref<any>(); // eslint-disable-line

  const buildingTypeOptions = [
    {
      name: "House",
      code: "house",
    },
    {
      name: "Apartement / Flat",
      code: "apartement_of_flat",
    },
  ];

  // * ------- Form Handling

  const formRef = ref<unknown>(null);
  const submitLoading = ref(false);
  const errorSubmit = ref("");

  const initialValues = {};

  // Customer Information
  const _street = ref<Partial<AddressGeocode>>({});
  const streetAddress = ref("");

  const shipmentOwnerInformationSameAs = ref<"" | "sender" | "receiver">("");
  const pendingShipmentOwnerSameAs = ref<"sender" | "receiver" | null>(null);

  // const resolver = zodResolver(
  //   z
  //     .object({
  //       buildingType: z.any(),
  //       hasFreightElevator: z.string().optional(),
  //       hasReceptionist: z.string().optional(),
  //     })
  //     .superRefine((data, ctx) => {
  //       if (data.buildingType?.code === "apartement_of_flat") {
  //         if (!data.hasFreightElevator) {
  //           ctx.addIssue({
  //             path: ["hasFreightElevator"],
  //             message: "Please select elevator availability",
  //           });
  //         }

  //         if (!data.hasReceptionist) {
  //           ctx.addIssue({
  //             path: ["hasReceptionist"],
  //             message: "Please select receptionist availability",
  //           });
  //         }
  //       }
  //     }),
  // );

  const resolver = zodResolver(
    z
      .object({
        shipperFullName: z.string().min(1, "PIC for Pickup Name is required"),

        // ⬇️ JANGAN object ketat
        buildingType: z.any().refine((v) => !!v, "Building type is required"),

        streetAddress: z.string().min(1, "Street address is required"),

        notesForCourier: z.string().min(1, "Notes for courier is required"),

        shipperOriginPhoneNumber: z.string().min(1, "Phone number is required"),

        hasFreightElevator: z.string().optional(),
        hasReceptionist: z.string().optional(),

        // ⬇️ COERCE + NULL SAFE
        pickupDate: z.coerce.date({
          required_error: "Pickup date is required",
        }),

        pickupTime: z.string().min(1, "Pickup time is required"),
      })
      .superRefine((data, ctx) => {
        if (data.buildingType?.code === "apartement_of_flat") {
          if (!data.hasFreightElevator) {
            ctx.addIssue({
              path: ["hasFreightElevator"],
              message: "Please select elevator availability",
            });
          }

          if (!data.hasReceptionist) {
            ctx.addIssue({
              path: ["hasReceptionist"],
              message: "Please select receptionist availability",
            });
          }
        }
      }),
  );

  const selectedBuildingType = ref<{ code: string; name: string } | null>(null);

  const isApartment = computed(() => {
    return selectedBuildingType.value?.code === "apartement_of_flat";
  });

  const _pickupDate = ref<Date | null>(null);
  const pickupTime = ref<string | null>(null);

  const pickupTimeOptions = [
    { label: "10.00 - 14.00", value: "10-14" },
    { label: "11.00 - 15.00", value: "11-15" },
    { label: "12.00 - 16.00", value: "12-16" },
    { label: "13.00 - 17.00", value: "13-17" },
    { label: "14.00 - 18.00", value: "14-18" },
  ];

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  const handleOnClickSameAs = (sameAs: "sender" | "receiver", $form: unknown) => {
    if (shipmentOwnerInformationSameAs.value === "") {
      // fillShipmentOwner(sameAs, $form);
    } else {
      if (shipmentOwnerInformationSameAs.value === sameAs) return;
      formRef.value = $form;
      // showConfirmChangeShipmentOwner();
      pendingShipmentOwnerSameAs.value = sameAs;
    }
  };

  const handleSubmit = async ({ values, valid }: { values: Record<string, unknown>; valid: boolean }) => {
    if (!valid || submitLoading.value) return;

    viewMode.value = "success";

    errorSubmit.value = "";
    submitLoading.value = true;

    const payload = {
      ...values,
      bookingCode: bookingCode,
    };

    try {
      await $fetch("/order-hub/item-and-package", {
        method: "POST",
        body: payload,
        credentials: "include", // Required
      });

      // Store state
      // userState.value = res.user
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      errorSubmit.value = e?.data?.message || "Error submit item and packages";
    } finally {
      submitLoading.value = false;
    }
  };

  const handleFinishLater = () => {
    // actionForm.value = ""
  };

  // * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

  onMounted(() => {});

  // * ------- watchEffect
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
          title="PICKUP DETAILS & SCHEDULE"
          description="Please provide the exact location where courier should collect your items. Accurate details help ensure a smooth pickup process."
        />

        <Form
          v-slot="$form"
          class="flex flex-col gap-6"
          :resolver="resolver"
          :initial-values="initialValues"
          validate-on-blur
          @submit="handleSubmit"
        >
          <div v-if="formRef = $form" />

          <div
            class="flex flex-col gap-6 pb-6 bg-neutral-10 rounded-[12px] border border-[#EDEDED]"
          >
            <!-- Sender & Receiver Title -->
            <div
              class="flex items-center p-6 gap-6 bg-neutral-20 rounded-tl-[12px] rounded-tr-[12px]"
            >
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <div class="flex items-center justify-center">
                  <IconPickup42 />
                </div>
                <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
                  Pickup Details
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
                    Pre-fill Information from Sender or Owner details to save time.
                  </p>
                </div>
                <div class="flex gap-2">
                  <OutlinedButton
                    type="button"
                    :primary-when-hover="true"
                    class="w-[169px]"
                    :active="shipmentOwnerInformationSameAs === 'sender'"
                    @click="handleOnClickSameAs('sender', $form)"
                  >
                    <IconArrowUpCircleSmall />
                    Same as Sender
                  </OutlinedButton>
                  <OutlinedButton
                    type="button"
                    :primary-when-hover="true"
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
                <!-- PIC for Pickup Name -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">PIC for Pickup Name</label>
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

                <!-- Building Type -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Building Type</label>
                  <div class="relative">
                    <Select
                      name="buildingType"
                      :options="buildingTypeOptions"
                      data-key="code"
                      option-label="name"
                      placeholder="Select receiver country"
                      fluid
                      @change="(e) => (selectedBuildingType = e.value)"
                    />
                  </div>
                  <Message
                    v-if="$form.buildingType?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.buildingType.error?.message }}</Message
                  >

                  <!-- Apartment Only Fields -->
                  <div v-if="isApartment" class="flex flex-col gap-6 p-4 bg-neutral-20">
                    <!-- Freight Elevator -->
                    <div class="flex flex-col gap-2">
                      <div class="flex flex-col gap-1">
                        <label class="font-medium text-neutral-90">
                          Is there a freight elevator access?
                          <span class="text-red-500">*</span>
                        </label>
                        <p class="text-[12px] text-neutral-60">
                          Please inform us about the availability of a freight elevator for pickup
                          at the apartment / flat.
                        </p>
                      </div>

                      <div class="flex gap-6 mt-2">
                        <div class="flex items-center gap-2 cursor-pointer">
                          <RadioButton
                            name="hasFreightElevator"
                            input-id="freight_yes"
                            value="yes"
                          />
                          <label for="freight_yes">Yes</label>
                        </div>

                        <div class="flex items-center gap-2 cursor-pointer">
                          <RadioButton name="hasFreightElevator" input-id="freight_no" value="no" />
                          <label for="freight_no">No</label>
                        </div>
                      </div>

                      <Message
                        v-if="$form.hasFreightElevator?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                      >
                        {{ $form.hasFreightElevator.error?.message }}
                      </Message>
                    </div>

                    <!-- Receptionist -->
                    <div class="flex flex-col gap-2">
                      <div class="flex flex-col gap-1">
                        <label class="font-medium text-neutral-90">
                          Is there a receptionist?
                          <span class="text-red-500">*</span>
                        </label>
                        <p class="text-[12px] text-neutral-60">
                          If the pickup address is an apartment / flat, we strongly recommend that
                          the package be left with the receptionist.
                        </p>
                      </div>

                      <div class="flex gap-6 mt-2">
                        <div class="flex items-center gap-2 cursor-pointer">
                          <RadioButton
                            name="hasReceptionist"
                            input-id="receptionist_yes"
                            value="yes"
                          />
                          <label for="receptionist_yes">Yes</label>
                        </div>

                        <div class="flex items-center gap-2 cursor-pointer">
                          <RadioButton
                            name="hasReceptionist"
                            input-id="receptionist_no"
                            value="no"
                          />
                          <label for="receptionist_no">No</label>
                        </div>
                      </div>

                      <Message
                        v-if="$form.hasReceptionist?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                      >
                        {{ $form.hasReceptionist.error?.message }}
                      </Message>
                    </div>
                  </div>
                </div>

                <!-- Street Address -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Street Address</label>
                  <ClientOnly>
                    <!-- @select="handleOriginSelect" -->
                    <GoogleAddressInput
                      v-model="streetAddress"
                      name="streetAddress"
                      placeholder="Start Typing to Search..."
                    />
                  </ClientOnly>
                  <Message
                    v-if="$form.streetAddress?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.streetAddress.error?.message }}</Message
                  >
                </div>

                <!-- Notes for Courier -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90">Notes for Courier</label>
                  <div class="p-0">
                    <Textarea
                      name="notesForCourier"
                      placeholder="Enter any specific instruction for pickup..."
                      class="w-full mb-0"
                    />
                  </div>
                  <Message
                    v-if="$form.notesForCourier?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.notesForCourier.error?.message }}</Message
                  >
                  <div class="flex items-center gap-1 -mt-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 2C6.81331 2 5.65328 2.35189 4.66658 3.01118C3.67989 3.67047 2.91085 4.60754 2.45673 5.7039C2.0026 6.80025 1.88378 8.00665 2.11529 9.17054C2.3468 10.3344 2.91825 11.4035 3.75736 12.2426C4.59648 13.0818 5.66557 13.6532 6.82946 13.8847C7.99335 14.1162 9.19975 13.9974 10.2961 13.5433C11.3925 13.0891 12.3295 12.3201 12.9888 11.3334C13.6481 10.3467 14 9.18669 14 8C13.9982 6.40924 13.3655 4.88415 12.2407 3.75931C11.1159 2.63448 9.59076 2.00177 8 2ZM8 12.8C7.05065 12.8 6.12262 12.5185 5.33326 11.9911C4.54391 11.4636 3.92868 10.714 3.56538 9.83688C3.20208 8.95979 3.10702 7.99467 3.29223 7.06357C3.47744 6.13246 3.9346 5.27718 4.60589 4.60589C5.27718 3.93459 6.13246 3.47744 7.06357 3.29223C7.99468 3.10702 8.9598 3.20208 9.83688 3.56538C10.714 3.92868 11.4636 4.54391 11.9911 5.33326C12.5185 6.12262 12.8 7.05065 12.8 8C12.7985 9.27259 12.2924 10.4926 11.3925 11.3925C10.4926 12.2924 9.27259 12.7985 8 12.8ZM8 7.7C7.84087 7.7 7.68826 7.76321 7.57574 7.87573C7.46322 7.98826 7.4 8.14087 7.4 8.3V10.1C7.4 10.2591 7.46322 10.4117 7.57574 10.5243C7.68826 10.6368 7.84087 10.7 8 10.7C8.15913 10.7 8.31174 10.6368 8.42427 10.5243C8.53679 10.4117 8.6 10.2591 8.6 10.1V8.3C8.6 8.14087 8.53679 7.98826 8.42427 7.87573C8.31174 7.76321 8.15913 7.7 8 7.7ZM8 5.3C7.85167 5.3 7.70666 5.34399 7.58332 5.4264C7.45999 5.50881 7.36386 5.62594 7.30709 5.76299C7.25033 5.90003 7.23547 6.05083 7.26441 6.19632C7.29335 6.3418 7.36478 6.47544 7.46967 6.58033C7.57456 6.68522 7.7082 6.75665 7.85368 6.78559C7.99917 6.81453 8.14997 6.79967 8.28701 6.74291C8.42406 6.68614 8.54119 6.59001 8.6236 6.46668C8.70602 6.34334 8.75 6.19833 8.75 6.05C8.75 5.85109 8.67098 5.66032 8.53033 5.51967C8.38968 5.37902 8.19891 5.3 8 5.3Z"
                        fill="#616161"
                      />
                    </svg>

                    <p class="text-neutral-80 text-[12px] leading-5">
                      Example: Ring Bell no. 104 at reception or Call upon arrival.
                    </p>
                  </div>
                </div>

                <!-- PIC for Pickup Phone Number [Origin] -->
                <div class="relative flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90"
                    >PIC for Pickup Phone Number [Origin]</label
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
                    {{ $form.shipperOriginPhoneNumber.error?.message }}
                  </Message>
                </div>
              </div>
            </div>

            <!-- Schedule Your Pickup -->
            <div class="flex items-center px-6 py-4 bg-neutral-20">
              <!-- Sender Details -->
              <div class="flex-1 flex items-center gap-2">
                <IconShipmentOwnerInformation />
                <div class="flex flex-col gap-1">
                  <div class="text-[20px] leading-[130%] font-medium text-neutral-90">
                    Schedule Your Pickup
                  </div>
                  <p class="text-neutral-60">
                    Choose a convenient date and time for our courier to arrive.
                  </p>
                </div>
              </div>
            </div>

            <div class="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- LEFT: Pickup Date -->
              <div class="flex flex-col gap-3">
                <label class="font-medium text-neutral-80"> Pick a Date for Pickup </label>

                <DatePicker
                  name="pickupDate"
                  inline
                  :min-date="new Date()"
                  class="w-full"
                  :class="$form.pickupTime?.invalid ? 'border border-red-500 rounded-[8px]' : ''"
                  :invalid="$form.pickupDate?.invalid"
                  date-format="dd / mm / yy"
                />

                <small v-if="$form.pickupDate?.invalid" class="text-red-500 text-xs mt-1 block">
                  {{ $form.pickupDate?.error?.message }}
                </small>
              </div>

              <!-- RIGHT: Pickup Time -->
              <div class="flex flex-col gap-3">
                <label class="font-medium text-neutral-80"> Select Pickup Time </label>

                <SelectButton
                  name="pickupTime"
                  :options="pickupTimeOptions"
                  option-label="label"
                  option-value="value"
                  class="pickup-time flex flex-col gap-3 bg-transparent overflow-hidden"
                >
                  <template #option="slotProps">
                    <div
                      class="flex items-center gap-3 w-full h-[72px] px-6 py-5 rounded-[8px] overflow-hidden border"
                      :class="
                        pickupTime === slotProps.option.value
                          ? 'border-transparent bg-primary'
                          : 'border-neutral-30 bg-white hover:bg-primary hover:border-transparent'
                      "
                    >
                      <IconSun />
                      <span class="text-[18px] leading-[26px] text-neutral-90">
                        {{ slotProps.option.label }}
                      </span>
                    </div>
                  </template>
                </SelectButton>

                <small v-if="$form.pickupTime?.invalid" class="text-red-500 text-xs mt-1 block">
                  {{ $form.pickupTime?.error?.message }}
                </small>
              </div>
            </div>
          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="navigateToOrderHub">Back</BlackButton>
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

<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { ref } from "vue";
import { z } from "zod";
import { MENU } from "~/config";

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

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

const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");
const packingListCode = ref("-");

const viewMode = ref<"form" | "success">("form");

// * ------- Form Handling

const formRef = ref<any>(null);
const submitLoading = ref(false);
const errorSubmit = ref("");

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

  const payload = {
    ...values,
    bookingCode: bookingCode,
  };

  try {
    const res = await $fetch("/order-hub/item-and-package", {
      method: "POST",
      body: payload,
      credentials: "include", // Required
    });

    // Store state
    // userState.value = res.user

    if (res?.statusCode === 200) viewMode.value = "success";
  } catch (err: any) {
    errorSubmit.value = err?.data?.message || "Error submit item and packages";
  } finally {
    submitLoading.value = false;
  }
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

onMounted(() => {});
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
                <div
                  class="text-[20px] leading-[130%] font-medium text-neutral-90"
                >
                  Pickup Details
                </div>
              </div>
            </div>

            <!-- Shipment Owner Information Body -->
            <div class="flex flex-col px-6 gap-6">
              <div
                class="flex items-center justify-between px-6 py-4 bg-neutral-20 w-full"
              >
                <!-- Sender Details -->
                <div class="flex flex-col gap-2">
                  <div class="flex-1 flex items-center gap-2">
                    <IconQuickFill />
                    <div
                      class="text-[20px] leading-[130%] font-medium text-neutral-90"
                    >
                      Quick Fill
                    </div>
                  </div>
                  <p
                    class="text-[14px] leading-[22px] spacing-[0%] font-[400] text-neutral-60"
                  >
                    Pre-fill Information from Sender or Owner details to save
                    time.
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
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90"
                    >PIC for Pickup Name</label
                  >
                  <div class="relative">
                    <InputText
                      name="shipperFullName"
                      type="text"
                      placeholder="e.g. Dzulfan Fadli"
                      class="w-full pr-12"
                    />
                    <InputIcon class="absolute top-5 right-4">
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

                <!-- Street Address -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90"
                    >Street Address</label
                  >
                  <ClientOnly>
                    <!-- @select="handleOriginSelect" -->
                    <GoogleAddressInput
                      v-model="originAddress"
                      name="senderFullAddress"
                      placeholder="Sender full address"
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

                <!-- PIC for Pickup Phone Number [Origin] -->
                <div class="flex flex-col gap-[6px]">
                  <label class="font-medium text-neutral-90"
                    >PIC for Pickup Phone Number [Origin]</label
                  >
                  <div class="relative">
                    <InputIcon
                      class="absolute top-[9px] h-[44px] left-[1px] flex items-center justify-center py-3 w-[51px] bg-neutral-20 text-neutral-70 rounded-tl-[5px] rounded-bl-[5px]"
                    >
                      +62
                    </InputIcon>
                    <InputText
                      name="shipperOriginPhoneNumber"
                      type="phone"
                      placeholder="Enter phone number"
                      class="w-full pl-[67px]"
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
          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!-- @click="actionForm = ''" -->
              <TextButton :disabled="submitLoading" @click="handleFinishLater">
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
            Customer Information <br />
            Saved!
          </h3>

          <!-- Description -->
          <p class="text-neutral-60 text-center px-2">
            <!-- {{ props.description }} -->
            Your Customer Information has been successfully saved. Please
            proceed to finish the remaining form for your booking.
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

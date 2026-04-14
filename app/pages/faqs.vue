<script setup lang="ts">
  import { ref, nextTick } from "vue";

  interface FAQItem {
    question: string;
    answer: string;
  }

  interface FAQCategory {
    id: string;
    label: string;
    items: FAQItem[];
  }

  const categories: FAQCategory[] = [
    {
      id: "general",
      label: "General",
      items: [
        { question: "What exactly is included in Rimkirim services?", answer: "Rimkirim provides end-to-end international moving assistance including shipment rate calculation, customs documentation guidance, packing list preparation, pickup scheduling, real-time tracking, and delivery coordination to your destination in Indonesia." },
        { question: "Do I need to pack everything myself?", answer: "It depends on the service level and your location. For most shipments, you will handle packing your items according to our packing guidelines. We provide a detailed packing list and recommendations to ensure your goods are properly secured for international transit." },
        { question: "What type of items can and cannot be shipped?", answer: "Most household goods and personal belongings can be shipped. Prohibited items include hazardous materials, flammable substances, live animals, perishable goods, illegal substances, and certain electronics with lithium batteries. Contact us for a complete list specific to your origin country." },
      ],
    },
    {
      id: "services-coverage",
      label: "Services & Coverage",
      items: [
        { question: "How are Rimkirim's rates calculated?", answer: "Our rates are calculated based on the chargeable weight of your shipment (the greater of actual weight or volumetric weight), the origin and destination countries, and the shipping service selected (Standard or Special Rate). We apply transparent markups including fuel surcharge, VAT, and margin on top of base carrier rates." },
        { question: "Is insurance included in the rate?", answer: "Basic carrier liability is included in all shipments. For additional coverage, we recommend purchasing supplementary insurance especially for high-value items. Contact our team for insurance options and pricing." },
        { question: "Are there additional fees I should expect?", answer: "Additional fees may include customs duties and taxes at the destination, surcharges for oversized or overweight items, remote area delivery charges, and documentation processing fees. We aim to communicate all potential fees upfront during the quotation process." },
      ],
    },
    {
      id: "booking-pickup",
      label: "Booking & Pickup",
      items: [
        { question: "How do I book a shipment with Rimkirim?", answer: "Start by checking rates on our website, then proceed to create an account and fill out the eligibility form. Once eligible, you can create a booking through our Order Hub where you'll provide item details, upload compliance documents, and schedule a pickup." },
        { question: "How far in advance should I schedule a pickup?", answer: "We recommend scheduling your pickup at least 5-7 business days in advance to ensure availability. During peak seasons (holidays, end of academic terms), earlier booking is advised." },
        { question: "Can I change my pickup date after booking?", answer: "Yes, you can reschedule your pickup through the Order Hub or by contacting our customer support team. Please notify us at least 48 hours before the originally scheduled pickup date." },
      ],
    },
    {
      id: "packing",
      label: "Packing",
      items: [
        { question: "What are the packing requirements?", answer: "All items must be securely packed in sturdy cardboard boxes. Use bubble wrap or packing paper for fragile items. Each box should not exceed 30kg. Label all boxes clearly with your name and booking number. Detailed packing guidelines are provided after booking." },
        { question: "Do you provide packing materials?", answer: "We do not provide packing materials directly. However, we offer detailed guidance on recommended materials and where to source them in your area. Standard moving boxes, bubble wrap, and packing tape are generally sufficient." },
        { question: "What happens if my items are damaged during transit?", answer: "If items are damaged during transit, you should document the damage with photos immediately upon delivery. File a claim through our customer support within 7 days of delivery. Claims are processed according to the carrier's liability terms and any additional insurance purchased." },
      ],
    },
    {
      id: "prohibited-items",
      label: "Prohibited Items",
      items: [
        { question: "What items are prohibited from shipping?", answer: "Prohibited items include explosives, flammable liquids and gases, toxic substances, radioactive materials, corrosives, narcotics and illegal drugs, counterfeit goods, firearms and ammunition, live animals, and perishable food items. Restrictions may vary by origin country." },
        { question: "Are there restrictions on electronics?", answer: "Most personal electronics can be shipped. However, items with large lithium batteries (such as hoverboards or electric scooters) may be restricted. Laptops, phones, and tablets are generally allowed when properly packed. Check with our team for specific items." },
        { question: "Can I ship medication or supplements?", answer: "Personal medication in reasonable quantities for personal use is generally allowed with proper documentation (prescription from a doctor). Supplements and vitamins are usually permitted. Controlled substances require special permits and documentation." },
      ],
    },
    {
      id: "customs-docs",
      label: "Customs & Docs",
      items: [
        { question: "Are taxes and duties included in Rimkirim's rates?", answer: "No, customs duties and import taxes are not included in our shipping rates. These are determined by Indonesian customs based on the declared value and type of goods being imported. We provide guidance on estimated duty amounts during the booking process." },
        { question: "Are students eligible for tax exemptions?", answer: "Students returning to Indonesia may qualify for customs exemptions under the Barang Pindahan (personal effects) scheme, which allows duty-free import of used personal belongings. Proper documentation including student visa, university enrollment proof, and SKP from KBRI is required." },
        { question: "Who pays the taxes — the sender or the receiver?", answer: "Import duties and taxes are typically the responsibility of the receiver (consignee) in Indonesia. However, arrangements can be made for the sender to cover these costs. The specific arrangement should be agreed upon before shipment." },
      ],
    },
    {
      id: "pricing-payment",
      label: "Pricing & Payment",
      items: [
        { question: "What payment methods do you accept?", answer: "We accept bank transfers (both domestic and international), major credit cards, and selected e-wallet payments. Payment details and instructions are provided during the booking confirmation process." },
        { question: "Is there a minimum shipment weight?", answer: "Our Standard Rate applies for shipments starting from 0.5 kg. The Special Rate, which offers more competitive per-kg pricing, is available for shipments of 21 kg and above from selected countries." },
        { question: "Can I get a refund if I cancel my shipment?", answer: "Cancellation policies vary based on the stage of your booking. Cancellations before pickup are eligible for a full refund minus processing fees. Once items have been picked up, partial refunds may apply. Contact our support team for specific cancellation terms." },
      ],
    },
    {
      id: "tracking",
      label: "Tracking",
      items: [
        { question: "How can I track my shipment?", answer: "You can track your shipment through the Order Hub in your Rimkirim account. We provide real-time updates including pickup confirmation, in-transit status, customs clearance progress, and delivery confirmation." },
        { question: "How long does international shipping take?", answer: "Transit times vary by origin country and service level. FedEx International Economy typically takes 4-8 business days for delivery. Actual delivery time may vary due to customs clearance processing, which can add 2-5 business days." },
        { question: "What if my shipment is delayed?", answer: "If your shipment experiences delays, our team will proactively notify you with updated estimated delivery dates. Delays can occur due to customs inspections, weather conditions, or carrier operational issues. Contact our support team for real-time updates." },
      ],
    },
    {
      id: "insurance-claims",
      label: "Insurance & Claims",
      items: [
        { question: "What insurance options are available?", answer: "We offer basic carrier liability coverage included with all shipments, and optional enhanced insurance for higher-value goods. Enhanced insurance covers loss, damage, and theft up to the declared value of your items." },
        { question: "How do I file an insurance claim?", answer: "To file a claim, document any damage with photos within 24 hours of delivery, then contact our support team with your booking number, photos, and a description of the damage. Claims are reviewed and processed within 14 business days." },
        { question: "What is not covered by insurance?", answer: "Insurance typically does not cover damage due to improper packing by the shipper, normal wear and tear, items on the prohibited list, perishable items, inherent defects in the goods, or losses due to force majeure events." },
      ],
    },
  ];

  const activeCategory = ref("general");
  const openItems = ref<Record<string, boolean>>({});

  const scrollToCategory = (categoryId: string) => {
    activeCategory.value = categoryId;
    nextTick(() => {
      const el = document.getElementById(`faq-${categoryId}`);
      if (el) {
        const offset = 100;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  const toggleItem = (key: string) => {
    openItems.value[key] = !openItems.value[key];
  };

  const isOpen = (key: string) => !!openItems.value[key];

  const updateActiveOnScroll = () => {
    if (typeof window === "undefined") return;
    const sections = categories.map((c) => ({
      id: c.id,
      el: document.getElementById(`faq-${c.id}`),
    }));
    for (const s of [...sections].reverse()) {
      if (s.el) {
        const rect = s.el.getBoundingClientRect();
        if (rect.top <= 160) {
          activeCategory.value = s.id;
          break;
        }
      }
    }
  };

  onMounted(() => {
    window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", updateActiveOnScroll);
  });
</script>

<template>
  <div class="min-h-screen bg-white">
    <section class="pt-32 pb-10 text-center">
      <h1 class="text-display-md font-bold text-neutral-100">
        Frequently Asked Questions
      </h1>
      <p class="mt-3 text-body-md text-neutral-60">
        Last Updated and Effective: 14 April 2026
      </p>
    </section>

    <div class="sticky top-[72px] z-30 bg-white/90 backdrop-blur-md border-b border-neutral-20">
      <div class="max-w-5xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="shrink-0 px-4 py-2 rounded-full text-body-sm font-medium transition-all duration-200 whitespace-nowrap"
          :class="activeCategory === cat.id ? 'bg-neutral-100 text-white' : 'bg-neutral-10 text-neutral-80 hover:bg-neutral-20'"
          @click="scrollToCategory(cat.id)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <section class="max-w-5xl mx-auto px-4 py-12">
      <div class="space-y-16">
        <div
          v-for="cat in categories"
          :id="`faq-${cat.id}`"
          :key="cat.id"
          class="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 md:gap-16"
        >
          <div class="text-[22px] font-semibold text-neutral-100 md:pt-1">
            {{ cat.label }}
          </div>

          <div class="space-y-1">
            <div
              v-for="(item, idx) in cat.items"
              :key="`${cat.id}-${idx}`"
              class="border-b border-neutral-20 last:border-b-0"
            >
              <button
                class="w-full flex items-center justify-between text-left py-5 group focus-visible:rounded-md focus-visible:ring-offset-[6px]"
                @click="toggleItem(`${cat.id}-${idx}`)"
              >
                <span class="text-body-lg text-neutral-100 pr-4 group-hover:text-neutral-80 transition-colors">
                  {{ item.question }}
                </span>
                <svg
                  class="w-5 h-5 shrink-0 text-neutral-60 transition-transform duration-300"
                  :class="{ 'rotate-180': isOpen(`${cat.id}-${idx}`) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[500px] opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-[500px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-show="isOpen(`${cat.id}-${idx}`)" class="overflow-hidden">
                  <div class="pb-5 text-body-md text-neutral-60 leading-relaxed">
                    {{ item.answer }}
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

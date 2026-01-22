<template>
  <div class="px-6 py-4 rounded-2xl border-[2px] border-[#EDEDED] animate-pulse z-10">
    <!-- TOP -->
    <div class="relative grid grid-cols-[1.3fr_auto_1fr] items-center gap-3">
      <!-- LEFT -->
      <div>
        <div class="flex items-center gap-3 mb-2">
          <!-- badge -->
          <div class="h-[28px] w-[90px] rounded-full bg-gray-200" />

          <!-- provider logo -->
          <div class="h-[28px] w-[80px] rounded bg-gray-200" />
        </div>

        <!-- price -->
        <div class="h-[38px] w-[260px] rounded bg-gray-200 mb-2" />

        <!-- min weight -->
        <div class="h-[16px] w-[200px] rounded bg-gray-200" />
      </div>

      <!-- CENTER -->
      <div class="hidden md:flex flex-1 items-center justify-center gap-10">
        <!-- origin -->
        <div class="flex flex-col items-center gap-2">
          <div class="h-[40px] w-[60px] rounded-[4px] bg-gray-200" />
          <div class="h-[14px] w-[80px] rounded bg-gray-200" />
        </div>

        <!-- divider -->
        <div class="flex flex-col items-center gap-2">
          <div class="h-[14px] w-[40px] rounded bg-gray-200" />
          <div class="h-[6px] w-[100px] rounded bg-gray-200" />
          <div class="h-[14px] w-[50px] rounded bg-gray-200" />
        </div>

        <!-- destination -->
        <div class="flex flex-col items-center gap-2">
          <div class="h-[40px] w-[60px] rounded-[4px] bg-gray-200" />
          <div class="h-[14px] w-[80px] rounded bg-gray-200" />
        </div>
      </div>

      <!-- CTA -->
      <div class="flex justify-end">
        <div class="absolute top-0 right-0 w-[107px] h-[46px] rounded-[8px] bg-gray-200" />
      </div>
    </div>

    <!-- BOTTOM -->
    <div class="relative mt-6 border-t border-gray-200 pt-4">
      <div class="flex flex-col gap-2">
        <div class="h-[14px] w-[70%] rounded bg-gray-200" />
      </div>

      <div class="absolute right-0 bottom-0 flex items-center gap-2">
        <div class="h-[14px] w-[110px] rounded bg-gray-200" />
        <div class="h-[14px] w-[18px] rounded bg-gray-200" />
      </div>
    </div>
  </div>
</template>

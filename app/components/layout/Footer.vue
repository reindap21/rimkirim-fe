<template>
  <footer class="w-full bg-[#1E1E1E] text-white pt-[68px] pb-8">
    <div class="max-w-5xl mx-auto flex flex-col gap-10">
      <!-- TOP -->
      <div class="">
        <h2 class="text-[40px] leading-[48px] font-bold max-w-3xl">
          Let's ship more than<br />
          just household goods →
        </h2>
      </div>

      <!-- LINKS -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20 text-[14px]">
        <div class="space-y-4">
          <p class="text-[#C2C2C2]">Move</p>
          <ul class="text-white space-y-3">
            <li><a href="#" class="hover:opacity-80">Check Rate</a></li>
            <li><a href="#" class="hover:opacity-80">Packing List</a></li>
          </ul>
        </div>

        <div class="space-y-4">
          <p class="text-[#C2C2C2]">Service</p>
          <ul class="text-white space-y-3">
            <li><a href="#" class="hover:opacity-80">Back For Goods</a></li>
            <li><a href="#" class="hover:opacity-80">Moving Abroad</a></li>
          </ul>
        </div>

        <div class="space-y-4">
          <p class="text-[#C2C2C2]">Others</p>
          <ul class="text-white space-y-3">
            <li><a href="#" class="hover:opacity-80">Articles</a></li>
            <li><a href="#" class="hover:opacity-80">Jobs</a></li>
            <li><a href="#" class="hover:opacity-80">FAQs</a></li>
          </ul>
        </div>

        <div class="hidden md:block"></div>

        <div class="space-y-4 md:text-right">
          <p class="text-[#C2C2C2]">&nbsp;</p>
          <ul class="text-white space-y-3">
            <li><a href="#" class="hover:opacity-80">Terms of Service</a></li>
            <li><a href="#" class="hover:opacity-80">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <!-- BOTTOM -->
      <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div class="flex flex-col gap-4">
          <div class="text-[36px] font-bold text-[#C1FF00]">
            <UIBrandLogo fill="#C1FF00" width="245" height="82" />
          </div>
          <p class="mt-2 text-[14px] text-[#C2C2C2]">
            © 2025. Rimkirim – PT Dwarsa Sapta Angkasa. All rights reserved.
          </p>
        </div>

        <div class="flex gap-4">
          <a href="#"
            class="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/20 transition">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9.25326 6.66702C9.2529 7.37427 8.97161 8.0524 8.47126 8.55225C7.97092 9.0521 7.2925 9.33271 6.58526 9.33236C5.87801 9.332 5.19987 9.05071 4.70003 8.55037C4.20018 8.05002 3.91957 7.3716 3.91992 6.66436C3.92028 5.95711 4.20157 5.27898 4.70191 4.77913C5.20226 4.27928 5.88068 3.99867 6.58792 3.99902C7.29517 3.99938 7.9733 4.28067 8.47315 4.78102C8.973 5.28136 9.25361 5.95978 9.25326 6.66702ZM9.33326 11.307H3.99992V28.0004H9.33326V11.307ZM17.7599 11.307H12.4533V28.0004H17.7066V19.2404C17.7066 14.3604 24.0666 13.907 24.0666 19.2404V28.0004H29.3333V17.427C29.3333 9.20036 19.9199 9.50702 17.7066 13.547L17.7599 11.307Z"
                fill="white" />
            </svg>
          </a>
          <a href="#"
            class="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/20 hover:text-black transition">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.0001 11.667C14.8508 11.667 13.7486 12.1235 12.936 12.9362C12.1233 13.7489 11.6667 14.8511 11.6667 16.0003C11.6667 17.1496 12.1233 18.2518 12.936 19.0645C13.7486 19.8771 14.8508 20.3337 16.0001 20.3337C17.1494 20.3337 18.2516 19.8771 19.0642 19.0645C19.8769 18.2518 20.3334 17.1496 20.3334 16.0003C20.3334 14.8511 19.8769 13.7489 19.0642 12.9362C18.2516 12.1235 17.1494 11.667 16.0001 11.667Z"
                fill="white" />
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M9.02658 4.10968C13.6613 3.59625 18.3385 3.59625 22.9732 4.10968C25.5052 4.39235 27.5466 6.38568 27.8439 8.92701C28.3932 13.6266 28.3932 18.3741 27.8439 23.0737C27.5466 25.615 25.5052 27.6083 22.9746 27.8923C18.3394 28.4059 13.6617 28.4059 9.02658 27.8923C6.49458 27.6083 4.45325 25.615 4.15591 23.075C3.60656 18.375 3.60656 13.627 4.15591 8.92701C4.45325 6.38568 6.49458 4.39235 9.02658 4.10968ZM22.6666 8.00035C22.313 8.00035 21.9738 8.14082 21.7238 8.39087C21.4737 8.64092 21.3332 8.98006 21.3332 9.33368C21.3332 9.6873 21.4737 10.0264 21.7238 10.2765C21.9738 10.5265 22.313 10.667 22.6666 10.667C23.0202 10.667 23.3593 10.5265 23.6094 10.2765C23.8594 10.0264 23.9999 9.6873 23.9999 9.33368C23.9999 8.98006 23.8594 8.64092 23.6094 8.39087C23.3593 8.14082 23.0202 8.00035 22.6666 8.00035ZM9.66658 16.0003C9.66658 14.3206 10.3338 12.7097 11.5216 11.522C12.7093 10.3343 14.3202 9.66701 15.9999 9.66701C17.6796 9.66701 19.2905 10.3343 20.4783 11.522C21.666 12.7097 22.3332 14.3206 22.3332 16.0003C22.3332 17.6801 21.666 19.291 20.4783 20.4787C19.2905 21.6664 17.6796 22.3337 15.9999 22.3337C14.3202 22.3337 12.7093 21.6664 11.5216 20.4787C10.3338 19.291 9.66658 17.6801 9.66658 16.0003Z"
                fill="white" />
            </svg>
          </a>
          <a href="#"
            class="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/20 hover:text-black transition">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.1333 7.76C21.2221 6.71937 20.7198 5.3832 20.72 4H16.6V20.5333C16.5688 21.4283 16.1913 22.2761 15.547 22.898C14.9028 23.5199 14.0421 23.8672 13.1466 23.8667C11.2533 23.8667 9.67997 22.32 9.67997 20.4C9.67997 18.1067 11.8933 16.3867 14.1733 17.0933V12.88C9.5733 12.2667 5.54663 15.84 5.54663 20.4C5.54663 24.84 9.22663 28 13.1333 28C17.32 28 20.72 24.6 20.72 20.4V12.0133C22.3906 13.2131 24.3965 13.8569 26.4533 13.8533V9.73333C26.4533 9.73333 23.9466 9.85333 22.1333 7.76Z"
                fill="white" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
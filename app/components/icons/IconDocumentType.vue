<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  mimeType?: string;
  size?: number;
}>();

/**
 * Get document type from MIME type
 */
const documentType = computed(() => {
  if (!props.mimeType) return 'unknown';

  const mime = props.mimeType.toLowerCase();

  // Images
  if (mime.startsWith('image/')) return 'image';

  // PDF
  if (mime === 'application/pdf') return 'pdf';

  // Documents
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    mime === 'application/msword' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) return 'word';

  if (
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime === 'application/vnd.ms-excel' ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) return 'excel';

  if (
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    mime === 'application/vnd.ms-powerpoint' ||
    mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) return 'powerpoint';

  // Archives
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('tar') ||
    mime.includes('archive') ||
    mime === 'application/x-zip-compressed' ||
    mime === 'application/zip'
  ) return 'archive';

  // Text
  if (mime.startsWith('text/')) return 'text';

  return 'unknown';
});

/**
 * Get document label for display
 */
const documentLabel = computed(() => {
  const labels: Record<string, string> = {
    image: 'IMG',
    pdf: 'PDF',
    word: 'DOC',
    excel: 'XLS',
    powerpoint: 'PPT',
    archive: 'ZIP',
    text: 'TXT',
    unknown: 'DOC',
  };

  return labels[documentType.value] || 'DOC';
});

/**
 * Get icon color based on document type
 */
const iconColor = computed(() => {
  const colors: Record<string, string> = {
    image: '#4CAF50', // Green for images
    pdf: '#F44336', // Red for PDF
    word: '#2196F3', // Blue for Word
    excel: '#4CAF50', // Green for Excel
    powerpoint: '#FF9800', // Orange for PowerPoint
    archive: '#FF9800', // Orange for archives
    text: '#9E9E9E', // Gray for text
    unknown: '#1E1E1E', // Black for unknown
  };

  return colors[documentType.value] || '#1E1E1E';
});

const iconSize = computed(() => props.size || 32);
</script>

<template>
  <svg
    :width="iconSize"
    :height="iconSize"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Document background -->
    <path
      d="M3 18.6661V12.6076C3 10.4685 2.99895 8.77715 3.15495 7.44089C3.31347 6.08317 3.64525 4.96337 4.40234 4.02422C4.68577 3.67269 5.00655 3.35192 5.35807 3.06849C6.29722 2.3114 7.41703 1.97962 8.77474 1.82109C10.111 1.6651 11.8024 1.66615 13.9414 1.66615C14.8124 1.66614 15.4861 1.65356 16.1159 1.87578C16.2392 1.91931 16.3603 1.96932 16.4779 2.02552C17.0802 2.31371 17.5472 2.7993 18.1628 3.41484L24.4779 9.72995C25.102 10.354 25.614 10.8463 25.931 11.4396L26.0547 11.7013L26.1133 11.8615C26.2395 12.2469 26.2836 12.6981 26.306 13.0932C26.3333 13.5754 26.3333 14.1293 26.3333 14.6661C26.3333 15.2184 25.8856 15.6661 25.3333 15.6661C24.781 15.6661 24.3333 15.2184 24.3333 14.6661C24.3333 14.113 24.3333 13.6206 24.3099 13.2065C24.3056 13.1312 24.2996 13.0623 24.2943 12.9995H24C22.1428 12.9995 20.6492 13.002 19.4779 12.8445C18.2777 12.6832 17.2674 12.3372 16.4648 11.5346C15.6623 10.7321 15.3163 9.72175 15.1549 8.52162C14.9975 7.35028 15 5.85669 15 3.99948V3.68307C14.7776 3.6689 14.4559 3.66615 13.9414 3.66615C11.754 3.66615 10.1999 3.66745 9.00651 3.80677C7.83472 3.94359 7.13938 4.20162 6.61328 4.62578C6.37276 4.81971 6.15357 5.0389 5.95964 5.27943C5.53548 5.80553 5.27744 6.50086 5.14063 7.67266C5.00131 8.86601 5 10.4201 5 12.6076V18.6661C5 21.2085 5.002 23.0147 5.1862 24.3849C5.36655 25.7264 5.70528 26.4991 6.26953 27.0633C6.83382 27.6276 7.60648 27.9663 8.94792 28.1466C10.3181 28.3308 12.1243 28.3328 14.6667 28.3328H25.3333C25.8856 28.3328 26.3333 28.7805 26.3333 29.3328C26.3333 29.8851 25.8856 30.3328 25.3333 30.3328H14.6667C12.1808 30.3328 10.2155 30.3347 8.68099 30.1284C7.11793 29.9182 5.85321 29.4751 4.85547 28.4773C3.8577 27.4796 3.41461 26.2149 3.20443 24.6518C2.99813 23.1174 3 21.152 3 18.6661ZM17.0013 5.08151C17.0062 6.43447 17.0298 7.4493 17.138 8.25469C17.2696 9.23305 17.5099 9.75156 17.8789 10.1206C18.2479 10.4896 18.7664 10.7299 19.7448 10.8615C20.5499 10.9697 21.5644 10.992 22.9167 10.9969L17.0013 5.08151Z"
      :fill="iconColor"
    />

    <!-- Document type label -->
    <text
      x="12"
      y="26"
      font-size="10"
      font-weight="bold"
      :fill="iconColor"
      text-anchor="middle"
    >
      {{ documentLabel }}
    </text>
  </svg>
</template>

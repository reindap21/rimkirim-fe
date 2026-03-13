import type { OrderHubProgress, OrderHubStep } from "~/types/order-hub";

/**
 *
 * @param purpose_of_shipment
 * @returns
 */
export const isPurposeOfShipmentPassengerGoods = (purpose_of_shipment: string) => {
  if (!purpose_of_shipment) return false;
  return purpose_of_shipment?.toLowerCase() === "passenger_goods";
};

/**
 *
 * @param purpose_of_shipment
 * @returns
 */
// export const isPurposeOfShipmentMovingGoods = (purpose_of_shipment: string) => {
//   return purpose_of_shipment?.toLowerCase() === "moving_goods";
// };

export const isCompleted = (text: string) => {
  if (!text || typeof text !== "string") return false;
  return text?.toLowerCase() === "completed";
};

export const isLocked = (text: string) => {
  if (!text || typeof text !== "string") return false;
  return text?.toLowerCase() === "locked";
};

const stepLabels: Record<OrderHubStep, string> = {
  customer_information: "Customer Information",
  item_and_package: "Item & Packages Information",
  compliance_document: "Compliance Document",
  pickup_detail_schedule: "Pickup Detail Schedule",
};

export const hasIncompleteSteps = (
  currentStep: OrderHubStep | null,
  progress: OrderHubProgress["progress"],
) => {
  if (!progress) return true;
   
  // Ambil semua step kecuali current
  return Object.entries(progress)
    .filter(([step, status]) => {
      return step !== currentStep && !isCompleted(status) && !isLocked(status);
    })
    .map(([step]) => stepLabels[step as OrderHubStep]);
};

export const getNextStepDescription = (
  currentStep: OrderHubStep | null,
  progress: OrderHubProgress["progress"],
): string => {
  if (!currentStep) return "";

  // Ambil semua step kecuali current
  const incompleteSteps = hasIncompleteSteps(currentStep, progress);

  // Kalau semua sudah selesai
  if (!incompleteSteps || incompleteSteps?.length === 0) return "";

  return `Finish ${formatStepList(incompleteSteps)} to schedule your move.`;
};

const formatStepList = (steps: string[]): string => {
  if (!steps || steps.length === 0 || !Array.isArray(steps)) return "";

  if (steps.length === 1) return steps[0];

  if (steps.length === 2) return `${steps[0]} and ${steps[1]}`;

  return `${steps?.slice(0, -1).join(", ")}, and ${steps.at(-1)}`;
};

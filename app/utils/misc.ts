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


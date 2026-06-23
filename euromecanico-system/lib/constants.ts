export const ORDER_STATUSES = [
  "RECEIVED",
  "DIAGNOSING",
  "WAITING_PARTS",
  "IN_REPAIR",
  "READY",
  "DELIVERED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: "Recibido",
  DIAGNOSING: "Diagnosticando",
  WAITING_PARTS: "Esperando Piezas",
  IN_REPAIR: "En Reparación",
  READY: "Listo",
  DELIVERED: "Entregado",
};

export const STATUS_MESSAGES: Record<OrderStatus, string> = {
  RECEIVED:
    "Hemos recibido su vehículo {make} {model}. Le notificaremos cuando comience el diagnóstico.",
  DIAGNOSING: "Estamos diagnosticando su vehículo. Le informaremos pronto.",
  WAITING_PARTS:
    "Estamos esperando piezas para su vehículo. Le avisaremos cuando lleguen.",
  IN_REPAIR: "Su vehículo está en proceso de reparación.",
  READY: "¡Su vehículo está listo para ser recogido! Puede visitarnos en horario de lunes a viernes 8am–5pm.",
  DELIVERED:
    "Gracias por confiar en Euromecanico Corp. ¡Hasta la próxima!",
};

export const SHOP_INFO = {
  name: "Euromecanico Corp",
  address: "Puerto Rico",
  phone: "+1 (787) 344-6328",
  email: "admin@euromecanicocorp.com",
  website: "euromecanicocorp.com",
  hours: "Lunes a Viernes 8am–5pm",
};

export const IVU_RATE = 0.115;

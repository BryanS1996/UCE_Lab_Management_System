export const RABBITMQ_EXCHANGES = {
  RESERVATION_EVENTS: 'reservation.events',
  LABORATORY_EVENTS: 'laboratory.events',
  NOTIFICATION_EVENTS: 'notification.events',
  AUDIT_EVENTS: 'audit.events',
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  // Reservation events
  RESERVATION_CREATED: 'reservation.created',
  RESERVATION_CONFIRMED: 'reservation.confirmed',
  RESERVATION_CANCELLED: 'reservation.cancelled',
  RESERVATION_COMPLETED: 'reservation.completed',
  // Laboratory events
  LABORATORY_CREATED: 'laboratory.created',
  LABORATORY_UPDATED: 'laboratory.updated',
  LABORATORY_DEACTIVATED: 'laboratory.deactivated',
  // Notification events
  NOTIFICATION_SENT: 'notification.sent',
  // Audit events
  AUDIT_LOG_CREATED: 'audit.log.created',
} as const;

export const RABBITMQ_QUEUES = {
  NOTIFICATION_RESERVATIONS: 'notification.reservation-events',
  AUDIT_RESERVATIONS: 'audit.reservation-events',
  AUDIT_LABORATORIES: 'audit.laboratory-events',
  ANALYTICS_RESERVATIONS: 'analytics.reservation-events',
} as const;

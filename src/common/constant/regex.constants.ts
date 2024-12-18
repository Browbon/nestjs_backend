// regex constants
export const JWT_EXPIRY_REGEX: RegExp = /\b(\d+)\s*(ms|[smhd])?\b/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/;
export const RABBIT_MQ_URI_REGEX =
  /^(amqps?):\/\/(?:[^:@]+:[^:@]+@)?[^/:?]+(?::\d+)?(?:\/[^/?]+)?(?:\?.*)?$/;

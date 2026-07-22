export const sensitiveFields: Record<string, string[]> = {
  User: ['password_hash', 'deleted_at', 'deleted_by', 'is_root',  'failed_login_attempts', 'last_failed_login_at', 'locked_until' ],
  Products: [],
  Customer: [],
  Order: [],
};
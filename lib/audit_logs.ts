type AuditLog = {
  id: string;

  entityType: "transaction" | "account";
  entityId: string;

  action: "CREATE" | "ADJUST" | "SUSPEND";

  performedBy: {
    userId: string;
    role: string;
    ip?: string;
    userAgent?: string;
  };

  metadata: {
    reason?: string;
    previousBalance?: number;
    newBalance?: number;
    amount?: number;
  };

  timestamp: string;
};

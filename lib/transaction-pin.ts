export function assertTransactionPin(pin?: string) {
  const requiredPin = process.env.TRANSACTION_PIN;

  // Keep PIN gating opt-in. If TRANSACTION_PIN is unset, transactions proceed.
  if (!requiredPin) return;

  if (!pin || pin !== requiredPin) {
    throw new Error("INVALID_TRANSACTION_PIN");
  }
}

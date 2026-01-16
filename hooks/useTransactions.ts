// This hook isolates data fetching/mutation away from UI components
export function useTransactions() {
  // In a real app this talks to your API
  const createTransfer = async (payload: unknown) => {
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
  };

  return { createTransfer };
}

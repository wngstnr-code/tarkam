import { create } from "zustand";

interface WalletState {
  /** Alamat dompet user (null = belum onboarding / belum dicek). */
  address: string | null;
  /** Sudah dicek ke IndexedDB apakah wallet ada. */
  hydrated: boolean;
  usdtBalance: bigint | null;
  setAddress: (address: string | null) => void;
  setHydrated: () => void;
  setUsdtBalance: (b: bigint | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  hydrated: false,
  usdtBalance: null,
  setAddress: (address) => set({ address }),
  setHydrated: () => set({ hydrated: true }),
  setUsdtBalance: (usdtBalance) => set({ usdtBalance }),
}));

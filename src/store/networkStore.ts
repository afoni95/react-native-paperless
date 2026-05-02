import { create } from 'zustand';

export enum NetworkStatus {
  Online = 'Online',
  Offline = 'Offline',
  Disconnected = 'Disconnected',
}

interface NetworkState {
  status: NetworkStatus;
  setStatus: (status: NetworkStatus) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  status: NetworkStatus.Online,
  setStatus: (status: NetworkStatus) => set({ status }),
}));

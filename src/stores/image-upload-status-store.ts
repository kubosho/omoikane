import { create } from 'zustand';

import { ImageUploadStatus } from '../features/album/types/image-upload-status';

type ImageUploadStatusState = {
  imageUploadStatus: ImageUploadStatus;
  message: string;
  updateImageUploadStatus: (status: ImageUploadStatus) => void;
  updateMessage: (message: string) => void;
};

export const useImageUploadStatus = create<ImageUploadStatusState>((set) => ({
  imageUploadStatus: 'idle',
  message: '',
  updateImageUploadStatus: (status: ImageUploadStatus) => set({ imageUploadStatus: status }),
  updateMessage: (message: string) => set({ message }),
}));

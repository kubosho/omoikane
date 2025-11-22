'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { ImageUploadStatus } from '../types/image-upload-status';
import { imagesQueryKey } from '../utils/images-query-key';
import { upsertImagesSuccessResponseSchema } from '../utils/upsert-images-schema';

type UseImageUploaderResult = {
  uploadImage: (files: File[]) => Promise<void>;
  status: ImageUploadStatus;
  error: string | null;
};

const uploadSingleImage = async (file: File): Promise<{ imagePath: string }> => {
  const params = new URLSearchParams();
  // Not using append() to prevent multiple parameters added.
  params.set('filename', file.name);

  const response = await fetch(`/api/images/upload?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}.`);
  }

  const result = upsertImagesSuccessResponseSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error('Invalid response type from server.');
  }

  return result.data;
};

export const useImageUploader = (): UseImageUploaderResult => {
  const [status, setStatus] = useState<ImageUploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const resetState = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const uploadImage = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      setStatus('uploading');
      setError(null);

      try {
        await Promise.all(files.map(uploadSingleImage));
        void queryClient.invalidateQueries({ queryKey: imagesQueryKey });
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setTimeout(() => {
          resetState();
        }, 3_000);
      }
    },
    [resetState],
  );

  return { uploadImage, status, error };
};

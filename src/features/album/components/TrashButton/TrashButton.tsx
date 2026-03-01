'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useCallback } from 'react';

import { imagesQueryKey } from '../../utils/images-query-key';

type Props = {
  filename: string;
  className?: string;
};

async function deleteImage(filename: string): Promise<void> {
  if (filename === '') {
    throw new Error('filename is required.');
  }

  const requestParams = new URLSearchParams({ filename });
  const response = await fetch(`/api/images/delete?${requestParams.toString()}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Delete image failed with status ${response.status}.`);
  }
}

export function TrashButton({ filename, className }: Props): React.JSX.Element {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => deleteImage(filename),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: imagesQueryKey });
    },
  });

  const handleDeleteImage = useCallback(() => {
    if (confirm('Do you want to delete the image?')) {
      mutate();
    }
  }, [mutate]);

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center p-2 rounded-2 shadow-md bg-blue-600 text-monotone-100 ${className}`}
      onClick={handleDeleteImage}
    >
      <Image src="/images/icons/trash.svg" alt="Trash" width={16} height={16} />
    </button>
  );
}

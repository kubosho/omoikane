'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const { refetch } = useQuery({
    queryKey: imagesQueryKey,
    queryFn: () => deleteImage(filename),
    enabled: false,
  });

  const handleDeleteImage = useCallback(() => {
    const confirmed = confirm('Do you want to delete the image?');

    if (confirmed) {
      void refetch().then(async () => {
        // FIXME: After deleting an image, the image list is refetch,
        //        so multiple requests to S3 are each time an image is deleted.
        //        We want to eliminate an extra requests.
        await queryClient.invalidateQueries({ queryKey: imagesQueryKey });
      });
    }
  }, []);

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1 px-4 py-2 rounded-2 shadow-md bg-blue-600 text-monotone-100 ${className}`}
      onClick={handleDeleteImage}
    >
      <Image src="/images/icons/trash.svg" alt="" width={14} height={16} />
      Trash
    </button>
  );
}

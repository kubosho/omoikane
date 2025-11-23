'use client';

import { FileUpload } from '@ark-ui/react/file-upload';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { IMAGE_UPLOAD_LIMIT } from '../../../../constants/image-upload-limit';
import { useImageUploader } from '../../hooks/use-image-uploader';

export const ImageUploadButton = (): React.JSX.Element => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const { uploadImage } = useImageUploader();

  useEffect(() => {
    if (filesToUpload.length === 0) {
      return;
    }

    void uploadImage(filesToUpload).then(() => {
      setFilesToUpload([]);
    });
  }, [filesToUpload]);

  const handleFileAccept = (details: FileUpload.FileAcceptDetails): void => {
    setFilesToUpload(details.files);
  };

  return (
    <FileUpload.Root accept="image/*" allowDrop={false} maxFiles={IMAGE_UPLOAD_LIMIT} onFileAccept={handleFileAccept}>
      <FileUpload.HiddenInput />
      <FileUpload.Trigger className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-2 shadow-md bg-blue-600 text-monotone-100">
        <Image src="/images/icons/plus.svg" alt="" width={12} height={12} />
        Add file(s)
      </FileUpload.Trigger>
    </FileUpload.Root>
  );
};

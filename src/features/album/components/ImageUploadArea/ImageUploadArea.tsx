'use client';

import { FileUpload } from '@ark-ui/react/file-upload';
import { useState } from 'react';

import { ImageUploadStatus } from '../../types/image-upload-status';

export const ImageUploadArea = (): React.JSX.Element => {
  const [status, setStatus] = useState<ImageUploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const resetState = (): void => {
    setStatus('idle');
    setError(null);
  };

  return (
    <FileUpload.Root accept="image/*" maxFiles={5} onFileAccept={resetState}>
      <FileUpload.HiddenInput />

      <FileUpload.Label>File Upload</FileUpload.Label>
      <FileUpload.Dropzone>Drag and drop your images here</FileUpload.Dropzone>

      <FileUpload.ItemGroup>
        <FileUpload.Context>
          {({ acceptedFiles }) =>
            acceptedFiles.map((file) => (
              <FileUpload.Item key={file.name} file={file}>
                <FileUpload.ItemPreview type="image/*">
                  <FileUpload.ItemPreviewImage />
                </FileUpload.ItemPreview>
                <FileUpload.ItemName />
                <FileUpload.ItemSizeText />
                <FileUpload.ItemDeleteTrigger>X</FileUpload.ItemDeleteTrigger>
              </FileUpload.Item>
            ))
          }
        </FileUpload.Context>
      </FileUpload.ItemGroup>
    </FileUpload.Root>
  );
};

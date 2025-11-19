export type GetImagesSuccessResponseObject = {
  urls: string[];
  nextToken: string | null;
};

export type GetImagesErrorResponseObject = {
  message: string;
};

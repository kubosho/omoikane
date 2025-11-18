import preview from '../../../.storybook/preview';
import { Images } from '.';

const meta = preview.meta({
  component: Images,
});

export const Basic = meta.story({
  args: {
    imageUrls: [
      'https://placekitten.com/600/300',
      'https://placekitten.com/500/300',
      'https://placekitten.com/400/300',
      'https://placekitten.com/300/600',
      'https://placekitten.com/300/500',
      'https://placekitten.com/300/400',
    ],
    nextToken: null,
  },
});

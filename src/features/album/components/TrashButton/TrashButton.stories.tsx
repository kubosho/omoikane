import preview from '../../../../../.storybook/preview';
import { TrashButton } from '.';

const meta = preview.meta({
  component: TrashButton,
});

export const Basic = meta.story({
  args: {
    filename: 'example-image.jpg',
  },
});

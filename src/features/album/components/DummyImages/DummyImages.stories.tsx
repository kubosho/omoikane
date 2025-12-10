import preview from '../../../../../.storybook/preview';
import { DummyImages } from '../DummyImages';

const meta = preview.meta({
  component: DummyImages,
});

export const FiveImages = meta.story({
  args: {
    count: 5,
  },
});

export const TenImages = meta.story({
  args: {
    count: 10,
  },
});

export const TwentyImages = meta.story({
  args: {
    count: 20,
  },
});

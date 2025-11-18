import '../src/app/globals.css';

import { definePreview } from '@storybook/nextjs';

export default definePreview({
  addons: [],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
});

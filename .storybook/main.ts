import { defineMain } from '@storybook/nextjs/node';

export default defineMain({
  addons: ['@storybook/addon-links'],
  framework: '@storybook/nextjs',
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
});

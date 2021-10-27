module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        targets: {
          ie: 11,
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-classes',
    '@babel/plugin-proposal-optional-chaining',
  ],
};

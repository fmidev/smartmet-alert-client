export default {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: true,
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep useful IDs in case they're referenced
          cleanupIds: {
            minify: false,
          },
        },
      },
    },
    // Keep viewBox as it's needed for responsive scaling
    {
      name: 'removeViewBox',
      active: false,
    },
    // Remove XML declaration (<?xml version="1.0"?>)
    'removeXMLProcInst',
    // Remove unnecessary xmlns:xlink
    {
      name: 'removeUnusedNS',
    },
    // Clean up numeric values (reduce decimal precision with rounding)
    {
      name: 'cleanupNumericValues',
      params: {
        floatPrecision: 3,
      },
    },
    // Convert style attributes to attributes where possible
    {
      name: 'convertStyleToAttrs',
      params: {
        keepImportant: true,
      },
    },
  ],
}

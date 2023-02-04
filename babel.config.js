module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            assets: './assets',
            components: './src/components',
            lib: './src/lib',
            app: './src/app',
            business: './src/business',
            '@atoms': './src/components/atoms',
            '@components': './src/components',
            '@hooks': './src/hooks',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      [
        '@babel/plugin-transform-flow-strip-types',
        {
          allowDeclareFields: true,
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
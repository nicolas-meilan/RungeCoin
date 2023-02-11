module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@screens': './src/screens',
            '@components': './src/components',
            '@containers': './src/containers',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@system': './src/system',
            '@web3': './src/web3',
            '@utils': './src/utils',
            '@http': './src/http',
            '@assets': './assets',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      [
        '@babel/plugin-transform-flow-strip-types',
        {
          allowDeclareFields: true,
        },
      ],
      [
        'module:react-native-dotenv',
        {
          'envName': 'APP_ENV',
          'moduleName': '@env',
          'path': '.env',
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
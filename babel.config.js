module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
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
            'crypto': 'react-native-quick-crypto',
            'stream': 'stream-browserify',
            'buffer': '@craftzdog/react-native-buffer',
            'http': '@tradle/react-native-http',
            'https': 'https-browserify',
            '@ledgerhq/domain-service': '@ledgerhq/domain-service/lib', // Fix @ledgerhq/hw-app-eth
            '@ledgerhq/evm-tools': '@ledgerhq/evm-tools/lib',
            '@ledgerhq/cryptoassets': '@ledgerhq/cryptoassets/lib',
            '@ledgerhq/live-network': '@ledgerhq/live-network/lib',
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
        '@babel/plugin-transform-flow-strip-types', {
          allowDeclareFields: true,
        },
      ],
      [
        'module:react-native-dotenv', {
          'envName': 'APP_ENV',
          'moduleName': '@env',
          'path': '.env',
        },
      ],
      ['react-native-reanimated/plugin', {
        globals: ['__scanCodes'],
      }],
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
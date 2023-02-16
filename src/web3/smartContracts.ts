import { Network } from './constants';
import { isDev } from '@utils/config';

export const BALANCE_CHECKER = {
  [Network.ETHEREUM]: {
    address: isDev() ? '0x9788C4E93f9002a7ad8e72633b11E8d1ecd51f9b' : '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
    abi: [
      {
        payable: true,
        stateMutability: 'payable',
        type: 'fallback',
      },
      {
        constant: true,
        inputs: [
          {
            name: 'user',
            type: 'address',
          },
          {
            name: 'token',
            type: 'address',
          },
        ],
        name: 'tokenBalance',
        outputs: [
          {
            name: '',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
      {
        constant: true,
        inputs: [
          {
            name: 'users',
            type: 'address[]',
          },
          {
            name: 'tokens',
            type: 'address[]',
          },
        ],
        name: 'balances',
        outputs: [
          {
            name: '',
            type: 'uint256[]',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ],
  },
};
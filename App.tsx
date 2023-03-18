import React from 'react';

import initializeI18nConfig from './src/locale/i18nConfig';
import Root from './src/Root';
import Providers from '@containers/Providers';

initializeI18nConfig();


const App = () => (
  <Providers>
    <Root />
  </Providers>
);

export default App;

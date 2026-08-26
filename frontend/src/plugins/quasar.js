import { Quasar, Notify, Dialog, Loading } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';

// Importar Animaciones de Quasar / Animate.css desde @quasar/extras
import '@quasar/extras/animate/fadeIn.css';
import '@quasar/extras/animate/fadeOut.css';
import '@quasar/extras/animate/fadeInUp.css';
import '@quasar/extras/animate/fadeInDown.css';
import '@quasar/extras/animate/zoomIn.css';
import '@quasar/extras/animate/zoomOut.css';
import '@quasar/extras/animate/slideInLeft.css';
import '@quasar/extras/animate/slideInRight.css';
import '@quasar/extras/animate/bounceIn.css';

import 'quasar/src/css/index.sass';
import lang from 'quasar/lang/es';

export function instalarQuasar(app) {
  app.use(Quasar, {
    plugins: { Notify, Dialog, Loading },
    lang,
    config: {
      brand: {
        primary: '#2a7f5b',
        secondary: '#173d30',
        accent: '#5bbd8a',
        dark: '#0e1c17',
        positive: '#2bb673',
        negative: '#d64a4a',
        warning: '#f2c037',
        info: '#4ec3c1',
      },
      notify: {
        position: 'top-right',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white', round: true }],
      },
    },
  });
}

export default instalarQuasar;

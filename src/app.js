const qs = require('querystring');
const moment = require('moment');
const methods = require('./methods');
const dbConnect = require('./database/mongoose');
const cron = require('node-cron');

(async () => {
  await dbConnect.mongoConnect();

  const config = {
    url: {
      host: 'http://revistas.inpi.gov.br',
      path: '/rpi/busca/data?',
      startDate: 'revista.dataInicial=' + qs.escape('01/01/2001') + '&',
      endDate: 'revista.dataFinal=' + qs.escape(moment().format('DD/MM/YYYY').toString()) + '&',
      type: 'revista.tipoRevista.id=5',
    },
  };

  cron.schedule('* 0 * * TUE', async () => {
    console.warn('Rodando Cron...');
    await methods.update(config);
  });
})();

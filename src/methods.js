const qs = require('querystring');

const inpiMonitor = () => {
  return {
    setDate: config => {
      const { startDate, endDate } = config;

      return {
        host: 'http://revistas.inpi.gov.br',
        path: '/rpi/busca/data?',
        startDate: 'revista.dataInicial=' + qs.escape(startDate) + '&',
        endDate: 'revista.dataFinal=' + qs.escape(endDate) + '&',
        type: 'revista.tipoRevista.id=5',
      };
    },

    update: async () => {
      
    }
  };
};

const axios = require('axios');
const AdmZip = require('adm-zip');
const request = require('request');
const parser = require('xml2json');
const xmlFilter = require('./sanitizers/xmlFilter');
const txtFilter = require('./sanitizers/txtFilter');
const dbMethods = require('./database/dbMethods');

const update = async config => {
  if (!config.url) return;
  const magazineList = await getMagazineList(Object.values(config.url).join(''));
  return await importMagazines(magazineList, config);
};

const getMagazineList = async url => {
  const response = await axios.get(url);
  return response.data;
};

const downloadFile = async url =>
  new Promise((resolve, reject) => {
    request.get({ url, encoding: null }, (error, response, body) => {
      if (error) return reject(error);
      if (response.statusCode != 200) return reject(undefined);
      return resolve(body);
    });
  });

const importMagazines = async (magazineList, config) => {
  for (const prop in magazineList) {
    const existMagazine = await dbMethods.findMagazineByNumber(magazineList[prop].numero);

    if (
      !magazineList[prop].nomeArquivoEscritorio &&
      magazineList[prop].nomeArquivo &&
      magazineList[prop].nomeArquivo.split('.')[1] === 'pdf'
    ) {
      console.warn('Arquivo Incompatível. Revista: ', magazineList[prop].numero);
      continue;
    }

    if (!existMagazine) {
      console.warn(`---- IMPORTANDO REVISTA ${magazineList[prop].numero} -----`);
      const zippedFile = await downloadFile(`${config.url.host}/txt/${magazineList[prop].nomeArquivoEscritorio}`);

      const file = await unzipFile(zippedFile);

      switch (file.ext.toLowerCase()) {
        case 'xml': {
          const xmlMagazine = JSON.parse(parser.toJson(file.buffer.toString()));
          await xmlFilter(xmlMagazine.revista);
          break;
        }

        case 'txt': {
          const txtMagazine = file.buffer.toString('utf-8');
          await txtFilter(txtMagazine, magazineList[prop].dataPublicacao, magazineList[prop].numero);
          break;
        }

        default:
          break;
      }
    } else {
      console.warn(`Ignorando revista ${magazineList[prop].numero} já importada.`);
    }
  }
};

const unzipFile = async zippedFile =>
  new Promise(resolve => {
    const buf = new Array();
    let ext = null;
    const zip = new AdmZip(zippedFile);
    const zipEntries = zip.getEntries();

    for (const entry in zipEntries) {
      ext = zipEntries[entry].entryName.substr(-3);
      buf.push(zip.readAsText(zipEntries[entry]));
    }

    resolve({ ext, buffer: buf });
  });

module.exports = { update };

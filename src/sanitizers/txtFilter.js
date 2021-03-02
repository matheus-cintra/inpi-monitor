const dbMethods = require('../database/dbMethods');
const moment = require('moment');
const textSanitizer = require('./textSanitizer');

module.exports = async function (txt, magazineDate, magazineNumber) {
  let data = new Object();
  let brand = new Object();
  const processList = [];

  for (const line of txt.split(/\r?\n/)) {
    if (line.match(/\W*(No[.])\W*/)) {
      let json = await textSanitizer.headerTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(Tit[.])\W*/)) {
      let json = await textSanitizer.holderTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(Marca)\W*/)) {
      let json = await textSanitizer.brandTrap(line);
      brand.name = json;
    }

    if (line.match(/\W*(Procurador[:])\W*/)) {
      let json = await textSanitizer.attorneyTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(Apres[.])\W*/)) {
      let json = await textSanitizer.presentationTrap(line);
      brand.presentation = json.presentation;
      brand.name = json.name;
    }

    if (line.match(/\W*(CFE[(])\W*/)) {
      let json = await textSanitizer.classViennaTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(NCL[(])\W*/)) {
      let json = await textSanitizer.listNiceClassTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(Clas.Prod\/Serv:)\W*/)) {
      let json = await textSanitizer.nationalClassTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(Prior[.][:])\W*/)) {
      let json = await textSanitizer.unionistPriorityTrap(line);
      Object.assign(data, json);
    }

    if (line.match(/\W*(Apostila[:])\W*/)) {
      let json = await textSanitizer.handoutTrap(line);
      Object.assign(data, json);
    }

    if (line.length === 0 && data['processNumber']) {
      data.magazineDate = moment(magazineDate, 'DD/MM/YYYY').format('YYYY/MM/DD');
      data.magazineNumber = magazineNumber;
      data.brand = brand;

      processList.push(data);
      data = new Object();
    }
  }

  for (let proc of processList) {
    await dbMethods.createBrand(proc);
  }

  await dbMethods.createPublication({
    magazineNumber: magazineNumber,
    magazineDate: moment(magazineDate, 'DD/MM/YYYY').format('YYYY/MM/DD'),
  });
  console.warn(`---- REVISTA ${magazineNumber} IMPORTADA -----`);
};

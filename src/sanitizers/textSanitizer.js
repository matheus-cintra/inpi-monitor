const moment = require('moment');

module.exports = {
  headerTrap: headerTrap,
  holderTrap: holderTrap,
  brandTrap: brandTrap,
  attorneyTrap: attorneyTrap,
  classViennaTrap: classViennaTrap,
  presentationTrap: presentationTrap,
  nationalClassTrap: nationalClassTrap,
  listNiceClassTrap: listNiceClassTrap,
  unionistPriorityTrap: unionistPriorityTrap,
  handoutTrap: handoutTrap,
};

async function headerTrap(doc) {
  const data = new Object();
  let sp = await doc.split(' ').filter(i => i != '');

  for await (let item of sp) {
    if (item.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) data.depositDate = moment(item, 'DD/MM/YYYY').format('YYYY/MM/DD');

    if (item.match(/\d{3}/) && item.length === 3) data.dispatchCode = { code: sp[2] };

    if (item.match(/\W*(No[.])\W*/)) data.processNumber = await item.replace(/\D+/g, '').toString();
  }
  return data;
}

async function holderTrap(doc) {
  const data = new Object();
  let sp = doc.split('.');
  sp.splice(0, 1);
  data.holders = { holder: sp.join(' ') };
  return data;
}

async function brandTrap(doc) {
  let sp = doc.split(' ');
  sp.splice(0, 1);
  return sp.join(' ').toString();
}

async function attorneyTrap(doc) {
  let data = new Object();
  data.attorney = doc.replace(/\W*(Procurador[:])\W*/g, '');
  return data;
}

async function presentationTrap(doc) {
  const data = new Object();
  let sp = doc.split(';');
  data.presentation = sp[0].replace(/\W*(Apres.:)\W*/g, '');
  if (sp[1].lenth > 0) {
    data.nature = sp[1].replace(/\W*(Nat.:)\W*/g, '');
  }
  return data;
}

async function classViennaTrap(doc) {
  const data = new Object();
  let vienna = new Object();

  if (!doc.match(/\W*(\*POR)\W*/)) {
    let sp = doc.split(' ');
    let edition = sp[0].match(/[0-9]/);

    if (edition && edition.length > 0) vienna.edition = edition[0];

    sp.splice(0, 1);

    if (sp.length < 2) {
      vienna.viennaClass = { code: sp.toString() };
    } else {
      vienna.viennaClass = [];
      for (let i of sp) {
        vienna.viennaClass.push({ code: i });
      }
    }
    data.viennaClass = vienna;
    return data;
  } else {
    return undefined;
  }
}

async function listNiceClassTrap(doc) {
  const data = new Object();
  let sp = doc.split(' ');

  sp.splice(0, 1);
  let code = await sp[0];
  sp.splice(0, 1);

  data.listNiceClass = {
    niceClass: {
      code: code,
      especification: sp.join(' '),
    },
  };

  return data;
}

async function nationalClassTrap(doc) {
  const data = new Object();

  let formatedItem = doc.replace(/[^A-Za-z0-9. ]/g, '');
  let sp = formatedItem.split(' ').filter(n => n !== '');
  sp.splice(0, 1);

  let _natCode = sp.join('.').split('.');

  let code = _natCode[0];
  let subNatCode = _natCode.filter(n => n != code);

  if (subNatCode.length < 2) {
    subNatCode = { code: subNatCode[0] };
  } else {
    let _subNat = [];

    for (let sub of subNatCode) {
      _subNat.push({ code: sub });
    }
    subNatCode = _subNat;
  }
  data.nationalClass = {
    code: code,
    subNationalClass: subNatCode,
  };
  return data;
}

async function unionistPriorityTrap(doc) {
  const data = new Object();

  let sp = doc.split(' ').filter(n => n !== '');
  let requestNumber = sp[0].replace(/[a-zA-z.:]/g, '');

  const requestDate = sp[1];
  const country = sp[2];

  let unionistPriority = {
    RequestDate: requestDate,
    RequestNumber: requestNumber,
    Country: country,
  };

  data.unionistPriority = unionistPriority;
  return data;
}

function handoutTrap(doc) {
  const data = new Object();
  data.handout = doc.replace(/\W*(Apostila:)\W*/g, '');
  return data;
}

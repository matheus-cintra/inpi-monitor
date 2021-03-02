const moment = require('moment');
const dbMethods = require('../database/dbMethods');

async function xmlFilter(magazine) {
  const number = magazine['numero'];
  const date = magazine['data'];

  const process = magazine['processo'];

  for (let doc of process) {
    let data = {
      magazineNumber: number,
      magazineDate: moment(date, 'DD/MM/YYYY').format('YYYY/MM/DD'),
      processNumber: doc.numero,
      attorney: doc.procurador,
    };

    if (doc['data-deposito']) {
      data.depositDate = moment(doc['data-deposito'], 'DD/MM/YYYY').format('YYYY/MM/DD');
    }

    if (doc['data-concessao']) {
      data.grantDate = moment(doc['data-concessao'], 'DD/MM/YYYY').format('YYYY/MM/DD');
    }

    if (doc['data-vigencia']) {
      data.effectiveDate = moment(doc['data-vigencia'], 'DD/MM/YYYY').format('YYYY/MM/DD');
    }

    if (doc['marca']) {
      let brand = doc.marca,
        _brand = {};

      if (brand['nome']) _brand.name = brand.nome;

      if (brand['apresentacao']) _brand.presentation = brand.apresentacao;

      if (brand['natureza']) _brand.nature = brand.natureza;
      data.brand = _brand;
    }

    if (doc['lista-classe-nice']) {
      let _nice = doc['lista-classe-nice'];

      data.listNiceClass = {};

      if (Array.isArray(_nice['classe-nice'])) {
        data.listNiceClass.niceClass = [];

        for (let nice of _nice['classe-nice']) {
          data.listNiceClass.niceClass.push({
            code: nice.codigo,
            especification: nice.especificacao,
            status: nice.status,
          });
        }
      } else {
        data.listNiceClass.niceClass = {
          code: _nice['classe-nice'].codigo,
          especification: _nice['classe-nice'].especificacao,
          status: _nice['classe-nice'].status,
        };
      }
    }

    if (doc['classes-vienna']) {
      let _vienna = doc['classes-vienna']['classe-vienna'];
      data.viennaClasses = {};
      data.viennaClasses.edition = _vienna[0];

      if (Array.isArray(_vienna)) {
        data.viennaClasses.viennaClass = [];
        for (let code of _vienna) {
          data.viennaClasses.viennaClass.push({ code: code['codigo'] });
        }
      } else {
        data.viennaClasses.viennaClass = { code: _vienna['codigo'] };
      }
    }

    if (doc['despachos']) {
      let _dispatch = Object.values(doc['despachos']);

      data.dispatches = {};
      data.dispatches.code = _dispatch[0]['codigo'];
      data.dispatches.name = _dispatch[0]['nome'];

      if (_dispatch[0]['texto-complementar']) {
        data.dispatches.description = _dispatch[0]['texto-complementar'];
      }

      if (_dispatch[0]['protocolo']) {
        data.dispatches.protocol = {
          number: _dispatch[0].protocolo.numero,
          date: new Date(moment(_dispatch[0].protocolo.data, 'DD/MM/YYYY').format('YYYY/MM/DD')),
          serviceCode: _dispatch[0].protocolo.codigoServico,
          attorney: _dispatch[0].protocolo.procurador,
        };

        if (_dispatch[0].protocolo['requerente']) {
          data.dispatches.protocol.applicant = {};

          if (_dispatch[0].protocolo.requerente['nome-razao-social']) {
            let _companyName = _dispatch[0].protocolo.requerente['nome-razao-social'];
            if (_companyName !== null && _companyName !== undefined) {
              data.dispatches.protocol.applicant.companyName = _companyName;
            }
          }

          if (_dispatch[0].protocolo.requerente['pais']) {
            data.dispatches.protocol.applicant.country = _dispatch[0].protocolo.requerente.pais;
          }

          if (_dispatch[0].protocolo.requerente['uf']) {
            data.dispatches.protocol.applicant.state = _dispatch[0].protocolo.requerente.uf;
          }
        }
      }
    }

    if (doc['titulares']) {
      if (doc['titulares']['titular']) {
        let _holders = doc['titulares'];
        let holder = new Object();

        if (_holders.titular['nome-razao-social']) holder.companyName = _holders.titular['nome-razao-social'];

        if (_holders.titular['pais']) holder.country = _holders.titular['pais'];

        if (_holders.titular['uf']) holder.state = _holders.titular['uf'];

        data.holders = { holder: holder };
      }
    }

    if (doc['sobrestadores']) {
      let _overstands = doc.sobrestadores;

      data.overstands = {};

      if (Array.isArray(_overstands.sobrestador)) {
        data.overstands.overstand = [];

        for (let _overstand of _overstands.sobrestador) {
          data.overstands.overstand.push({
            process: _overstand.processo,
            brand: _overstand.marca,
          });
        }
      } else {
        data.overstands.overstand = {
          process: _overstands.sobrestador.processo,
          brand: _overstands.sobrestador.marca,
        };
      }
    }

    if (doc['prioridade-unionista']) {
      let _priority = doc['prioridade-unionista'];
      data.unionistPriority = {};

      if (Array.isArray(_priority.prioridade)) {
        data.unionistPriority.priority = [];
        for (let priority of _priority.prioridade) {
          data.unionistPriority.priority.push({
            date: new Date(moment(priority.data, 'DD/MM/YYYY').format('YYYY/MM/DD')),
            number: priority.numero,
            country: priority.pais,
          });
        }
      } else {
        data.unionistPriority.priority = {
          date: new Date(moment(_priority.prioridade.data, 'DD/MM/YYYY').format('YYYY/MM/DD')),
          number: _priority.prioridade.numero,
          country: _priority.prioridade.pais,
        };
      }
    }

    if (doc['apostila']) {
      data.handout = doc.apostila;
    }

    if (doc['classe-nacional']) {
      let _national = {};
      if (doc['classe-nacional']['codigo']) {
        _national.code = doc['classe-nacional'].codigo;
      }

      if (doc['classe-nacional']['especificacao']) {
        _national.especification = doc['classe-nacional'].especificacao;
      }

      if (doc['classe-nacional']['sub-classes-nacional']) {
        let subNatClass = Object.values(doc['classe-nacional']['sub-classes-nacional']);

        if (Array.isArray(subNatClass[0])) {
          _national.subNationalClass = [];
          for (let sub of subNatClass[0]) {
            _national.subNationalClass.push({ code: sub.codigo });
          }
        } else {
          _national.subNationalClass = { code: subNatClass[0].codigo };
        }
      }

      data.nationalClass = _national.subNationalClass;
    }

    await dbMethods.createBrand(data);
  }

  await dbMethods.createPublication({
    magazineNumber: number,
    magazineDate: moment(date, 'DD/MM/YYYY').format('YYYY/MM/DD'),
  });

  console.warn(`---- REVISTA ${number} IMPORTADA -----`);
}

module.exports = xmlFilter;

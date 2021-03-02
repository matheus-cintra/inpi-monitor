const Publications = require('../models/publications');
const Brands = require('../models/brand.model');

const findMagazineByNumber = async number => await Publications.findOne({ magazineNumber: number });

const createBrand = async brand => await Brands.create(brand);

const createPublication = async pub => await Publications.create(pub);

module.exports = {
  findMagazineByNumber,
  createBrand,
  createPublication,
};

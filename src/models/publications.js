const mongoose = require('../../config/database/database');

const PublicationSchema = new mongoose.Schema(
  {
    magazineNumber: { type: String, required: true },
    magazineDate: { type: Date, required: true },
    migrationDate: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Publications = mongoose.model('Publications', PublicationSchema);

module.exports = Publications;

const Permission = require('./permission');

module.exports = class Vendor {
  constructor({ vendorId, metadata, name, source, sourceId }) {
    this.metadata = metadata;
    this.vendorId = vendorId;
    this.name = name;
    this.source = source;
    this.sourceId = sourceId;
  }

  static async getAdmins() {
    const permissions = await Permission.get('vendors');
    return permissions.groups.admins;
  }
};

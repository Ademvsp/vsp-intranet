const Permission = require('./permission');

module.exports = class Customer {
  constructor({ customerId, metadata, name, source, sourceId }) {
    this.customerId = customerId;
    this.metadata = metadata;
    this.name = name;
    this.source = source;
    this.sourceId = sourceId;
  }

  static async getAdmins() {
    const permissions = await Permission.get('customers');
    return permissions.groups.admins;
  }
};

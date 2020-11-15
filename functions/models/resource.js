module.exports = class Resource {
  constructor({ resourceId, actions, folder, link, metadata, name }) {
    this.actions = actions;
    this.resourceId = resourceId;
    this.folder = folder;
    this.link = link;
    this.metadata = metadata;
    this.name = name;
  }
};

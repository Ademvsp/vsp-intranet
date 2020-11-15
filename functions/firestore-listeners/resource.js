const { runtimeOptions, region } = require('../utils/function-parameters');
const Resource = require('../models/resource');
const functions = require('firebase-functions');
const CollectionData = require('../models/collection-data');

module.exports.resourceCreateListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('resources/{resourceId}')
  .onCreate(async (doc, context) => {
    const { resourceId } = context.params;
    const resource = new Resource({
      resourceId: resourceId,
      ...doc.data()
    });
    await CollectionData.addCollectionData({
      document: 'resources',
      docId: resource.resourceId
    });
  });

module.exports.resourceDeleteListener = functions
  .region(region)
  .runWith(runtimeOptions)
  .firestore.document('resources/{resourceId}')
  .onDelete(async (doc, context) => {
    const { resourceId } = context.params;
    const resource = new Resource({
      resourceId: resourceId,
      ...doc.data()
    });
    await CollectionData.deleteCollectionData({
      document: 'resources',
      docId: resource.resourceId
    });
  });

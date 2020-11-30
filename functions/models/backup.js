const sizeOf = require('firestore-size');
const { format } = require('date-fns');
const admin = require('firebase-admin');
const { DATE_STRING } = require('../utils/date');
const { utcToZonedTime } = require('date-fns-tz');
const { timeZone } = require('../utils/function-parameters');
const docRef = admin.firestore().collection('app-data').doc('backup');

module.exports = class Backup {
  constructor({ collections }) {
    this.collections = collections;
  }

  static async get() {
    const doc = await docRef.get();
    const backup = new Backup({ collections: doc.data().collections });
    return backup;
  }

  async create() {
    const zonedDate = utcToZonedTime(new Date(), timeZone);
    const backupName = format(zonedDate, DATE_STRING);
    const startTime = new Date();
    const collectionCounts = {};
    const backupDocRef = admin
      .firestore()
      .collection('backups')
      .doc(backupName);
    let promises = [];
    for (const collection of this.collections) {
      //Extract all the collection data
      promises.push(admin.firestore().collection(collection).get());
    }
    const collectionData = await Promise.all(promises);
    //Re-initialize promises and start batch
    promises = [];
    let batch = admin.firestore().batch();
    let documentCount = 0;
    let batchCount = 0;
    let totalSize = 0;
    //Loop through each collection
    for (const [index, collection] of collectionData.entries()) {
      let collectionSize = 0;
      //Loop through each document
      for (const doc of collection.docs) {
        const docRef = backupDocRef
          .collection(this.collections[index])
          .doc(doc.id);
        batch.set(docRef, doc.data());
        //Increment collection collectionSize
        collectionSize += sizeOf(doc.data());
        //Increment document counts
        batchCount++;
        documentCount++;
        if (batchCount === 500) {
          promises.push(batch.commit());
          batchCount = 0;
          batch = admin.firestore().batch();
        }
      }
      //Update the counts of each collection
      collectionCounts[this.collections[index]] = {
        documents: collection.docs.length,
        size: collectionSize
      };
      //Increment the total collectionSize of all collections
      totalSize += collectionSize;
    }
    //Do a final batch commit for any leftover documents
    promises.push(batch.commit());
    await Promise.all(promises);
    const endTime = new Date();
    await backupDocRef.set({
      startTime: startTime,
      endTime: endTime,
      elapsedTime: endTime.getTime() - startTime.getTime(),
      documents: documentCount,
      collections: collectionCounts,
      size: totalSize
    });
  }
};

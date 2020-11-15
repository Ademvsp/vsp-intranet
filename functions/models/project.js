const { setMinutes, subHours, addDays } = require('date-fns');
const admin = require('firebase-admin');
const { scheduleHour } = require('../utils/function-parameters');
const collectionRef = admin.firestore().collection('projects');
module.exports = class Project {
  constructor({
    projectId,
    actions,
    attachments,
    comments,
    customer,
    description,
    metadata,
    name,
    owners,
    reminder,
    user,
    value,
    vendors
  }) {
    this.projectId = projectId;
    this.actions = actions;
    this.attachments = attachments;
    this.comments = comments;
    this.customer = customer;
    this.description = description;
    this.metadata = metadata;
    this.name = name;
    this.owners = owners;
    this.reminder = reminder;
    this.user = user;
    this.value = value;
    this.vendors = vendors;
  }

  getDatabaseObject() {
    const databaseObject = { ...this };
    delete databaseObject.projectId;
    return databaseObject;
  }

  static async getDayReminderProjects(date) {
    //Bring time back to midnight by subtracting the scheduled hour offset
    const startOfDay = setMinutes(subHours(date, scheduleHour), 0);
    const endOfDay = addDays(startOfDay, 1);
    const collection = await collectionRef
      .where('reminder', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
      .where('reminder', '<', admin.firestore.Timestamp.fromDate(endOfDay))
      .get();
    const events = collection.docs.map(
      (doc) => new Project({ projectId: doc.id, ...doc.data() })
    );
    return events;
  }

  async save() {
    if (this.projectId) {
      await collectionRef.doc(this.projectId).update(this.getDatabaseObject());
    }
  }
};

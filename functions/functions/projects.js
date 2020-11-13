const User = require('../models/user');
const Notification = require('../models/notification');
const { PROJECT_REMINDER } = require('../data/notification-types');
const Project = require('../models/project');
const { toCurrency } = require('../utils/data-transformer');

module.exports.sendProjectReminders = async () => {
  const todayProjects = await Project.getDayReminderProjects(new Date());
  let promises = [];
  //Get unique list of project owners
  const uniqueProjectOwners = [];
  for (const project of todayProjects) {
    for (const owner of project.owners) {
      if (!uniqueProjectOwners.includes(owner)) {
        uniqueProjectOwners.push(owner);
      }
    }
  }
  //Retrieve owner user objects to get each full name;
  for (const owner of uniqueProjectOwners) {
    promises.push(User.get(owner));
  }
  const users = await Promise.all(promises);
  promises = [];
  //Loop through each project and generate the notifications
  for (const project of todayProjects) {
    const action = [...project.actions].pop();

    let recipients = [...project.owners];
    const uniqueRecipients = [...new Set(recipients)];
    const notifications = [];

    const ownerUsers = users.filter((user) =>
      project.owners.includes(user.userId)
    );

    const emailData = {
      attachments: project.attachments,
      name: project.name,
      description: project.description,
      customer: project.customer.name,
      vendors: project.vendors.map((vendor) => vendor.name).join(', '),
      owners: ownerUsers.map((owner) => owner.getFullName()).join(', '),
      status: action.actionType,
      value: toCurrency(project.value)
    };
    const metadata = {
      createdAt: new Date(),
      createdBy: project.user,
      updatedAt: new Date(),
      updatedBy: project.user
    };

    for (const recipient of uniqueRecipients) {
      const notification = new Notification({
        emailData: emailData,
        link: `/projects/${project.projectId}`,
        metadata: metadata,
        page: 'Projects',
        recipient: recipient,
        title: `Project reminder for "${project.name}"`,
        type: PROJECT_REMINDER
      });
      notifications.push(notification);
    }
    promises.push(Notification.saveAll(notifications));
  }
  await Promise.all(promises);
};

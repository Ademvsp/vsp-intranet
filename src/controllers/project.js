import Message from '../models/message';
import Project from '../models/project';
import Notification from '../models/notification';
import { SET_MESSAGE } from '../utils/actions';
import {
	DIALOG,
	SNACKBAR,
	SNACKBAR_SEVERITY,
	SNACKBAR_VARIANTS
} from '../utils/constants';
import { toCurrency } from '../utils/data-transformer';
import * as fileUtils from '../utils/file-utils';
import {
	EDIT_PROJECT,
	NEW_PROJECT,
	NEW_PROJECT_COMMENT
} from '../utils/notification-types';
import { getServerTimeInMilliseconds } from '../utils/firebase';

export const addProject = (values, notifyUsers, attachments) => {
	return async (dispatch, getState) => {
		const {
			name,
			description,
			customer,
			vendors,
			owners,
			status,
			reminder,
			value
		} = values;
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		let newProject;
		try {
			newProject = new Project({
				projectId: null,
				attachments: [],
				comments: [],
				customer: { ...customer },
				description: description.trim(),
				metadata: null,
				name: name.trim(),
				owners: owners.map((owner) => owner.userId),
				reminder: reminder,
				status: status.statusId,
				value: value,
				vendors: vendors.map((vendor) => ({ ...vendor }))
			});
			await newProject.save();
			if (attachments.length > 0) {
				const uploadedAttachments = await dispatch(
					fileUtils.upload({
						files: attachments,
						collection: 'projectsNew',
						collectionId: newProject.projectId,
						folder: newProject.metadata.createdAt.getTime().toString()
					})
				);
				newProject.attachments = uploadedAttachments;
				await newProject.save();
			}
			const message = new Message({
				title: 'Projects',
				body: 'Project added successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Pojects',
				body: 'Failed to add project',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					newProject.owners.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
					const emailData = {
						attachments: newProject.attachments,
						name: newProject.name,
						description: newProject.description,
						customer: newProject.customer.name,
						vendors: newProject.vendors.map((vendor) => vendor.name).join(', '),
						owners: owners
							.map((owner) => `${owner.firstName} ${owner.lastName}`)
							.join(', '),
						status: status.name,
						value: toCurrency(newProject.value)
					};
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification({
						emailData: emailData,
						link: `/projects/${newProject.projectId}`,
						page: 'Projects',
						recipient: transformedRecipient,
						title: `Project "${name.trim()}" created by ${senderFullName}`,
						type: NEW_PROJECT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const editProject = (project, values, notifyUsers, attachments) => {
	return async (dispatch, getState) => {
		const {
			name,
			description,
			customer,
			vendors,
			owners,
			status,
			reminder,
			value
		} = values;
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		//Handle any attachment deletions
		let existingAttachments = await fileUtils.compareAndDelete({
			oldAttachments: project.attachments,
			newAttachments: attachments.filter(
				(attachment) => !(attachment instanceof File)
			),
			collection: 'projectsNew',
			collectionId: project.projectId,
			folder: project.metadata.createdAt.getTime().toString()
		});
		//Handle new attachments to be uploaded
		const toBeUploadedAttachments = attachments.filter(
			(attachment) => attachment instanceof File
		);
		let uploadedAttachments = [];
		if (toBeUploadedAttachments.length > 0) {
			uploadedAttachments = await dispatch(
				fileUtils.upload({
					files: toBeUploadedAttachments,
					collection: 'projectsNew',
					collectionId: project.projectId,
					folder: project.metadata.createdAt.getTime().toString()
				})
			);
		}

		let newProject;
		try {
			newProject = new Project({
				projectId: project.projectId,
				attachments: [...existingAttachments, ...uploadedAttachments],
				comments: project.comments,
				customer: { ...customer },
				description: description.trim(),
				metadata: project.metadata,
				name: name.trim(),
				owners: owners.map((owner) => owner.userId),
				reminder: reminder,
				status: status.statusId,
				value: value,
				vendors: vendors.map((vendor) => ({ ...vendor }))
			});
			await newProject.save();
			const message = new Message({
				title: 'Projects',
				body: 'Project updated successfully',
				feedback: SNACKBAR,
				options: {
					duration: 3000,
					variant: SNACKBAR_VARIANTS.FILLED,
					severity: SNACKBAR_SEVERITY.SUCCESS
				}
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
		} catch (error) {
			const message = new Message({
				title: 'Pojects',
				body: 'Failed to update project',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					newProject.owners.includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
					const emailData = {
						attachments: newProject.attachments,
						name: newProject.name,
						description: newProject.description,
						customer: newProject.customer.name,
						vendors: newProject.vendors.map((vendor) => vendor.name).join(', '),
						owners: owners
							.map((owner) => `${owner.firstName} ${owner.lastName}`)
							.join(', '),
						status: status.name,
						value: toCurrency(newProject.value)
					};
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification({
						emailData: emailData,
						link: `/projects/${newProject.projectId}`,
						page: 'Projects',
						recipient: transformedRecipient,
						title: `Project "${name.trim()}" updated by ${senderFullName}`,
						type: EDIT_PROJECT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const addComment = (project, body, attachments, notifyUsers) => {
	return async (dispatch, getState) => {
		const { authUser } = getState().authState;
		const { users } = getState().dataState;
		let uploadedAttachments;
		try {
			const serverTime = await getServerTimeInMilliseconds();
			uploadedAttachments = [];
			if (attachments.length > 0) {
				uploadedAttachments = await dispatch(
					fileUtils.upload({
						files: attachments,
						collection: 'projectsNew',
						collectionId: project.projectId,
						folder: serverTime.toString()
					})
				);
			}
			await project.addComment(body.trim(), uploadedAttachments, serverTime);
		} catch (error) {
			const message = new Message({
				title: 'Projects',
				body: 'Comment failed to post',
				feedback: DIALOG
			});
			dispatch({
				type: SET_MESSAGE,
				message
			});
			return false;
		}
		//Send notification, do nothing if this fails so no error is thrown
		try {
			const recipients = users.filter(
				(user) =>
					project.owners.map((owner) => owner.userId).includes(user.userId) ||
					notifyUsers.includes(user.userId)
			);
			if (recipients.length > 0) {
				const notifications = [];
				for (const recipient of recipients) {
					const senderFullName = `${authUser.firstName} ${authUser.lastName}`;
					const emailData = {
						commentBody: body.trim(),
						attachments: uploadedAttachments,
						name: project.name
					};
					const transformedRecipient = {
						userId: recipient.userId,
						email: recipient.email,
						firstName: recipient.firstName,
						lastName: recipient.lastName,
						location: recipient.location.locationId
					};
					const notification = new Notification({
						notificationId: null,
						emailData: emailData,
						link: `/projects/${project.projectId}`,
						page: 'Projects',
						recipient: transformedRecipient,
						title: `Project "${project.name}" New comment from ${senderFullName}`,
						type: NEW_PROJECT_COMMENT
					});
					notifications.push(notification);
				}
				await Notification.saveAll(notifications);
			}
			return true;
		} catch (error) {
			return true;
		}
	};
};

export const getListener = (userId) => {
	return Project.getListener(userId);
};

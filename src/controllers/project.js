import Project from '../models/project';

let projectsListener;

// export const subscribeProjectsListener = (userId) => {
// 	return (dispatch, getState) => {
// 		try {
// 			unsubscribeProjectsListener();
// 			projectsListener = Project.getListener().onSnapshot((snapshot) => {
// 				const projects = snapshot.docs.map((doc) => {
// 					const metadata = {
// 						...doc.data().metadata,
// 						createdAt: doc.data().metadata.createdAt.toDate(),
// 						updatedAt: doc.data().metadata.updatedAt.toDate()
// 					};
// 					return new Project({
// 						...doc.data(),
// 						projectId: doc.id,
// 						metadata: metadata,
// 						reminder: doc.data().reminder.toDate()
// 					});
// 				});
// 				dispatch({
// 					type: SET_EVENTS,
// 					events
// 				});
// 			});
// 		} catch (error) {}
// 	};
// };

export const getListener = (userId) => {
	return Project.getListener(userId);
};

export const unsubscribeProjectsListener = () => {
	if (projectsListener) {
		projectsListener();
	}
};

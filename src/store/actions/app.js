import App from '../../models/app';
import { SET_SERVER_BUILD } from '../../utils/actions';

let buildListener;

export const subscribeBuildListener = () => {
  return async (dispatch, _getState) => {
    buildListener = App.getBuildListener().onSnapshot((snapshot) => {
      const app = new App({
        build: snapshot.data()
      });
      const history = app.build.history;
      const serverBuild = history.pop();
      dispatch({
        type: SET_SERVER_BUILD,
        serverBuild: serverBuild
      });
    });
  };
};

export const unsubscribeBuildListener = () => {
  if (buildListener) {
    buildListener();
  }
};

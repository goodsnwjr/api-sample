import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

// redux-devtools setup
const composeEnhancers = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose);

// configure redux store
const configureStore = () => {
  const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunk)
  ));

  // webpack: hot module replacement (HMR)
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};

// export store
export default configureStore();

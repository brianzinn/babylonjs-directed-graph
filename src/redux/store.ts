import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from 'redux-saga'
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from "./reducers";
import mySaga from './sagas'

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()

export default createStore(
    rootReducer,
    composeWithDevTools(
        applyMiddleware(sagaMiddleware)
    ),
    
);

// then run the saga
sagaMiddleware.run(mySaga)
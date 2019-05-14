import { Store } from './redux/redux';

import { todoReducer } from './reducer';
import { TodoState, initialState } from './state';

const todoStore: Store<TodoState> = new Store<TodoState>(todoReducer, initialState);
import { Reducer } from '../redux/types';

import { initialState, TodoState } from './state';
import {
    TodoActionEnum, TodoAction,
    AddTodoAction, RemoveTodoAction, ToggleTodoAction
} from './action';

export const todoReducer: Reducer<TodoState> = (
    state: TodoState = initialState,
    action: TodoAction
): TodoState => {
    switch (action.type) {
        case TodoActionEnum.AddTodo:
            return {
                todos: [
                    ...state.todos,
                    (<AddTodoAction>action).payload
                ]
            };
        
        case TodoActionEnum.RemoveTodo:
            return {
                todos: state.todos.filter(({ id }) => id !== (<RemoveTodoAction>action).payload.id)
            };
        
        case TodoActionEnum.ToggleTodo:
            return {
                todos: state.todos.map(
                    todo => {
                        return (<ToggleTodoAction>action).payload.id === todo.id ? ({
                            ...todo,
                            isComplete: !todo.isComplete
                        }) :
                        todo;
                    }
                )
            };
    
        default:
            return state;
    }
}
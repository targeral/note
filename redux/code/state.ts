export interface Todo {
    id: string;
    todo: string;
    isComplete: boolean
}

export interface TodoState {
    todos: Array<Todo>
}

export const initialState: TodoState = { todos: [] }

const todoStore: Store<TodoState> = new Store<TodoState>(todoReducer, initialState);

// DOM selector declaration + event handler
const todoListElem = document.querySelector('.todo-list') as HTMLUListElement;
const addButtonElem = document.querySelector('.add-button') as HTMLButtonElement;
const todoInputElem = document.querySelector('.todo-input') as HTMLInputElement;

// handling the rendering part
// listener callback subscribed to the store to handle data change
todoStore.subscribe(() => {
    const { todos } = todoStore.getState();
    todoListElem.innerHTML = !!todos.length ?
        todos.map(
            ({ id, todo, isComplete }) => {
                return `<li id="${id}" class="${isComplete ? 'strike-out' : ''}">
                          ${todo} | <a id="${id}" href="javascript:void(0)">delete</a>
                        </li>`;
            }
        ).join('') : `<li>No todos found</li>`;
});

// listener to handle todo removal and toggle
todoListElem.addEventListener('click', ({ target }: MouseEvent) => {
    const elem = target as HTMLElement;
    switch (elem.tagName.toLowerCase()) {
        case 'li': {
            const id = elem.getAttribute('id');
            // action dispatched to the store
            todoStore.dispatch(new ToggleTodoAction({ id }));
            break;
        }
        case 'a': {
            const id = elem.getAttribute('id');
            // action dispatched to the store
            todoStore.dispatch(new RemoveTodoAction({ id }));
            break;
        }
    }
    return;
}, false);

// listener to add input
addButtonElem.addEventListener('click', (e) => {
    const text = todoInputElem.value.trim();
    if (text) {
        const todo: Partial<Todo> = {
            id: nanoid(), // external third party api to produce unique id
            todo: text
        };
        // action dispatched to the store
        todoStore.dispatch(new AddTodoAction(todo));
        todoInputElem.value = '';
    }
    return;
});
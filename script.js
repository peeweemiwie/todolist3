const input = document.querySelector('[data-text-input]');
const form = document.querySelector('[data-form]');
const ulSaved = document.querySelector('[data-lists-saved]');
const ulCompleted = document.querySelector('[data-lists-completed]');
const draggables = document.querySelectorAll('.draggable');
const containers = document.querySelectorAll('.container');
const LOCAL_STORAGE_KEY = 'todo.lists';
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

const clear = element => {
	while (element.firstChild) element.removeChild(element.firstChild);
};

const save = () => {
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
};

const render = () => {
	clear(ulSaved);
	clear(ulCompleted);
	console.log(lists);

	lists.forEach(list => {
		const template = document.querySelector('#template');
		const cloned = document.importNode(template.content, true);
		const li = cloned.querySelector('li');
		const task = cloned.querySelector('[data-task]');
		const checkbox = cloned.querySelector('input');
		task.value = list.task;
		li.setAttribute('data-title', list.task);
		li.setAttribute('data-id', list.id);
		li.setAttribute('data-completed', list.isCompleted);
		li.setAttribute('data-index', lists.indexOf(list));
		li.addEventListener('dragstart', dragStart);
		li.addEventListener('dragend', dragEnd);
		checkbox.checked = list.isCompleted;
		list.isCompleted ? ulCompleted.append(li) : ulSaved.append(li);
	});
};

function dragStart() {
	this.classList.add('dragging');
}
function dragEnd() {
	this.classList.remove('dragging');
}

containers.forEach(container => {
	container.addEventListener('dragover', e => {
		e.preventDefault();
		const afterElement = getDragAfterElement(container, e.clientY);
		const draggable = document.querySelector('.dragging');
		if (afterElement == null) {
			container.append(draggable);
		} else {
			container.insertBefore(draggable, afterElement);
		}
	});
});

const getDragAfterElement = (container, y) => {
	const draggaleElements = [
		...container.querySelectorAll('.draggable:not(.dragging)'),
	];
	return draggaleElements.reduce(
		(closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > closest.offset)
				return { offset: offset, element: child };
			else return closest;
		},
		{ offset: Number.NEGATIVE_INFINITY },
	).element;
};

const toggleUl = (li, isChecked) => {
	if (isChecked) {
		ulCompleted.append(li);
	} else {
		ulSaved.append(li);
	}
};

const toggleComplete = (element, id) => {
	const list = lists.find(list => list.id === id);
	const li = element.closest('li');
	const isChecked = element.checked; // boolean
	li.setAttribute('data-completed', isChecked);
	list.isCompleted = isChecked;
	save();
	toggleUl(li, isChecked);
	console.log(element, lists);
};

const deleteTask = id => {
	lists = lists.filter(list => list.id !== id);
	save();
	render();
};

const updateTask = (id, element) => {
	const list = lists.find(list => list.id === id);
	element.addEventListener('keyup', () => {
		list.task = element.value;
		save();
	});
};

const handleClick = e => {
	const element = e.target;
	const id = element.closest('li').getAttribute('data-id');
	if (element.hasAttribute('data-complete')) toggleComplete(element, id);
	else if (element.hasAttribute('data-delete')) deleteTask(id);
	else if (element.hasAttribute('data-task')) updateTask(id, element);
	else return;
};

const createList = value => {
	return {
		id: Date.now().toString(),
		task: value,
		isCompleted: false,
		index: lists.length,
	};
};

const handleSubmit = e => {
	e.preventDefault();
	const inputValue = input.value;
	const newTask = createList(inputValue);
	lists.push(newTask);
	input.value = '';
	save();
	render();
};

form.addEventListener('submit', e => handleSubmit(e));
ulSaved.addEventListener('click', e => handleClick(e));
ulCompleted.addEventListener('click', e => handleClick(e));
render();

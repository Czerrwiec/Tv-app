import { mapListToDOMElements } from './dominteractions.js';

const mainBtn = document.querySelector('.main-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');

mainBtn.addEventListener('click', () => {
	dropdownMenu.classList.toggle('transform-class');
});

class TvMaze {
	constructor() {
		this.viewElems = {};
		this.showNameButtons = {};
		this.selectedName = 'harry';
		this.initializeApp();
	}

	initializeApp = () => {
		this.connectDOMElements();
		this.setupListeners();
	};

	connectDOMElements = () => {
		const listOfIds = Array.from(document.querySelectorAll('[id]')).map(
			(elem) => elem.id
		);
		const listOfGenre = Array.from(
			document.querySelectorAll('[data-genre]')
		).map((elem) => elem.dataset.genre);

		this.viewElems = mapListToDOMElements(listOfIds, 'id');
		this.showNameButtons = mapListToDOMElements(listOfGenre, 'data-genre');
		console.log(this.viewElems);
		console.log(this.showNameButtons);
	};

	setupListeners = () => {
		Object.keys(this.showNameButtons).forEach((genre) =>
			this.showNameButtons[genre].addEventListener(
				'click',
				this.setCurrentFilterByName
			)
		);
	};

	setCurrentFilterByName = (e) => {
		this.selectedName = e.target.dataset.genre
	}

}

document.addEventListener('DOMContentLoaded', new TvMaze());

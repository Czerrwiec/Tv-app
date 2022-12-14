import { mapListToDOMElements, createDOMElem } from './dominteractions.js';
import { getShowsByKey } from './requests.js';

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
		this.fetchAndDisplayShows();
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
		this.selectedName = e.target.dataset.genre;
	};

	fetchAndDisplayShows = () => {
		getShowsByKey(this.selectedName).then((shows) => this.renderCards(shows));
	};

	// <div class="card">
	// 	<img src="" alt="" class="card-img">
	// 	<div class="card-text">
	// 		<h5 class="card-title">Tytuł karty</h5>
	// 		<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, iste? Lorem ipsum dolor sit.</p>
	// 	</div>
	// 	<button class="card-btn drop-btn">Show</button>
	// </div>

	renderCards = (shows) => {
		for (const { show } of shows) {
			this.createShowCard(show)
		}
	};

	createShowCard = (show) => {
		const summaryAfter = show.summary.replace(/[<p>/]/g, '');

		const divCard = createDOMElem('div', 'card');
		const img = createDOMElem('img', 'card-img', null, show.image.medium);
		const cardText = createDOMElem('div', 'card-text');
		const h = createDOMElem('h5', 'card-title', show.name);
		const paragraph = createDOMElem('p', null, summaryAfter);
		const button = createDOMElem('button', 'drop-btn card-btn', 'Show');

		divCard.append(img, cardText, button);
		cardText.append(h, paragraph);

		this.viewElems.showsWrapper.append(divCard);
	};
}

document.addEventListener('DOMContentLoaded', new TvMaze());

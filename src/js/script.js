import { mapListToDOMElements, createDOMElem } from './dominteractions.js';
import { getShowById, getShowsByKey } from './requests.js';

const mainBtn = document.querySelector('.main-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');

mainBtn.addEventListener('click', () => {
	dropdownMenu.classList.toggle('transform-class');
});

class TvMaze {
	constructor() {
		this.viewElems = {};
		this.showNameButtons = {};
		this.selectedName = 'speed';
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
		this.fetchAndDisplayShows();
	};

	fetchAndDisplayShows = () => {
		getShowsByKey(this.selectedName).then((shows) =>
			this.renderCardsOnList(shows)
		);
	};

	renderCardsOnList = (shows) => {
		Array.from(document.querySelectorAll('[data-show-id]')).forEach((btn) =>
			btn.removeEventListener('click', this.openDetailsView)
		);
		this.viewElems.showsWrapper.innerHTML = '';

		for (const { show } of shows) {
			const card = this.createShowCard(show);
			this.viewElems.showsWrapper.append(card);
		}
	};

	openDetailsView = (event) => {
		const { showId } = event.target.dataset;

		getShowById(showId).then((show) => {
			const card = this.createShowCard(show, true);
			this.viewElems.showPreview.append(card);
			this.viewElems.showPreview.style.display = 'block';
		});
	};

	closeDetailsView = (event) => {
		const { showId } = event.target.dataset;
		const closeBtn = document.querySelector(
			`[id="showPreview"] [data-show-id="${showId}"]`
		);
		closeBtn.removeEventListener('click', this.closeDetailsView);
		this.viewElems.showPreview.style.display = 'none';
		this.viewElems.showPreview.innerHTML = '';
	};

	createShowCard = (show, isDetailed) => {
		const divCard = createDOMElem('div', 'card');
		const cardText = createDOMElem('div', 'card-text');
		const h = createDOMElem('h5', 'card-title', show.name);
		const button = createDOMElem('button', 'drop-btn card-btn', 'Show');
		let paragraph;
		let img;

		if (show.summary) {
			const summaryAfter = show.summary.replace(/[<p><b>/]/g, '');
			if (isDetailed) {
				paragraph = createDOMElem('p', null, summaryAfter);
			} else {
				paragraph = createDOMElem(
					'p',
					null,
					`${summaryAfter.slice(0, 200)}...`
				);
			}
		} else {
			paragraph = createDOMElem(
				'p',
				null,
				'There is no description available.'
			);
		}

		if (show.image) {
			if (isDetailed) {
				img = createDOMElem('div', 'card-preview-bg');
				img.style.backgroundImage = `url('${show.image.original}')`;
			} else {
				img = createDOMElem('img', 'card-img', null, show.image.medium);
			}
		} else {
			img = createDOMElem(
				'img',
				'card-img',
				null,
				'https://via.placeholder.com/210x295'
			);
		}

		button.dataset.showId = show.id;

		if (isDetailed) {
			button.addEventListener('click', this.closeDetailsView);
			button.textContent = "Close"
		} else {
			button.addEventListener('click', this.openDetailsView);
		}

		divCard.append(img, cardText, button);
		cardText.append(h, paragraph);

		return divCard;
	};
}

document.addEventListener('DOMContentLoaded', new TvMaze());

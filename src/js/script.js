import { mapListToDOMElements, createDOMElem } from './dominteractions.js';
import { getShowById, getShowsByKey } from './requests.js';

class TvMaze {
	constructor() {
		this.viewElems = {};
		this.showNameButtons = {};
		this.selectedName = '';
		this.initializeApp();
		this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
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
		const mainBtn = document.querySelector('.main-btn');
		const dropdownMenu = document.querySelector('.dropdown-menu');

		mainBtn.addEventListener('click', () => {
			dropdownMenu.classList.toggle('transform-class');
		});

		dropdownMenu.addEventListener('click', () => {
			dropdownMenu.classList.remove('transform-class');
		});

		Object.keys(this.showNameButtons).forEach((genre) =>
			this.showNameButtons[genre].addEventListener(
				'click',
				this.setCurrentFilterByName
			)
		);
		this.showNameButtons.search.addEventListener(
			'click',
			this.setCurrentFilterByInput
		);
		this.viewElems.searchInput.addEventListener(
			'keydown',
			this.setCurrentFilterByInput
		);

		this.viewElems.showsWrapper.addEventListener('click', (e) => {
			let id;
			id = e.target.children[2].dataset.showId;

			if (!this.favorites.includes(id)) {
				this.favorites.push(id);
				e.target.classList.add('fav');
			} else {
				for (let i = 0; i < this.favorites.length; i++) {
					if (this.favorites[i] === id) {
						this.favorites.splice(i, 1);
						e.target.classList.remove('fav');
					}
				}
			}
			localStorage.setItem('favorites', JSON.stringify(this.favorites));
		});

		this.viewElems.favButton.addEventListener('click', (e) => {
			this.renderFavorites();
		});
	};

	setCurrentFilterByInput = () => {
		if (event.type === 'click' || event.key === 'Enter') {
			this.selectedName = this.viewElems.searchInput.value;
			this.fetchAndDisplayShows();
			this.viewElems.searchInput.value = '';
		}
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
			// if (this.favorites.includes(card.children[2].dataset.showId)) {
			// 	card.classList.add('fav');
			// }
			this.viewElems.showsWrapper.append(card);
		}
	};

	renderFavorites = (shows) => {
		this.viewElems.showsWrapper.innerHTML = '';
		shows = this.favorites;

		shows.forEach((id) => {
			getShowById(id).then((show) => {
				const card = this.createShowCard(show, false);
				card.classList.add('fav');
				this.viewElems.showsWrapper.append(card)
			});
		});
	};

	openDetailsView = (event) => {
		const { showId } = event.target.dataset;

		getShowById(showId).then((show) => {
			let genre = show.genres;
			let runtime;
			let premiered;
			let ended;

			if (genre.length > 0) {
				genre = 'Genre: ' + genre.join(', ');
			} else {
				genre = 'Genre: Unknown';
			}

			if (show.runtime) {
				runtime = 'Runtime: ' + show.runtime + 'min';
			} else {
				runtime = 'Runtime: Unknown';
			}

			if (show.premiered) {
				premiered = 'Premiered: ' + show.premiered;
			} else {
				premiered = 'Premiered: Unknown';
				ended = 'Ended: Unknown';
			}

			if (show.ended) {
				ended = 'Ended: ' + show.ended;
			} else {
				ended = 'Ended: -';
			}

			const infoDiv = createDOMElem('div', 'info-div');
			const runtimeParagraph = createDOMElem('p', 'info', runtime);
			const genreParagraph = createDOMElem('p', 'info', genre);
			const languageParagraph = createDOMElem(
				'p',
				'info',
				'Language: ' + show.language
			);
			const premieredParagraph = createDOMElem('p', 'info', premiered);
			const endedParagraph = createDOMElem('p', 'info', ended);

			infoDiv.append(
				runtimeParagraph,
				genreParagraph,
				languageParagraph,
				premieredParagraph,
				endedParagraph
			);

			const card = this.createShowCard(show, true);
			card.insertBefore(infoDiv, card.children[2]);

			card.classList.add('no-before');

			this.viewElems.showPreview.append(card);
			this.viewElems.showPreview.style.display = 'block';
			document.body.style.overflow = 'hidden';
			document.querySelector('.overlay').style.display = 'block';
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
		document.body.style.overflow = '';
		document.querySelector('.overlay').style.display = 'none';
	};

	createShowCard = (show, isDetailed) => {
		const divCard = createDOMElem('div', 'card');
		const cardText = createDOMElem('div', 'card-text');
		const h = createDOMElem('h5', 'card-title', show.name);
		const button = createDOMElem('button', 'drop-btn card-btn', 'Show');
		let paragraph;
		let img;

		if (show.summary) {
			const summaryAfter = show.summary.replace(/<\/?[^>]+(>|$)/g, '');
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
			button.textContent = 'Close';
		} else {
			button.addEventListener('click', this.openDetailsView);
		}

		divCard.append(img, cardText, button);
		cardText.append(h, paragraph);

		return divCard;
	};
}

document.addEventListener('DOMContentLoaded', new TvMaze());

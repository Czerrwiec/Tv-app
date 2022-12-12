const mainBtn = document.querySelector('.main-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');


mainBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('transform-class')
} )
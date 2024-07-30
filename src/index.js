import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const API_KEY = '45196175-3bf555e6ade361889a3ff3417';
let page = 1;
let query = '';

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value.trim();
  if (!query) {
    return Notiflix.Notify.failure('Please enter a search query.');
  }
  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('hidden');
  const images = await fetchImages(query, page);
  if (images.length === 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  renderImages(images);
  Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
  loadMoreBtn.classList.remove('hidden');
}

async function onLoadMore() {
  page += 1;
  const images = await fetchImages(query, page);
  renderImages(images);
  if (images.length < 40) {
    loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

async function fetchImages(query, page) {
  const response = await axios.get('https://pixabay.com/api/', {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: 40,
    },
  });
  return response.data.hits;
}

function renderImages(images) {
  const markup = images.map(image => {
    return `
      <a href="${image.largeImageURL}" class="photo-card">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes</b> ${image.likes}</p>
          <p class="info-item"><b>Views</b> ${image.views}</p>
          <p class="info-item"><b>Comments</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
        </div>
      </a>
    `;
  }).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  new SimpleLightbox('.gallery a').refresh();
  const { height: cardHeight } = document.querySelector('.gallery')
  .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
"use strict";

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./movie-card.js";
import { search } from "./search.js";

const movieId = window.localStorage.getItem("movieId");
const pageContent = document.querySelector("[page-content]");

sidebar();

const getGenres = function (genreList) {
  const newGenreList = [];
  for (const { name } of genreList) {
    newGenreList.push(name);
  }
  return newGenreList.join(", ");
};

const getCasts = function (castList) {
  const newCastList = [];
  for (let i = 0, len = castList.length; i < len && i < 10; i++) {
    const { name } = castList[i];
    newCastList.push(name);
  }
  return newCastList.join(", ");
};

const getDirectors = function (crewList) {
  const directors = crewList.filter(({ job }) => job === "Director");
  const directorList = [];
  for (const { name } of directors) {
    directorList.push(name);
  }
  return directorList.join(", ");
};

// returns only trailers and teasers as array
const filterVideos = function (videoList) {
  return videoList.filter(
    ({ type, site }) =>
      (type === "Trailer" || type === "Teaser") && site === "YouTube"
  );
};

const fetchArabicOverview = async (movieId) => {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/translations?api_key=${api_key}`);
  const data = await response.json();
  const translation = data.translations.find(translation => translation.iso_639_1 === 'ar');
  return translation ? translation.data.overview : '';
};

fetchDataFromServer(
  `https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&append_to_response=casts,videos,images,releases`,
  async function (movie) {
    const {
      backdrop_path,
      poster_path,
      title,
      release_date,
      runtime,
      vote_average,
      releases: {
        countries: [{ certification }],
      },
      genres,
      casts: { cast, crew },
      videos: { results: videos },
    } = movie;

    const arabicOverview = await fetchArabicOverview(movieId);
    const arabicRuntime = `${runtime} دقيقة`;
    const arabicVoteAverage = vote_average.toFixed(1);
    const arabicReleaseDate = new Date(release_date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    document.title = `${title} - FOR_U`;

    const movieDetail = document.createElement("div");
    movieDetail.classList.add("movie-detail");

    movieDetail.innerHTML = `
      <div
        class="backdrop-image"
        style="background-image: url('${imageBaseURL}${"w1280" || "original"}${
      backdrop_path || poster_path
    }');"></div>

      <figure class="poster-box movie-poster">
        <img
          src="${imageBaseURL}w342${poster_path}"
          alt="${title}"
          class="img-cover"
        />
      </figure>

      <div class="detail-box">
        <div class="detail-content">
          <h1 class="heading">${title}</h1>

          <div class="meta-list">
            <div class="meta-item">
              <img
                src="./assets/images/star.png"
                width="15"
                height="15"
                alt="rating"
                style="margin-bottom: 5px"
              />
              <span class="span">${arabicVoteAverage}</span>
            </div>

            <div class="separator"></div>
            <div class="meta-item">${arabicRuntime}</div>
            <div class="separator"></div>
            <div class="meta-item">${arabicReleaseDate}</div>

            <div class="meta-item card-badge">${certification}</div>
          </div>

          <p class="genre">${getGenres(genres)}</p>

          <p class="overview">${arabicOverview}</p>

          <ul class="detail-list">
            <div class="list-item">
              <p class="list-name">بطولة</p>
              <p>${getCasts(cast)}</p>
            </div>

            <div class="list-item">
              <p class="list-name">إخراج</p>
              <p>${getDirectors(crew)}</p>
            </div>
          </ul>
          <button id="watch-now-btn">مشاهدة الآن</button>
        </div>
        <div id="movie-player" style="display: none; position: relative;">
          <iframe id="movie-iframe" style="width: 90vw; height: 360px;" frameborder="0" allowfullscreen></iframe>
          <div id="watermark" style="
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 16px;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.7);
            background-color: rgba(0, 0, 0, 0.5);
            padding: 5px;
            border-radius: 3px;
            pointer-events: none;
            z-index: 9999;
          ">FOR_U</div>
        </div>
      </div>

      <div class="title-wrapper">
        <h3 class="title-large"
      dir="rtl">  المقاطع والعروض الترويجية</h3>
      </div>

      <div class="slider-list">
        <div class="slider-inner"></div>
      </div>
    `;

    for (const { key, name } of filterVideos(videos)) {
      const videoCard = document.createElement("div");
      videoCard.classList.add("video-card");

      videoCard.innerHTML = `
        <iframe
          width="500"
          height="294"
          src="https://www.youtube.com/embed/${key}?theme=dark&color=white&rel=0"
          frameborder="0"
          allowfullscreen="1"
          title="${name}"
          class="img-cover"
          loading="lazy"
        ></iframe>
      `;

      movieDetail.querySelector(".slider-inner").appendChild(videoCard);
    }

    pageContent.appendChild(movieDetail);

    fetchDataFromServer(
      `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${api_key}&page=1`,
      addSuggestedMovies
    );

    // Add event listener for the "Watch Now" button
    document.getElementById('watch-now-btn').addEventListener('click', function() {
      const movieIframe = document.getElementById('movie-iframe');
      const playerContainer = document.getElementById('movie-player');

      // طلب رابط الفيلم من SuperEmbed API
      const movieUrl = `https://multiembed.mov/directstream.php?video_id=${movieId}&tmdb=1`;

      // إعداد iframe مع الرابط الجديد
      movieIframe.src = movieUrl;

      // عرض مشغل الفيديو
      playerContainer.style.display = 'block';

      // تمرير الصفحة إلى مشغل الفيديو
      playerContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }
);

const addSuggestedMovies = function ({ results: movieList }, title) {
  const movieListElem = document.createElement("section");
  movieListElem.classList.add("movie-list");
  movieListElem.ariaLabel = "You May Also Like";

  movieListElem.innerHTML = `
    <div class="title-wrapper">
        <h3 class="title-large"
      dir="rtl">   قد يعجبك
        أيضاً</h3>
      </div>
  
      <div class="slider-list">
        <div class="slider-inner"></div>
      </div>
    `;

  for (const movie of movieList) {
    const movieCard = createMovieCard(movie); //called from movie_card.js

    movieListElem.querySelector(".slider-inner").appendChild(movieCard);
  }

  pageContent.appendChild(movieListElem);
};

search();
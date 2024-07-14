"use strict";

const api_key = "b949f3061a89673c1e7574209e649934";
const imageBaseURL = "https://image.tmdb.org/t/p/";

const fetchDataFromServer = function (url, callback, optionalParam) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => callback(data, optionalParam))
    .catch((error) => console.error('Error fetching data:', error));
};

export { imageBaseURL, api_key, fetchDataFromServer };
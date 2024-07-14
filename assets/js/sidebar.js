"use strict";

import { api_key, fetchDataFromServer } from "./api.js";

export function sidebar() {
  /*------
  Fetch all genres like: [{ "id": "123", "name": "Action" }]
  and convert genre format to { 123: "Action" }
  -------*/
  const genreList = {};

  fetchDataFromServer(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`,
    function ({ genres }) {
      for (const { id, name } of genres) {
        genreList[id] = name;
      }

      genreLink();
    }
  );

  const sidebarInner = document.createElement("div");
  sidebarInner.classList.add("sidebar-inner");

  sidebarInner.innerHTML = `
    <div class="sidebar-list">
      <p class="title">أنواع الأفلام</p>
    </div>
    <div class="sidebar-list">
      <p class="title">اللغة</p>
      <a href="./movie-list.html" menu-close class="sidebar-link" onClick='getMovieList("with_original_language=en", "English")'>English</a>
      <a href="./movie-list.html" menu-close class="sidebar-link" onClick='getMovieList("with_original_language=ar", "Arabic")'>Arabic</a>
    </div>
    <div class="sidebar-list">
     <p class="title">Legal</p>
<a href="s.html" menu-close class="sidebar-link">Privacy Policy</a>

<a href="W.html" menu-close class="sidebar-link">Disclaimer</a>
      
    </div>
    <div class="sidebar-footer">
      <p class="copyright">
        Copyright &copy; 2024 | All Rights Reserved. FOR_U<br>
        Content © 2024 TMDB. All Rights Reserved.
      </p>
    </div>
    <img src="./assets/images/logo1.png" width="130" height="17" alt="logo for_u" />
  `;

  const genreLink = function () {
    for (const [genreId, genreName] of Object.entries(genreList)) {
      const link = document.createElement("a");
      link.classList.add("sidebar-link");
      link.setAttribute("href", "./movie-list.html");
      link.setAttribute("menu-close", "");
      link.setAttribute(
        "onClick",
        `getMovieList("with_genres=${genreId}", "${genreName}")`
      );
      link.textContent = genreName;

      sidebarInner.querySelectorAll(".sidebar-list")[0].appendChild(link);
    }

    const sidebar = document.querySelector("[sidebar]");
    sidebar.appendChild(sidebarInner);
    toggleSidebar(sidebar);
  };

  // Toggle sidebar on small screens
  const toggleSidebar = function (sidebar) {
    const sidebarBtn = document.querySelector("[menu-btn]");
    const sidebarTogglers = document.querySelectorAll("[menu-toggler]");
    const sidebarClose = document.querySelectorAll("[menu-close]");
    const overlay = document.querySelector("[overlay]");

    addEventOnElements(sidebarTogglers, "click", function () {
      sidebar.classList.toggle("active");
      sidebarBtn.classList.toggle("active");
      overlay.classList.toggle("active");
    });

    addEventOnElements(sidebarClose, "click", function () {
      sidebar.classList.remove("active");
      sidebarBtn.classList.remove("active");
      overlay.classList.remove("active");
    });
  };

  // Helper function to add event handlers to multiple elements
  const addEventOnElements = function (elements, event, callback) {
    elements.forEach((element) => {
      element.addEventListener(event, callback);
    });
  };
}
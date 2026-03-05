document.addEventListener('DOMContentLoaded', () => {

const pokemonContainer = document.getElementById('pokemon-container');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search');
const pokemonCount = document.getElementById('pokemon-count');
const typeFilter = document.getElementById('type-filter');

const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    RENDER_BATCH: 12,
    SEARCH_DELAY: 300
};

let allPokemon = [];
let currentPage = 1;
let searchTimeout;

/* -----------------------------
   Ranking Search Engine
----------------------------- */

function rankSearchResults(list, term) {
    if (!term) return list;

    term = term.toLowerCase();

    return list.map(p => {
        let score = 0;

        if (p.name.startsWith(term)) score += 5;
        if (p.name.includes(term)) score += 3;
        if (p.id.toString() === term) score += 10;

        return { ...p, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(p => p);
}

/* -----------------------------
   Skeleton Loader
----------------------------- */

function showSkeletonLoader() {
    pokemonContainer.innerHTML = "";

    for (let i = 0; i < 8; i++) {
        const div = document.createElement("div");
        div.className = "pokemon-card skeleton";
        pokemonContainer.appendChild(div);
    }
}

/* -----------------------------
   Pagination
----------------------------- */

function paginate(list) {
    const start = (currentPage - 1) * APP_CONFIG.ITEMS_PER_PAGE;
    return list.slice(start, start + APP_CONFIG.ITEMS_PER_PAGE);
}

window.changePage = function(page) {
    currentPage = page;
    handleControlsChange();
};

/* -----------------------------
   Filtering System
----------------------------- */

function filterPokemon(list, searchTerm, selectedType) {

    let filtered = list;

    if (searchTerm) {
        const term = searchTerm.toLowerCase();

        filtered = filtered.filter(p =>
            p.name.includes(term) ||
            p.id.toString().includes(term)
        );
    }

    if (selectedType) {
        filtered = filtered.filter(p =>
            p.types.includes(selectedType)
        );
    }

    return filtered;
}

/* -----------------------------
   Sorting Engine
----------------------------- */

function sortPokemon(list, sortOption) {

    const [key, direction] = sortOption.split('-');

    return [...list].sort((a, b) => {

        let comparison = 0;

        if (key === 'id') comparison = a.id - b.id;
        if (key === 'name') comparison = a.name.localeCompare(b.name);

        return direction === 'desc' ? -comparison : comparison;
    });
}

/* -----------------------------
   Display Engine (Professional Version)
----------------------------- */

function displayPokemon(list) {

    pokemonContainer.innerHTML = "";
    showSkeletonLoader();

    const paginated = paginate(list);

    setTimeout(() => {

        pokemonContainer.innerHTML = "";

        paginated.slice(0, APP_CONFIG.RENDER_BATCH)
        .forEach(pokemon => {

            const card = document.createElement("div");
            card.className = "pokemon-card";

            const formattedId =
                `#${pokemon.id.toString().padStart(3, '0')}`;

            const types = pokemon.types.map(type =>
                `<span class="type-badge type-${type}">${type}</span>`
            ).join('');

            card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">

                    <div class="pokemon-image">
                        <img
                            src="${pokemon.image}"
                            loading="lazy"
                            alt="${pokemon.formattedName}"
                        >
                    </div>

                    <div class="pokemon-details">
                        <div class="pokemon-id">${formattedId}</div>
                        <div class="pokemon-name">${pokemon.formattedName}</div>
                        <div class="pokemon-types">${types}</div>
                    </div>

                </div>
            </div>
            `;

            pokemonContainer.appendChild(card);

        });

    }, 300);
}

/* -----------------------------
   Controls Handler
----------------------------- */

function handleControlsChange() {

    const sortOption = sortSelect.value;
    const searchTerm = searchInput.value.trim();
    const selectedType = typeFilter.value;

    let filtered = filterPokemon(allPokemon, searchTerm, selectedType);

    filtered = rankSearchResults(filtered, searchTerm);

    if ((searchTerm || selectedType) && filtered.length === 0) {
        filtered = allPokemon;
    }

    const sorted = sortPokemon(filtered, sortOption);

    displayPokemon(sorted);
    pokemonCount.textContent = filtered.length;
}

/* -----------------------------
   Fetch Pokemon Data
----------------------------- */

async function fetchPokemon() {

    showSkeletonLoader();

    try {

        const response = await fetch(
            'https://pokeapi.co/api/v2/pokemon?limit=151'
        );

        const data = await response.json();

        const pokemonDetails = await Promise.all(
            data.results.map(async (pokemon, index) => {

                const pokemonResponse = await fetch(pokemon.url);
                const pokemonData = await pokemonResponse.json();

                const speciesResponse = await fetch(pokemonData.species.url);
                const speciesData = await speciesResponse.json();

                return {
                    id: index + 1,
                    name: pokemonData.name,
                    formattedName:
                        pokemonData.name.charAt(0).toUpperCase() +
                        pokemonData.name.slice(1),

                    image:
                        pokemonData.sprites.other['dream_world'].front_default ||
                        pokemonData.sprites.other['official-artwork'].front_default ||
                        pokemonData.sprites.front_default,

                    types: pokemonData.types.map(t => t.type.name),

                    stats: pokemonData.stats.map(stat => ({
                        name: stat.stat.name,
                        value: stat.base_stat
                    })),

                    height: pokemonData.height / 10,
                    weight: pokemonData.weight / 10,
                    baseExperience: pokemonData.base_experience,

                    moves: pokemonData.moves.length,

                    habitat: speciesData.habitat?.name || 'unknown',
                    captureRate: speciesData.capture_rate,

                    flavorText:
                        speciesData.flavor_text_entries.find(
                            entry => entry.language.name === 'en'
                        )?.flavor_text || 'No description available',

                    cryUrl:
                        `https://play.pokemonshowdown.com/audio/cries/${pokemonData.name}.mp3`
                };

            })
        );

        allPokemon = pokemonDetails;

        displayPokemon(allPokemon);
        pokemonCount.textContent = allPokemon.length;

    } catch (error) {

        pokemonContainer.innerHTML =
            `<div class="error">Error loading Pokemon: ${error.message}</div>`;

        console.error(error);
    }
}

/* -----------------------------
   Event Listeners
----------------------------- */

sortSelect.addEventListener('change', handleControlsChange);
typeFilter.addEventListener('change', handleControlsChange);

searchInput.addEventListener('input', () => {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        handleControlsChange();
    }, APP_CONFIG.SEARCH_DELAY);

});
    
    function showPokemonDetails(pokemon) {
    alert(
        pokemon.name +
        "\nType: " + pokemon.type +
        "\nPower: " + pokemon.power +
        "\nOrigin: " + pokemon.origin +
        "\nStats: " + pokemon.stats +
        "\nDescription: " + pokemon.description
    );
}

    card.addEventListener("click", () => {
    showPokemonDetails(pokemonData);
});
/* -----------------------------
   Start App
----------------------------- */

fetchPokemon();

});

document.querySelectorAll(".pokemon-card").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("active");
  });
});

async function loadPokemon(){

    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=150");
    const data = await response.json();

    const container = document.querySelector(".pokemon-container");
    container.innerHTML = "";

    data.results.forEach(async pokemon=>{

        const pokeData = await fetch(pokemon.url);
        const details = await pokeData.json();

        container.innerHTML += `
        <div class="pokemon-card">
            <img src="${details.sprites.front_default}">
            <h3>${pokemon.name}</h3>
            <div class="card-info">
                <p>Power: ${details.base_experience}</p>
                <p>Height: ${details.height}</p>
            </div>
        </div>
        `;
    });
}

loadPokemon();

container.innerHTML = "Loading Pokémon...";

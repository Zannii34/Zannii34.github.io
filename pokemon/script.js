document.addEventListener("DOMContentLoaded", async () => {

/* -----------------------------
   DOM ELEMENTS
----------------------------- */

const pokemonContainer = document.getElementById("pokemon-container");
const sortSelect = document.getElementById("sort");
const searchInput = document.getElementById("search");
const pokemonCount = document.getElementById("pokemon-count");
const typeFilter = document.getElementById("type-filter");

/* -----------------------------
   APP CONFIG
----------------------------- */

const APP_CONFIG = {
    LIMIT: 151,
    ITEMS_PER_PAGE: 20,
    SEARCH_DELAY: 300
};

let allPokemon = [];
let searchTimeout;

/* -----------------------------
   Loader
----------------------------- */

function showLoader(){
    pokemonContainer.innerHTML =
        "<p style='text-align:center'>Loading Pokemon...</p>";
}

/* -----------------------------
   Display Pokemon Cards
----------------------------- */

function displayPokemon(list){

    pokemonContainer.innerHTML = "";

    list.forEach(pokemon => {

        const card = document.createElement("div");
        card.className = "pokemon-card";

        const types = pokemon.types.map(type =>
            `<span class="type-badge type-${type}">
                ${type}
            </span>`
        ).join("");

        card.innerHTML = `
            <div class="pokemon-image">
                <img src="${pokemon.image}" loading="lazy">
            </div>

            <div class="pokemon-details">
                <div class="pokemon-name">
                    ${pokemon.formattedName}
                </div>

                <div class="pokemon-types">
                    ${types}
                </div>
            </div>
        `;

        pokemonContainer.appendChild(card);

    });

    pokemonCount.textContent = list.length;
}

/* -----------------------------
   Fetch Pokemon Data
----------------------------- */

async function fetchPokemon(){

    showLoader();

    try {

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${APP_CONFIG.LIMIT}`
        );

        const data = await response.json();

        const pokemonDetails = await Promise.all(
            data.results.map(async (pokemon, index) => {

                const res = await fetch(pokemon.url);
                const pdata = await res.json();

                return {
                    id:index+1,
                    name:pdata.name,
                    formattedName:
                        pdata.name.charAt(0).toUpperCase()+
                        pdata.name.slice(1),

                    image:
                        pdata.sprites.other?.["official-artwork"]?.front_default ||
                        pdata.sprites.front_default,

                    types:pdata.types.map(t=>t.type.name)
                };

            })
        );

        allPokemon = pokemonDetails;

        displayPokemon(allPokemon);

    } catch(error){

        console.error(error);

        pokemonContainer.innerHTML =
        "<p style='color:red;text-align:center'>Failed to load Pokemon</p>";
    }
}

/* -----------------------------
   Filtering + Sorting
----------------------------- */

function filterPokemon(list, searchTerm, selectedType){

    let filtered = list;

    if(searchTerm){

        const term = searchTerm.toLowerCase();

        filtered = filtered.filter(p =>
            p.name.includes(term) ||
            p.id.toString().includes(term)
        );
    }

    if(selectedType){

        filtered = filtered.filter(p =>
            p.types.includes(selectedType)
        );
    }

    return filtered;
}

function sortPokemon(list, sortOption){

    const [key, direction] = sortOption.split("-");

    return [...list].sort((a,b)=>{

        let compare = 0;

        if(key==="id") compare = a.id - b.id;
        if(key==="name") compare = a.name.localeCompare(b.name);

        return direction==="desc" ? -compare : compare;

    });
}

/* -----------------------------
   Controls Handler
----------------------------- */

function handleControls(){

    const sortOption = sortSelect.value;
    const searchTerm = searchInput.value.trim();
    const selectedType = typeFilter.value;

    let filtered = filterPokemon(
        allPokemon,
        searchTerm,
        selectedType
    );

    let sorted = sortPokemon(filtered, sortOption);

    displayPokemon(sorted);
}

/* -----------------------------
   Events
----------------------------- */

sortSelect?.addEventListener("change", handleControls);
typeFilter?.addEventListener("change", handleControls);

searchInput?.addEventListener("input",()=>{

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(handleControls,300);

});

/* -----------------------------
   Start App
----------------------------- */

fetchPokemon();

});

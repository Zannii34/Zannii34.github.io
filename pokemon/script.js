document.addEventListener("DOMContentLoaded", () => {

/* ===============================
   DOM REFERENCES
================================= */

const pokemonContainer = document.getElementById("pokemon-container");
const sortSelect = document.getElementById("sort");
const searchInput = document.getElementById("search");
const pokemonCount = document.getElementById("pokemon-count");
const typeFilter = document.getElementById("type-filter");
const themeToggle = document.getElementById("theme-toggle");
const tutorial = document.getElementById("swipe-tutorial");
const closeTutorialBtn = document.getElementById("close-tutorial");
const teamSlots = document.getElementById("team-slots");

/* ===============================
   CONFIG
================================= */

const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    RENDER_BATCH: 12,
    SEARCH_DELAY: 300
};

const TEAM_LIMIT = 6;

/* ===============================
   STATE VARIABLES
================================= */

let allPokemon = [];
let currentPage = 1;
let searchTimeout;

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let battleSelection = [];
let pokemonTeam = JSON.parse(localStorage.getItem("pokemonTeam") || "[]");

/* ===============================
   THEME TOGGLE
================================= */

themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
});

/* ===============================
   TUTORIAL SYSTEM
================================= */

function showTutorial(){

    if(!tutorial) return;

    const seen = localStorage.getItem("tutorialSeen");

    if(window.innerWidth <= 768 && !seen){
        tutorial.style.display="flex";
        tutorial.style.opacity="1";
    }else{
        tutorial.style.display="none";
    }
}

closeTutorialBtn?.addEventListener("click",()=>{

    if(!tutorial) return;

    tutorial.style.opacity="0";

    setTimeout(()=>{
        tutorial.style.display="none";
    },400);

    localStorage.setItem("tutorialSeen","true");
});

setTimeout(showTutorial,300);

/* ===============================
   SKELETON LOADER
================================= */

function showSkeletonLoader(){

    if(!pokemonContainer) return;

    pokemonContainer.innerHTML="";

    for(let i=0;i<8;i++){
        const div=document.createElement("div");
        div.className="pokemon-card skeleton";
        pokemonContainer.appendChild(div);
    }
}

/* ===============================
   PAGINATION
================================= */

function paginate(list){

    if(!list) return [];

    const start=(currentPage-1)*APP_CONFIG.ITEMS_PER_PAGE;

    return list.slice(
        start,
        start + APP_CONFIG.ITEMS_PER_PAGE
    );
}

/* ===============================
   DISPLAY POKEMON
================================= */

function displayPokemon(list){

    if(!pokemonContainer) return;

    pokemonContainer.innerHTML="";
    showSkeletonLoader();

    const paginated = paginate(list);

    setTimeout(()=>{

        pokemonContainer.innerHTML="";

        paginated.slice(0,APP_CONFIG.RENDER_BATCH)
        .forEach(pokemon=>{

            const card=document.createElement("div");
            card.className="pokemon-card";

            const formattedId=
            `#${pokemon.id.toString().padStart(3,"0")}`;

            const types=pokemon.types.map(type=>
                `<span class="type-badge type-${type}">
                    ${type}
                </span>`
            ).join("");

            card.innerHTML=`
            <div class="card-inner">

                <div class="card-front">

                    <div class="pokemon-image">
                        <img src="${pokemon.image}" loading="lazy">
                    </div>

                    <div class="pokemon-details">

                        <div class="pokemon-id">${formattedId}</div>
                        <div class="pokemon-name">${pokemon.formattedName}</div>
                        <div class="pokemon-types">${types}</div>

                        ${pokemon.stats.map(stat=>`
                        <div class="stat">
                            <div>${stat.name.toUpperCase()}: ${stat.value}</div>
                            <div class="stat-bar">
                                <div class="stat-fill"
                                style="width:${stat.value/2}%"></div>
                            </div>
                        </div>
                        `).join("")}

                    </div>

                    <button class="fav-btn
                    ${favorites.includes(pokemon.name)?'active':''}">
                    ⭐
                    </button>

                    <button class="battle-btn">⚔️</button>

                </div>

            </div>`;

            pokemonContainer.appendChild(card);
        });

    },300);
}

/* ===============================
   SEARCH + FILTER + SORT
================================= */

function rankSearchResults(list, term){

    if(!term) return list;

    term=term.toLowerCase();

    return list.map(p=>{

        let score=0;

        if(p.name.startsWith(term)) score+=5;
        if(p.name.includes(term)) score+=3;
        if(p.id.toString()===term) score+=10;

        return {...p, score};

    })
    .filter(p=>p.score>0)
    .sort((a,b)=>b.score-a.score);
}

function filterPokemon(list, searchTerm, selectedType){

    let filtered=list;

    if(searchTerm){
        filtered=filtered.filter(p=>
        p.name.includes(searchTerm) ||
        p.id.toString().includes(searchTerm));
    }

    if(selectedType){
        filtered=filtered.filter(p=>
        p.types.includes(selectedType));
    }

    return filtered;
}

function sortPokemon(list, sortOption){

    const [key,direction]=sortOption.split("-");

    return [...list].sort((a,b)=>{

        let comparison=0;

        if(key==="id") comparison=a.id-b.id;
        if(key==="name") comparison=a.name.localeCompare(b.name);

        return direction==="desc"? -comparison:comparison;
    });
}

function handleControlsChange(){

    const searchTerm=
    searchInput?.value.trim().toLowerCase() || "";

    const selectedType=
    typeFilter?.value || "";

    const sortOption=
    sortSelect?.value || "id-asc";

    let filtered=filterPokemon(
        allPokemon,
        searchTerm,
        selectedType
    );

    filtered=rankSearchResults(filtered,searchTerm);

    if((searchTerm || selectedType) && filtered.length===0){
        filtered=allPokemon;
    }

    displayPokemon(sortPokemon(filtered,sortOption));

    pokemonCount.textContent=filtered.length;
}

/* ===============================
   FETCH POKEMON DATA
================================= */

async function fetchPokemon(){

    if(!pokemonContainer) return;

    try{

        showSkeletonLoader();

        const response=
        await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1008"
        );

        const data=await response.json();

        const pokemonDetails=[];

        for(let index=0; index<data.results.length; index++){

            const pokemon=data.results[index];

            const pokemonData=
            await (await fetch(pokemon.url)).json();

            const speciesData=
            await (await fetch(pokemonData.species.url)).json();

            pokemonDetails.push({

                id:index+1,
                name:pokemonData.name,

                formattedName:
                pokemonData.name.charAt(0).toUpperCase()+
                pokemonData.name.slice(1),

                image:
                pokemonData.sprites.other?.["dream_world"]?.front_default ||
                pokemonData.sprites.other?.["official-artwork"]?.front_default ||
                pokemonData.sprites.front_default,

                types:pokemonData.types.map(t=>t.type.name),

                stats:pokemonData.stats.map(stat=>({
                    name:stat.stat.name,
                    value:stat.base_stat
                })),

                habitat:speciesData.habitat?.name || "unknown",

                captureRate:speciesData.capture_rate || 0,

                flavorText:
                speciesData.flavor_text_entries
                ?.find(e=>e.language.name==="en")
                ?.flavor_text
                || "No description available"

            });

            if(index%25===0){
                allPokemon=[...pokemonDetails];
                displayPokemon(allPokemon);
            }
        }

        allPokemon=pokemonDetails;

        displayPokemon(allPokemon);

        pokemonCount.textContent=allPokemon.length;

    }catch(error){

        console.error(error);

        pokemonContainer.innerHTML=
        `<div class="error">
        Failed to load Pokémon data.
        </div>`;
    }
}

/* ===============================
   START APP SAFELY
================================= */

setTimeout(()=>{
    fetchPokemon();
},300);

});

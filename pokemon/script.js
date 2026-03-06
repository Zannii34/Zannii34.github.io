document.addEventListener("DOMContentLoaded", () => {

/* ===============================
   DOM References
================================= */
const pokemonContainer = document.getElementById('pokemon-container');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search');
const pokemonCount = document.getElementById('pokemon-count');
const typeFilter = document.getElementById('type-filter');
const themeToggle = document.getElementById('theme-toggle');
const tutorial = document.getElementById("swipe-tutorial");
const closeTutorialBtn = document.getElementById("close-tutorial");

/* ===============================
   Config
================================= */
const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    RENDER_BATCH: 12,
    SEARCH_DELAY: 300
};

/* ===============================
   State Variables
================================= */
let allPokemon = [];
let currentPage = 1;
let searchTimeout;

let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let battleSelection = [];
let pokemonTeam = JSON.parse(localStorage.getItem("pokemonTeam")) || [];

const TEAM_LIMIT = 6;

/* ===============================
   Theme Toggle
================================= */
themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light');
});

/* ===============================
   Tutorial System
================================= */
function showTutorial(){
    if(!tutorial) return;

    if(window.innerWidth <= 768 &&
       !localStorage.getItem("tutorialSeen")){
        tutorial.style.display = "flex";
        tutorial.style.opacity = "1";
    } else {
        tutorial.style.display = "none";
    }
}

closeTutorialBtn?.addEventListener("click", () => {

    if(!tutorial) return;

    tutorial.style.opacity = "0";

    setTimeout(()=>{
        tutorial.style.display = "none";
    },400);

    localStorage.setItem("tutorialSeen","true");
});

showTutorial();

/* ===============================
   Search Ranking
================================= */
function rankSearchResults(list, term){
    if(!term) return list;

    term = term.toLowerCase();

    return list.map(p=>{
        let score = 0;

        if(p.name.startsWith(term)) score += 5;
        if(p.name.includes(term)) score += 3;
        if(p.id.toString() === term) score += 10;

        return {...p, score};
    })
    .filter(p=>p.score>0)
    .sort((a,b)=>b.score-a.score);
}

/* ===============================
   Filtering + Sorting
================================= */
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
    const [key, direction] = sortOption.split('-');

    return [...list].sort((a,b)=>{
        let comparison = 0;

        if(key === 'id') comparison = a.id - b.id;
        if(key === 'name') comparison = a.name.localeCompare(b.name);

        return direction === 'desc' ? -comparison : comparison;
    });
}

/* ===============================
   Pagination
================================= */
function paginate(list){
    const start = (currentPage-1)*APP_CONFIG.ITEMS_PER_PAGE;
    return list.slice(start, start + APP_CONFIG.ITEMS_PER_PAGE);
}

window.changePage = function(page){
    currentPage = page;
    handleControlsChange();
};

/* ===============================
   Skeleton Loader
================================= */
function showSkeletonLoader(){
    pokemonContainer.innerHTML = "";

    for(let i=0;i<8;i++){
        const div = document.createElement("div");
        div.className="pokemon-card skeleton";
        pokemonContainer.appendChild(div);
    }
}

/* ===============================
   Display Pokémon Cards
================================= */
function displayPokemon(list){

    pokemonContainer.innerHTML="";
    showSkeletonLoader();

    const paginated = paginate(list);

    setTimeout(()=>{

        pokemonContainer.innerHTML="";

        paginated.slice(0,APP_CONFIG.RENDER_BATCH).forEach(pokemon=>{

            const card = document.createElement("div");
            card.className="pokemon-card";

            const formattedId = `#${pokemon.id.toString().padStart(3,'0')}`;

            const types = pokemon.types.map(type =>
                `<span class="type-badge type-${type}">${type}</span>`
            ).join('');

            card.innerHTML = `
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
                        </div>`).join('')}

                    </div>

                    <button class="fav-btn ${favorites.includes(pokemon.name)?'active':''}">
                        ⭐
                    </button>

                    <button class="battle-btn">⚔️</button>

                </div>
            </div>`;

            pokemonContainer.appendChild(card);
        });

        /* Animate stats */
        setTimeout(()=>{
            document.querySelectorAll(".stat-fill").forEach(bar=>{
                const width = bar.style.width;
                bar.style.width="0%";
                setTimeout(()=>bar.style.width=width,200);
            });
        },100);

    },300);
}

/* ===============================
   Controls Handler
================================= */
function handleControlsChange(){

    const sortOption = sortSelect?.value || "id-asc";
    const searchTerm = searchInput?.value.trim() || "";
    const selectedType = typeFilter?.value || "";

    let filtered = filterPokemon(allPokemon, searchTerm, selectedType);

    filtered = rankSearchResults(filtered, searchTerm);

    if((searchTerm || selectedType) && filtered.length===0){
        filtered = allPokemon;
    }

    const sorted = sortPokemon(filtered, sortOption);

    displayPokemon(sorted);

    pokemonCount.textContent = filtered.length;
}

/* ===============================
   Favorites + Battle Clicks
================================= */
pokemonContainer?.addEventListener("click", e=>{

    const card = e.target.closest(".pokemon-card");
    if(!card) return;

    const name = card.querySelector(".pokemon-name")
        .textContent.toLowerCase();

    const pokemon = allPokemon.find(p=>p.name===name);

    /* Favorite toggle */
    if(e.target.classList.contains("fav-btn")){

        if(favorites.includes(name)){
            favorites = favorites.filter(f=>f!==name);
            e.target.classList.remove("active");
        }else{
            favorites.push(name);
            e.target.classList.add("active");
        }

        localStorage.setItem("favorites",JSON.stringify(favorites));
    }

    /* Battle selection */
    if(e.target.classList.contains("battle-btn")){
        battleSelection.push(pokemon);

        if(battleSelection.length===2){
            startBattle();
            battleSelection=[];
        }
    }

    /* Double click modal */
    if(e.detail===2){
        openPokemonModal(pokemon);
    }
});

/* ===============================
   Team Builder
================================= */
const teamSlots = document.getElementById("team-slots");

function renderTeam(){

    if(!teamSlots) return;

    teamSlots.innerHTML="";

    for(let i=0;i<TEAM_LIMIT;i++){

        const slot = document.createElement("div");
        slot.className="team-slot";

        if(pokemonTeam[i]){
            slot.innerHTML = `<img src="${pokemonTeam[i].image}">`;

            slot.addEventListener("click",()=>{
                pokemonTeam.splice(i,1);
                localStorage.setItem("pokemonTeam",
                    JSON.stringify(pokemonTeam));
                renderTeam();
            });
        }

        teamSlots.appendChild(slot);
    }
}

renderTeam();

/* ===============================
   Theme Controls Events
================================= */
sortSelect?.addEventListener('change', handleControlsChange);

typeFilter?.addEventListener('change', handleControlsChange);

searchInput?.addEventListener('input',()=>{

    clearTimeout(searchTimeout);

    searchTimeout=setTimeout(()=>{
        handleControlsChange();
    },APP_CONFIG.SEARCH_DELAY);

});

document.getElementById("show-favorites")?.addEventListener("click",()=>{

    const favPokemon =
        allPokemon.filter(p=>favorites.includes(p.name));

    displayPokemon(favPokemon);
});

/* ===============================
   Start App
================================= */
fetchPokemon();

});

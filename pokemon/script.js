document.addEventListener('DOMContentLoaded', () => {

const pokemonContainer = document.getElementById('pokemon-container');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search');
const pokemonCount = document.getElementById('pokemon-count');
const typeFilter = document.getElementById('type-filter');
const themeToggle = document.getElementById('theme-toggle');

const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    RENDER_BATCH: 12,
    SEARCH_DELAY: 300
};

let allPokemon = [];
let currentPage = 1;
let searchTimeout;
let favorites = JSON.parse(localStorage.getItem('favorites')||'[]');
let battleSelection = [];

/* ===============================
   Theme Toggle
================================= */
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
});

/* ===============================
   Search & Filter System
================================= */
function rankSearchResults(list, term) {
    if(!term) return list;
    term = term.toLowerCase();
    return list.map(p => {
        let score = 0;
        if(p.name.startsWith(term)) score+=5;
        if(p.name.includes(term)) score+=3;
        if(p.id.toString() === term) score+=10;
        return {...p, score};
    }).filter(p=>p.score>0).sort((a,b)=>b.score-a.score).map(p=>p);
}

function filterPokemon(list, searchTerm, selectedType){
    let filtered = list;
    if(searchTerm){
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p=>p.name.includes(term)||p.id.toString().includes(term));
    }
    if(selectedType){
        filtered = filtered.filter(p=>p.types.includes(selectedType));
    }
    return filtered;
}

function sortPokemon(list, sortOption){
    const [key,direction] = sortOption.split('-');
    return [...list].sort((a,b)=>{
        let comparison = 0;
        if(key==='id') comparison=a.id-b.id;
        if(key==='name') comparison=a.name.localeCompare(b.name);
        return direction==='desc'? -comparison : comparison;
    });
}

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
   Pagination
================================= */
function paginate(list){
    const start=(currentPage-1)*APP_CONFIG.ITEMS_PER_PAGE;
    return list.slice(start, start+APP_CONFIG.ITEMS_PER_PAGE);
}
window.changePage = function(page){
    currentPage = page;
    handleControlsChange();
};

/* ===============================
   Display Pokémon Cards
================================= */
function displayPokemon(list){
    pokemonContainer.innerHTML="";
    showSkeletonLoader();
    const paginated = paginate(list);

    setTimeout(()=>{
        pokemonContainer.innerHTML="";
        paginated.slice(0, APP_CONFIG.RENDER_BATCH).forEach(pokemon=>{
            const card = document.createElement("div");
            card.className="pokemon-card";

            const formattedId = `#${pokemon.id.toString().padStart(3,'0')}`;

            const types = pokemon.types.map(type=>`<span class="type-badge type-${type}">${type}</span>`).join('');

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div class="pokemon-image">
                            <img src="${pokemon.image}" loading="lazy" alt="${pokemon.formattedName}">
                        </div>
                        <div class="pokemon-details">
                            <div class="pokemon-id">${formattedId}</div>
                            <div class="pokemon-name">${pokemon.formattedName}</div>
                            <div class="pokemon-types">${types}</div>
                            <div class="stats">
                                ${pokemon.stats.map(stat=>`
                                    <div class="stat">
                                        <div>${stat.name.toUpperCase()}: ${stat.value}</div>
                                        <div class="stat-bar">
                                            <div class="stat-fill" style="width:${stat.value/2}%;"></div>
                                        </div>
                                    </div>`).join('')}
                            </div>
                        </div>
                        <button class="fav-btn ${favorites.includes(pokemon.name)?'active':''}">⭐</button>
                        <button class="battle-btn">⚔️</button>
                    </div>
                </div>
            `;
            pokemonContainer.appendChild(card);
        });

        // Animate stat bars
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
    const sortOption=sortSelect.value;
    const searchTerm=searchInput.value.trim();
    const selectedType=typeFilter.value;

    let filtered=filterPokemon(allPokemon,searchTerm,selectedType);
    filtered=rankSearchResults(filtered,searchTerm);
    if((searchTerm||selectedType)&&filtered.length===0) filtered=allPokemon;
    const sorted=sortPokemon(filtered,sortOption);
    displayPokemon(sorted);
    pokemonCount.textContent=filtered.length;
}

/* ===============================
   Fetch Pokémon Data (1000+)
================================= */
async function fetchPokemon(){
    showSkeletonLoader();
    try{
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008');
        const data = await response.json();
        const pokemonDetails=[];
        for(const [index,pokemon] of data.results.entries()){
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();
            const speciesResponse = await fetch(pokemonData.species.url);
            const speciesData = await speciesResponse.json();
            // Evolution
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResponse.json();
            pokemonDetails.push({
                id:index+1,
                name:pokemonData.name,
                formattedName: pokemonData.name.charAt(0).toUpperCase()+pokemonData.name.slice(1),
                image: pokemonData.sprites.other['dream_world'].front_default ||
                       pokemonData.sprites.other['official-artwork'].front_default ||
                       pokemonData.sprites.front_default,
                types: pokemonData.types.map(t=>t.type.name),
                stats: pokemonData.stats.map(stat=>({name:stat.stat.name,value:stat.base_stat})),
                height: pokemonData.height/10,
                weight: pokemonData.weight/10,
                baseExperience: pokemonData.base_experience,
                moves: pokemonData.moves.length,
                habitat: speciesData.habitat?.name||'unknown',
                captureRate: speciesData.capture_rate,
                flavorText: speciesData.flavor_text_entries.find(e=>e.language.name==='en')?.flavor_text || 'No description available',
                cryUrl:`https://play.pokemonshowdown.com/audio/cries/${pokemonData.name}.mp3`,
                evolution: evolutionData.chain
            });
            if(index%20===0) displayPokemon(pokemonDetails);
        }
        allPokemon=pokemonDetails;
        displayPokemon(allPokemon);
        pokemonCount.textContent=allPokemon.length;
    }catch(error){
        pokemonContainer.innerHTML=`<div class="error">Error loading Pokemon: ${error.message}</div>`;
        console.error(error);
    }
}

/* ===============================
   Favorites & Battle Click
================================= */
pokemonContainer.addEventListener('click',e=>{
    const card=e.target.closest(".pokemon-card");
    if(!card) return;

    const name = card.querySelector(".pokemon-name").textContent.toLowerCase();
    const pokemon = allPokemon.find(p=>p.name===name);

    // Favorite toggle
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

    // Battle selection
    if(e.target.classList.contains("battle-btn")){
        battleSelection.push(pokemon);
        if(battleSelection.length===2){
            startBattle();
            battleSelection=[];
        }
    }

    // Open modal on double click
    if(e.detail===2){
        openPokemonModal(pokemon);
    }
});

/* ===============================
   Battle Arena
================================= */
function startBattle(){
    const [p1,p2] = battleSelection;
    const arena = document.getElementById("battle-arena");
    const fighter1 = document.getElementById("fighter1");
    const fighter2 = document.getElementById("fighter2");

    fighter1.innerHTML = `<h3>${p1.formattedName}</h3><img src="${p1.image}">`;
    fighter2.innerHTML = `<h3>${p2.formattedName}</h3><img src="${p2.image}">`;

    arena.style.display = "flex";

    setTimeout(()=>{fighter1.classList.add("attack");},800);
    setTimeout(()=>{fighter2.classList.add("attack");},1600);

    const p1Power = p1.stats.reduce((sum,s)=>sum+s.value,0);
    const p2Power = p2.stats.reduce((sum,s)=>sum+s.value,0);

    setTimeout(()=>{
        let winner;
        if(p1Power>p2Power) winner=p1.formattedName;
        else if(p2Power>p1Power) winner=p2.formattedName;
        else winner="Draw";
        alert(`Winner: ${winner}`);
    },2500);
}
document.getElementById("close-battle").addEventListener("click",()=>{
    document.getElementById("battle-arena").style.display="none";
});

/* ===============================
   Modal Popup
================================= */
const modal = document.getElementById("pokemon-modal");
const modalBody = document.getElementById("modal-body");
function openPokemonModal(pokemon){
    modalBody.innerHTML=`
        <h2>${pokemon.formattedName}</h2>
        <img src="${pokemon.image}" width="200">
        <p>${pokemon.flavorText}</p>
        <p>Height: ${pokemon.height}m | Weight: ${pokemon.weight}kg</p>
        <p>Habitat: ${pokemon.habitat}</p>
        <p>Evolution: ${pokemon.evolution.species.name}</p>
    `;
    modal.style.display="flex";
}
document.getElementById("close-modal").addEventListener("click",()=>{modal.style.display="none";});

/* ===============================
   Mobile Swipe
================================= */
let startX=0; let currentCard=null;

pokemonContainer.addEventListener("touchstart",(e)=>{
    currentCard=e.target.closest(".pokemon-card");
    if(!currentCard) return;
    startX=e.touches[0].clientX;
});
pokemonContainer.addEventListener("touchmove",(e)=>{
    if(!currentCard) return;
    let deltaX=e.touches[0].clientX-startX;
    currentCard.style.transform=`translateX(${deltaX}px) rotateZ(${deltaX/10}deg)`;
});
pokemonContainer.addEventListener("touchend",(e)=>{
    if(!currentCard) return;
    let deltaX=e.changedTouches[0].clientX-startX;
    const name=currentCard.querySelector(".pokemon-name").textContent.toLowerCase();
    if(deltaX>100){ currentCard.classList.add("swipe-right"); if(!favorites.includes(name)){favorites.push(name); localStorage.setItem("favorites",JSON.stringify(favorites));} }
    else if(deltaX<-100){ currentCard.classList.add("swipe-left");}
    else{currentCard.style.transform="";}
    setTimeout(()=>currentCard.remove(),500);
    currentCard=null;
});

/* ===============================
   Desktop Drag 3D rotate
================================= */
pokemonContainer.addEventListener("mousedown",(e)=>{
    currentCard=e.target.closest(".pokemon-card");
    if(!currentCard) return;
    startX=e.clientX;
    currentCard.style.transition="none";
});
pokemonContainer.addEventListener("mousemove",(e)=>{
    if(!currentCard) return;
    let deltaX=e.clientX-startX;
    currentCard.style.transform=`rotateY(${deltaX/10}deg)`;
});
pokemonContainer.addEventListener("mouseup",(e)=>{
    if(!currentCard) return;
    currentCard.style.transition="transform 0.5s ease";
    currentCard.style.transform="rotateY(0deg)";
    currentCard=null;
});

/* ===============================
   Controls Event Listeners
================================= */
sortSelect.addEventListener('change', handleControlsChange);
typeFilter.addEventListener('change', handleControlsChange);
searchInput.addEventListener('input',()=>{
    clearTimeout(searchTimeout);
    searchTimeout=setTimeout(()=>handleControlsChange(),APP_CONFIG.SEARCH_DELAY);
});
document.getElementById("show-favorites").addEventListener("click",()=>{
    const favPokemon = allPokemon.filter(p=>favorites.includes(p.name));
    displayPokemon(favPokemon);
});

/* ===============================
   Start App
================================= */
fetchPokemon();

});

document.addEventListener("DOMContentLoaded",()=>{

const tutorial = document.getElementById("swipe-tutorial");
const closeBtn = document.getElementById("close-tutorial");

/* Show tutorial only on mobile */
if(window.innerWidth <= 768){
    setTimeout(()=>{
        tutorial.style.display = "flex";
    },800);
}else{
    tutorial.style.display = "none";
}

/* Close tutorial */
closeBtn.addEventListener("click",()=>{
    tutorial.style.display = "none";
    localStorage.setItem("tutorialSeen","true");
});

/* Auto hide if user already saw tutorial */
if(localStorage.getItem("tutorialSeen")){
    tutorial.style.display = "none";
}

});

let pokemonTeam = JSON.parse(localStorage.getItem("pokemonTeam")) || [];
const TEAM_LIMIT = 6;

const teamSlots = document.getElementById("team-slots");

function renderTeam(){
    teamSlots.innerHTML = "";

    for(let i=0;i<TEAM_LIMIT;i++){

        const slot = document.createElement("div");
        slot.className="team-slot";

        if(pokemonTeam[i]){
            slot.innerHTML = `<img src="${pokemonTeam[i].image}">`;

            slot.addEventListener("click",()=>{
                pokemonTeam.splice(i,1);
                localStorage.setItem("pokemonTeam",JSON.stringify(pokemonTeam));
                renderTeam();
            });
        }

        teamSlots.appendChild(slot);
    }
}

if(e.target.classList.contains("card-inner")){
    if(pokemonTeam.length >= TEAM_LIMIT){
        alert("Team is full (Max 6 Pokémon)");
        return;
    }

    if(pokemon && !pokemonTeam.find(p=>p.name===pokemon.name)){
        pokemonTeam.push(pokemon);
        localStorage.setItem("pokemonTeam",JSON.stringify(pokemonTeam));
        renderTeam();
    }
}

renderTeam();

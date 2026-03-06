document.addEventListener("DOMContentLoaded",()=>{

const container=document.getElementById("pokemon-container");
const count=document.getElementById("pokemon-count");

let allPokemon=[];
let favorites=[];
let team=[];

/* Fetch Pokemon */

async function fetchPokemon(){

const res=await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
const data=await res.json();

const details=[];

for(const [i,p] of data.results.entries()){

const res2=await fetch(p.url);
const poke=await res2.json();

details.push({
id:i+1,
name:poke.name,
formattedName:poke.name.charAt(0).toUpperCase()+poke.name.slice(1),
image:poke.sprites.other?.["official-artwork"]?.front_default ||
poke.sprites.front_default,
types:poke.types.map(t=>t.type.name),
stats:poke.stats
});

}

allPokemon=details;
displayPokemon(allPokemon);
count.textContent=allPokemon.length;

}

/* Display Cards */

function displayPokemon(list){

container.innerHTML="";

list.forEach(p=>{

const card=document.createElement("div");
card.className="pokemon-card";

const types=p.types.map(t=>`<span class="type-badge">${t}</span>`).join("");

card.innerHTML=`
<div class="pokemon-image">
<img src="${p.image}">
</div>

<div class="pokemon-details">
<h3 class="pokemon-name">${p.formattedName}</h3>
${types}
</div>
`;

container.appendChild(card);

});

}

/* Theme Toggle */

document.getElementById("theme-toggle").onclick=()=>{
document.body.classList.toggle("light");
};

fetchPokemon();

});

document.addEventListener("DOMContentLoaded", async () => {

const pokemonContainer = document.getElementById("pokemon-container");
const pokemonCount = document.getElementById("pokemon-count");

if (!pokemonContainer) return;

let allPokemon = [];

async function fetchPokemon(){

    pokemonContainer.innerHTML =
        "<p style='text-align:center'>Loading Pokemon...</p>";

    try {

        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=151"
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

/* Start App */
fetchPokemon();

});

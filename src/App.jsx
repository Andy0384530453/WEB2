import { useEffect, useState } from "react";
import { motion } from "framer-motion"; 
import axios from "axios"; 

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        const urls = [];
        for (let i = 1; i <= 20; i++) { // Augmenté à 20 Pokémon pour plus de contenu
          urls.push(`https://pokeapi.co/api/v2/pokemon/${i}`);
        }

        const responses = await Promise.all(urls.map((url) => axios.get(url)));
        setPokemons(responses.map((res) => res.data));
      } catch (err) {
        setError("Erreur lors du chargement des Pokémon.");
      } finally {
        setLoading(false);
      }
    }

    fetchPokemons();
  }, []);
useEffect(() => {
    const fetchEvolutionChain = async () => {
      if (!selectedPokemon) return;

      try {
        const speciesResponse = await axios.get(selectedPokemon.species.url);
        const evolutionResponse = await axios.get(speciesResponse.data.evolution_chain.url);
        const chain = parseEvolutionChain(evolutionResponse.data.chain);
        setEvolutionChain(chain);
      } catch (err) {
        console.error("Erreur lors de la récupération des évolutions :", err);
        setEvolutionChain([]);
      }
    };

    fetchEvolutionChain();
  }, [selectedPokemon]);
  const parseEvolutionChain = (chain) => {
    const evolutions = [];
    let current = chain;

    while (current) {
      evolutions.push({
        name: current.species.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
          current.species.url.split("/")[6]
        }.png`,
      });
      current = current.evolves_to[0];
    }

    return evolutions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-6">
      <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-12 tracking-tight">z</h1>

      {loading && (
        <div className="text-center text-2xl text-gray-600">Chargement...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {pokemons.map((pokemon) => (
          <motion.div
            key={pokemon.id}
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100"
            whileHover={{ y: -5 }}
            onClick={() => setSelectedPokemon(pokemon)}
          >
            <img
              src={pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-28 h-28 mx-auto rounded-full bg-gray-50 p-3"
            />
            <h2 className="text-xl font-semibold capitalize mt-4 text-indigo-700">
              {pokemon.name}
            </h2>
            <p className="text-sm text-gray-500">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {selectedPokemon && (
        <motion.div
          className="mt-12 p-8 bg-white rounded-2xl shadow-2xl max-w-3xl mx-auto relative border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => setSelectedPokemon(null)}
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all duration-200 shadow-md"
          >
            Fermer ✕
          </button>

          <h2 className="text-4xl font-bold capitalize text-center text-indigo-800 mb-6">
            {selectedPokemon.name} #{String(selectedPokemon.id).padStart(3, "0")}
          </h2>
          <img
            src={selectedPokemon.sprites.other["official-artwork"].front_default || selectedPokemon.sprites.front_default}
            alt={selectedPokemon.name}
            className="w-40 h-40 mx-auto my-4 rounded-full bg-gray-50 p-4"
          />

          <div className="text-center mb-6">
            <h3 className="font-bold text-2xl text-indigo-700 mb-3">Type(s)</h3>
            <div className="flex justify-center gap-2">
              {selectedPokemon.types.map((t, index) => (
                <span
                  key={index}
                  className="inline-block bg-indigo-100 text-indigo-800 font-semibold px-4 py-1 rounded-full"
                >
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-2xl text-indigo-700 mb-3">Statistiques</h3>
              <ul className="space-y-2">
                {selectedPokemon.stats.map((stat) => (
                  <li
                    key={stat.stat.name}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
                  >
                    <span className="capitalize text-gray-700">{stat.stat.name}</span>
                    <span className="font-semibold text-indigo-600">{stat.base_stat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-2xl text-indigo-700 mb-3">Évolutions</h3>
              {evolutionChain.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  {evolutionChain.map((evo, index) => (
                    <div key={evo.name} className="flex items-center gap-2">
                      <img
                        src={evo.image}
                        alt={evo.name}
                        className="w-16 h-16 rounded-full bg-gray-50 p-2"
                      />
                      <span className="capitalize font-semibold text-indigo-600">
                        {evo.name}
                      </span>
                      {index < evolutionChain.length - 1 && (
                        <span className="text-gray-500"></span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune évolution disponible.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
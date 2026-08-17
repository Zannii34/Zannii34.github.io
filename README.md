# Wayne Kamachetera — Developer Portfolio

Personal developer portfolio for junior software development, full-stack web development and IT support applications.

## Main sections

- About / professional profile
- Front-end, back-end, database, API, deployment, IT support and AI skills
- What I Build capability overview
- Seven featured interactive project demos
- Additional AI / algorithms / Django project highlights
- Technical experience
- Education and CS50 coursework
- Contact information
- Printable CV (`cv.html`)

## Featured demos

1. MK Construction & Projects — responsive business website demo
2. Pokémon Explorer & Team Builder — PokéAPI + local storage
3. Weather Dashboard — Open-Meteo + optional browser geolocation
4. To-Do Application — task CRUD, filters, priorities and due dates
5. Business Admin & Quote System — static interactive Flask/backend showcase
6. Django Task Manager — static interactive showcase adapted from Django CRUD work
7. Tic-Tac-Toe Minimax AI — playable adversarial-search demo

## Run locally

From this folder:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## GitHub Pages

The project is designed to deploy from the repository root. Keep `index.html`, `css/`, `js/`, `assets/` and `projects/` at the top level of the `main` branch.

## Notes

- GitHub Pages is static hosting, so Python/Django/Flask server code cannot run directly there. Backend projects therefore use interactive browser showcases while accurately describing the backend architecture represented.
- The weather and Pokémon demos require internet access for their public APIs.
- MK Construction demo image licensing/attribution is documented in `projects/mk-construction/IMAGE_CREDITS.txt`.

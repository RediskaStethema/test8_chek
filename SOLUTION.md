
The current version of react-scripts uses deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware options in webpack-dev-server, which results in deprecation warnings.
These warnings do not affect the functionality of the application and do not interfere with development.
Forced ejection or configuration customization increases the complexity of the project and requires additional support efforts.
For long-term improvements, you can consider migrating to modern build tools (e.g. Vite), which do not have such warnings.

Backend

Creating a full app.use('/favicon.ico', ...) 
 new route adds unnecessary complexity to the routing 
and may conflict with the fallback logic.
It's better served as a static file - that's what Express is for.

Health check endpoint (/api/health) – 
for monitoring server availability and checking connection to the database/files. 
Useful for deployment and CI/CD.

Refactoring
Replaced fs.readFileSync with asynchronous functions readData / writeData to avoid blocking the event loop.
Caching /api/stats

Implemented in-memory caching.
On the first request to /api/stats, results are cached.
Cache is invalidated either after a timeout (e.g. 10 seconds) or when data changes.

Validation
Added validation for name, category, and price fields in POST /api/items.
Returns 400 errors with meaningful messages for invalid input.

Error Handling
All error types are handled: 400 (bad request), 404 (not found), and 500 (internal server error).
Custom error classes (ValidationError, NotFoundError) are used.

Testing
Wrote unit tests using Jest for all (/api/items)/(api/stats) routes:
Covers both happy paths and edge/error cases.


Frontend

Memory Leak Prevention
Used AbortController in useEffect to cancel fetch requests when the component unmounts.

Pagination + Search
Implemented search input (TextField) for q param.

Added pagination with Material UI's Pagination component.
limit, offset, and q are sent to the backend to fetch filtered and paginated results.

Virtualization
Implemented list virtualization using react-window (FixedSizeList).
Greatly improves performance by rendering only visible list items.

UI/UX Enhancements
Used Material UI (MUI) for consistent styling across the app:
Layout components: Stack, Paper
Input: TextField, Pagination
Feedback: Alert, Skeleton, Typography
Navigation: Button, Link
Skeleton loaders improve UX during fetch delays.
Fallback UI shown when category is missing (only id and price shown).
Error messages and empty states are handled gracefully.

Trade-offs

Used react-window over heavier solutions like react-virtualized for simplicity.
Chose not to use Redux due to small app size; Context API is sufficient.
Manual cache implementation was chosen to stay dependency-free.
Greatly speeds up development (ready-made components and styles).
Well documented, easy to customize.


What else can be added
Integration and E2E tests – to check the entire chain from client to server.
i18n / multilingual – to support multiple languages.
Redux or Zustand – in case of state scaling.
Displaying images or product descriptions – for a more complete card.
Authentication / authorization – to differentiate access rights.
Linting (ESLint) and formatting (Prettier) – for a consistent style.
SSR or SEO optimization – if the project involves public access from search engines.
Database instead of JSON – for scalability and reliability.

Although I usually adhere to the practice of explicit typing (especially in large projects), in this case it was decided not to implement TypeScript or JSDoc, because:
The test task is initially oriented towards JavaScript — neither the structure nor the project tools imply the presence of a typing system.
Implementing TypeScript would have led to reworking the project, including build configuration, renaming files, setting types, which would have been beyond the scope and priorities of the task.
Most components and functions are quite simple, and thanks to a strict structure and tests, the readability and reliability of the code remain at a high level even without static typing.
The focus was on covering the tasks from the technical task — eliminating memory leaks, optimization, unit test coverage and improving UI/UX.
However, in real projects I prefer to use TypeScript or at least JSDoc for large and long-lived components.


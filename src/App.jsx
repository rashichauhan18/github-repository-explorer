import { useState } from "react";
import "./App.css";
import RepositoryDetails from "./pages/RepositoryDetails";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [sort, setSort] = useState("best-match");

  const path = window.location.pathname;

  // Open repository details page
  if (path.startsWith("/repository/")) {
    return <RepositoryDetails />;
  }

  async function searchRepositories(pageNumber = 1, sortValue = sort) {
    if (!searchQuery.trim()) {
      setError("Please enter a repository name or keyword.");
      setRepositories([]);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        searchQuery
      )}&page=${pageNumber}&per_page=10`;

      if (sortValue !== "best-match") {
        url += `&sort=${sortValue}&order=desc`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "GitHub API rate limit reached. Please try again later."
          );
        }

        throw new Error("Unable to fetch repositories.");
      }

      const data = await response.json();

      if (!data.items) {
        throw new Error("Unexpected response from GitHub.");
      }

      setRepositories(data.items);
      setPage(pageNumber);
    } catch (error) {
      setError(error.message);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setPage(1);
    setHasSearched(true);
    searchRepositories(1);
  }

  function handleSortChange(event) {
    const newSort = event.target.value;

    setSort(newSort);

    if (hasSearched && searchQuery.trim()) {
      searchRepositories(1, newSort);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      {/* HERO SECTION */}
      <header className="hero">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Powered by GitHub REST API
        </div>

        <h1>
          Explore the
          <span> GitHub Universe</span>
        </h1>

        <p className="hero-subtitle">
          Discover repositories, analyze projects, explore developers,
          and find your next great idea.
        </p>

        <div className="hero-features">
          <span>⚡ Fast Search</span>
          <span>📊 Repository Insights</span>
          <span>👥 Contributors</span>
          <span>📖 README Explorer</span>
        </div>
      </header>

      <main className="main">
        {/* SEARCH SECTION */}
        <section className="search-section">
          <div className="search-heading">
            <h2>Find a repository</h2>
            <p>
              Search millions of public repositories on GitHub.
            </p>
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Try &quot;react&quot;, &quot;machine learning&quot;, &quot;portfolio&quot;..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onKeyDown={handleKeyDown}
              />

              {searchQuery && (
                <button
                  className="clear-button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button
              className="search-button"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Searching
                </>
              ) : (
                <>
                  Search
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </div>

          <div className="search-hint">
            Press <kbd>Enter</kbd> to search
          </div>
        </section>

        {/* SORTING */}
        {hasSearched && repositories.length > 0 && (
          <div className="results-toolbar">
            <div>
              <span className="results-label">Search results</span>
              <span className="results-count">
                {repositories.length} repositories
              </span>
            </div>

            <div className="sort-container">
              <label htmlFor="sort">Sort by</label>

              <select
                id="sort"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="best-match">Best Match</option>
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
                <option value="help-wanted-issues">
                  Help Wanted Issues
                </option>
                <option value="updated">
                  Recently Updated
                </option>
              </select>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="status-card">
            <div className="loading-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <h3>Searching GitHub...</h3>

            <p>
              Looking through repositories for{" "}
              <strong>{searchQuery}</strong>
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="error-card">
            <div className="error-icon">!</div>

            <div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* INITIAL STATE */}
        {!loading &&
          !error &&
          repositories.length === 0 &&
          !hasSearched && (
            <section className="empty-state">
              <div className="empty-icon">
                <span>⌘</span>
              </div>

              <h2>Start exploring</h2>

              <p>
                Search for any GitHub repository above and
                discover its stars, forks, language, contributors,
                README, and more.
              </p>

              <div className="example-searches">
                <span>Try searching:</span>

                <button
                  onClick={() => {
                    setSearchQuery("react");
                    setHasSearched(true);
                    searchRepositories(1);
                  }}
                >
                  react
                </button>

                <button
                  onClick={() => {
                    setSearchQuery("machine learning");
                    setHasSearched(true);
                    searchRepositories(1);
                  }}
                >
                  machine learning
                </button>

                <button
                  onClick={() => {
                    setSearchQuery("portfolio");
                    setHasSearched(true);
                    searchRepositories(1);
                  }}
                >
                  portfolio
                </button>
              </div>
            </section>
          )}

        {/* NO RESULTS */}
        {!loading &&
          !error &&
          repositories.length === 0 &&
          hasSearched && (
            <section className="empty-state">
              <div className="empty-icon">🔎</div>

              <h2>No repositories found</h2>

              <p>
                We couldn't find anything matching{" "}
                <strong>"{searchQuery}"</strong>.
                Try a different keyword.
              </p>
            </section>
          )}

        {/* RESULTS */}
        {!loading && repositories.length > 0 && (
          <div className="results">
            {repositories.map((repository, index) => (
              <article
                className="repository-card"
                key={repository.id}
                onClick={() => {
                  window.location.href = `/repository/${repository.owner.login}/${repository.name}`;
                }}
              >
                <div className="card-number">
                  #{String((page - 1) * 10 + index + 1).padStart(2, "0")}
                </div>

                <div className="repository-header">
                  <img
                    src={repository.owner.avatar_url}
                    alt={`${repository.owner.login} avatar`}
                    className="avatar"
                  />

                  <div className="repository-title">
                    <h2>{repository.name}</h2>

                    <p className="owner">
                      @{repository.owner.login}
                    </p>
                  </div>

                  <span className="card-arrow">↗</span>
                </div>

                <p className="description">
                  {repository.description ||
                    "No description available for this repository."}
                </p>

                <div className="repository-stats">
                  <span>
                    <b>⭐</b>
                    {repository.stargazers_count.toLocaleString()}
                    <small> stars</small>
                  </span>

                  <span>
                    <b>⑂</b>
                    {repository.forks_count.toLocaleString()}
                    <small> forks</small>
                  </span>

                  <span>
                    <b>●</b>
                    {repository.language || "Unknown"}
                  </span>
                </div>

                <div className="card-footer">
                  <span className="updated">
                    Updated{" "}
                    {new Date(
                      repository.updated_at
                    ).toLocaleDateString()}
                  </span>

                  <a
                    href={repository.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="github-link"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    View on GitHub
                    <span>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {repositories.length > 0 && (
          <div className="pagination">
            <button
              onClick={() =>
                searchRepositories(page - 1)
              }
              disabled={page === 1 || loading}
            >
              <span>←</span>
              Previous
            </button>

            <div className="page-indicator">
              <span>PAGE</span>
              <strong>{page}</strong>
            </div>

            <button
              onClick={() =>
                searchRepositories(page + 1)
              }
              disabled={loading}
            >
              Next
              <span>→</span>
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-line"></div>

        <p>
          Built with <span>React</span> +{" "}
          <span>GitHub REST API</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
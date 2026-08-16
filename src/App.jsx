import { useState } from "react";
import "./App.css";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [sort, setSort] = useState("best-match");

  async function searchRepositories(pageNumber = 1) {
    if (!searchQuery.trim()) {
      setError("Please enter a repository name or keyword.");
      setRepositories([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        searchQuery
      )}&page=${pageNumber}&per_page=10`;

      if (sort !== "best-match") {
        url += `&sort=${sort}&order=desc`;
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

    if (hasSearched) {
      setTimeout(() => {
        searchRepositories(1);
      }, 0);
    }
  }

  return (
    <div className="app">

      <header className="header">
        <h1>GitHub Repository Explorer</h1>

        <p>
          Search, explore and analyze GitHub repositories.
        </p>
      </header>

      <main className="main">

        <div className="search-container">

          <input
            type="text"
            placeholder="Search GitHub repositories..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleSearch}
          >
            Search
          </button>

        </div>

        {hasSearched && (
          <div className="sort-container">

            <label htmlFor="sort">
              Sort by:
            </label>

            <select
              id="sort"
              value={sort}
              onChange={handleSortChange}
            >
              <option value="best-match">
                Best Match
              </option>

              <option value="stars">
                Stars
              </option>

              <option value="forks">
                Forks
              </option>

              <option value="help-wanted-issues">
                Help Wanted Issues
              </option>

              <option value="updated">
                Recently Updated
              </option>
            </select>

          </div>
        )}

        {loading && (
          <p className="status">
            Searching GitHub...
          </p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          repositories.length === 0 && (
            <p className="status">
              {hasSearched
                ? "No repositories found."
                : "Search for a repository to get started."}
            </p>
          )}

        <div className="results">

          {repositories.map((repository) => (

            <div
              className="repository-card"
              key={repository.id}
              onClick={() =>
                (window.location.href =
                  `/repository/${repository.owner.login}/${repository.name}`)
              }
            >

              <div className="repository-header">

                <img
                  src={repository.owner.avatar_url}
                  alt={`${repository.owner.login} avatar`}
                  className="avatar"
                />

                <div>

                  <h2>
                    {repository.name}
                  </h2>

                  <p className="owner">
                    {repository.owner.login}
                  </p>

                </div>

              </div>

              <p className="description">
                {repository.description ||
                  "No description available."}
              </p>

              <div className="repository-stats">

                <span>
                  ⭐ {repository.stargazers_count}
                </span>

                <span>
                  🍴 {repository.forks_count}
                </span>

                <span>
                  💻 {repository.language || "Unknown"}
                </span>

              </div>

              <a
                href={repository.html_url}
                target="_blank"
                rel="noreferrer"
                className="github-link"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                View on GitHub →
              </a>

            </div>

          ))}

        </div>

        {repositories.length > 0 && (

          <div className="pagination">

            <button
              onClick={() =>
                searchRepositories(page - 1)
              }
              disabled={page === 1 || loading}
            >
              ← Previous
            </button>

            <span>
              Page {page}
            </span>

            <button
              onClick={() =>
                searchRepositories(page + 1)
              }
              disabled={loading}
            >
              Next →
            </button>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;
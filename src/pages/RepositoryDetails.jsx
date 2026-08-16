import { useEffect, useState } from "react";
import "../App.css";

function RepositoryDetails() {
  const [repository, setRepository] = useState(null);
  const [readme, setReadme] = useState("");
  const [contributors, setContributors] = useState([]);
  const [languages, setLanguages] = useState({});

  const [loading, setLoading] = useState(true);
  const [readmeLoading, setReadmeLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [error, setError] = useState("");

  const pathParts = window.location.pathname.split("/");

  const owner = pathParts[2];
  const repoName = pathParts[3];

  useEffect(() => {
    async function fetchRepository() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch repository details.");
        }

        const data = await response.json();

        setRepository(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    async function fetchReadme() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/readme`,
          {
            headers: {
              Accept: "application/vnd.github.raw+json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("README not available.");
        }

        const data = await response.text();

        setReadme(data);
      } catch (error) {
        setReadme("");
      } finally {
        setReadmeLoading(false);
      }
    }

    async function fetchContributors() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/contributors?per_page=5`
        );

        if (!response.ok) {
          throw new Error("Contributors not available.");
        }

        const data = await response.json();

        setContributors(data);
      } catch (error) {
        setContributors([]);
      } finally {
        setContributorsLoading(false);
      }
    }

    async function fetchLanguages() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/languages`
        );

        if (!response.ok) {
          throw new Error("Languages not available.");
        }

        const data = await response.json();

        setLanguages(data);
      } catch (error) {
        setLanguages({});
      } finally {
        setLanguagesLoading(false);
      }
    }

    fetchRepository();
    fetchReadme();
    fetchContributors();
    fetchLanguages();
  }, [owner, repoName]);

  /*
   * Convert GitHub's language byte counts
   * into percentages.
   */
  const languageEntries = Object.entries(languages);

  const totalLanguageBytes = languageEntries.reduce(
    (total, [, bytes]) => total + bytes,
    0
  );

  const languagePercentages = languageEntries
    .map(([language, bytes]) => ({
      language,
      percentage: (bytes / totalLanguageBytes) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  if (loading) {
    return (
      <div className="details-page">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Loading repository details...</p>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="details-page">
        <div className="error-card">
          <div className="error-icon">!</div>

          <h1>Repository Not Found</h1>

          <p>
            We couldn't find this GitHub repository.
          </p>

          <a href="/" className="back-button">
            ← Back to Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="details-page">

      {/* Back button */}
      <a href="/" className="back-link">
        ← Back to Search
      </a>

      <div className="details-card">

        {/* =========================
            HEADER
        ========================== */}

        <div className="details-header">

          <img
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            className="details-avatar"
          />

          <div className="details-title">

            <p className="details-owner">
              {repository.owner.login}
            </p>

            <h1>
              {repository.name}
            </h1>

          </div>

          <span className="visibility-badge">
            {repository.visibility}
          </span>

        </div>

        {/* Description */}

        <p className="details-description">
          {repository.description ||
            "No description available."}
        </p>

        {/* =========================
            STATISTICS
        ========================== */}

        <div className="details-stats">

          <div className="stat">
            <span className="stat-icon">⭐</span>

            <strong>
              {repository.stargazers_count.toLocaleString()}
            </strong>

            <small>
              Stars
            </small>
          </div>

          <div className="stat">
            <span className="stat-icon">🍴</span>

            <strong>
              {repository.forks_count.toLocaleString()}
            </strong>

            <small>
              Forks
            </small>
          </div>

          <div className="stat">
            <span className="stat-icon">🐛</span>

            <strong>
              {repository.open_issues_count.toLocaleString()}
            </strong>

            <small>
              Open Issues
            </small>
          </div>

          <div className="stat">
            <span className="stat-icon">💻</span>

            <strong>
              {repository.language || "Unknown"}
            </strong>

            <small>
              Main Language
            </small>
          </div>

        </div>

        {/* =========================
            REPOSITORY INFORMATION
        ========================== */}

        <section className="details-section">

          <div className="section-heading">
            <span className="section-number">01</span>

            <div>
              <h2>Repository Information</h2>

              <p>
                Important information about this repository.
              </p>
            </div>
          </div>

          <div className="info-grid">

            <div className="info-item">
              <span>Visibility</span>
              <strong>
                {repository.visibility}
              </strong>
            </div>

            <div className="info-item">
              <span>Default Branch</span>
              <strong>
                {repository.default_branch}
              </strong>
            </div>

            <div className="info-item">
              <span>Created</span>
              <strong>
                {new Date(
                  repository.created_at
                ).toLocaleDateString()}
              </strong>
            </div>

            <div className="info-item">
              <span>Last Updated</span>
              <strong>
                {new Date(
                  repository.updated_at
                ).toLocaleDateString()}
              </strong>
            </div>

            <div className="info-item">
              <span>License</span>

              <strong>
                {repository.license
                  ? repository.license.name
                  : "No license"}
              </strong>
            </div>

            <div className="info-item">
              <span>Homepage</span>

              {repository.homepage ? (
                <a
                  href={repository.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="homepage-link"
                >
                  {repository.homepage}
                </a>
              ) : (
                <strong>
                  No homepage
                </strong>
              )}
            </div>

          </div>

          {/* Topics */}

          {repository.topics &&
            repository.topics.length > 0 && (

              <div className="topics-section">

                <h3>
                  Topics
                </h3>

                <div className="topics">

                  {repository.topics.map((topic) => (
                    <span
                      className="topic"
                      key={topic}
                    >
                      #{topic}
                    </span>
                  ))}

                </div>

              </div>
            )}

          {/* GitHub button */}

          <a
            href={repository.html_url}
            target="_blank"
            rel="noreferrer"
            className="github-button"
          >
            View Repository on GitHub
            <span>↗</span>
          </a>

        </section>

        {/* =========================
            LANGUAGE USAGE
        ========================== */}

        <section className="details-section">

          <div className="section-heading">
            <span className="section-number">02</span>

            <div>
              <h2>Language Usage</h2>

              <p>
                Programming languages used in this repository.
              </p>
            </div>
          </div>

          {languagesLoading && (
            <div className="section-loading">
              <div className="small-spinner"></div>
              <span>Analyzing languages...</span>
            </div>
          )}

          {!languagesLoading &&
            languagePercentages.length === 0 && (
              <p className="empty-message">
                Language information is not available.
              </p>
            )}

          {!languagesLoading &&
            languagePercentages.length > 0 && (

              <div className="language-chart">

                {/* Percentage bar */}

                <div className="language-bar">

                  {languagePercentages.map(
                    ({ language, percentage }) => (
                      <div
                        key={language}
                        className={`language-segment language-${language
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "")}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                        title={`${language}: ${percentage.toFixed(
                          1
                        )}%`}
                      ></div>
                    )
                  )}

                </div>

                {/* Legend */}

                <div className="language-list">

                  {languagePercentages.map(
                    ({ language, percentage }, index) => (

                      <div
                        className="language-row"
                        key={language}
                      >

                        <div className="language-name">

                          <span
                            className={`language-dot language-dot-${index}`}
                          ></span>

                          <span>
                            {language}
                          </span>

                        </div>

                        <strong>
                          {percentage.toFixed(1)}%
                        </strong>

                      </div>

                    )
                  )}

                </div>

              </div>
            )}

        </section>

        {/* =========================
            CONTRIBUTORS
        ========================== */}

        <section className="details-section">

          <div className="section-heading">
            <span className="section-number">03</span>

            <div>
              <h2>Top Contributors</h2>

              <p>
                Developers who contributed to this repository.
              </p>
            </div>
          </div>

          {contributorsLoading && (
            <div className="section-loading">
              <div className="small-spinner"></div>
              <span>Loading contributors...</span>
            </div>
          )}

          {!contributorsLoading &&
            contributors.length === 0 && (
              <p className="empty-message">
                No contributors found.
              </p>
            )}

          {!contributorsLoading &&
            contributors.length > 0 && (

              <div className="contributors">

                {contributors.map((contributor, index) => (

                  <div
                    className="contributor"
                    key={contributor.id}
                  >

                    <span className="contributor-rank">
                      #{index + 1}
                    </span>

                    <img
                      src={contributor.avatar_url}
                      alt={`${contributor.login} avatar`}
                      className="contributor-avatar"
                    />

                    <div className="contributor-info">

                      <strong>
                        {contributor.login}
                      </strong>

                      <p>
                        {contributor.contributions.toLocaleString()}{" "}
                        contributions
                      </p>

                    </div>

                    <a
                      href={contributor.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="contributor-link"
                    >
                      ↗
                    </a>

                  </div>

                ))}

              </div>
            )}

        </section>

        {/* =========================
            README
        ========================== */}

        <section className="details-section">

          <div className="section-heading">
            <span className="section-number">04</span>

            <div>
              <h2>README</h2>

              <p>
                Documentation provided by the repository.
              </p>
            </div>
          </div>

          {readmeLoading && (
            <div className="section-loading">
              <div className="small-spinner"></div>
              <span>Loading README...</span>
            </div>
          )}

          {!readmeLoading && readme && (
            <div className="readme-container">

              <pre className="readme-content">
                {readme}
              </pre>

            </div>
          )}

          {!readmeLoading && !readme && (
            <p className="empty-message">
              This repository does not have a README.
            </p>
          )}

        </section>

      </div>

      {/* Footer */}

      <footer className="details-footer">
        Powered by GitHub REST API
      </footer>

    </div>
  );
}

export default RepositoryDetails;
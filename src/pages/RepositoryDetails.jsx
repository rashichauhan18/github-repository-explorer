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

  // Calculate language percentages

  const languageEntries = Object.entries(languages);

  const totalLanguageBytes = languageEntries.reduce(
    (total, [, bytes]) => total + bytes,
    0
  );

  const languagePercentages = languageEntries
    .map(([language, bytes]) => ({
      language,
      percentage:
        totalLanguageBytes > 0
          ? (bytes / totalLanguageBytes) * 100
          : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Loading state

  if (loading) {
    return (
      <div className="details-page">
        <p className="status">
          Loading repository details...
        </p>
      </div>
    );
  }

  // Error state

  if (error) {
    return (
      <div className="details-page">
        <div className="details-card">

          <h1>
            Repository Not Found
          </h1>

          <p className="details-description">
            We couldn't find this GitHub repository.
          </p>

          <a
            href="/"
            className="back-link"
          >
            ← Back to Search
          </a>

        </div>
      </div>
    );
  }

  return (
    <div className="details-page">

      {/* Back to Search */}

      <a
        href="/"
        className="back-link"
      >
        ← Back to Search
      </a>

      <div className="details-card">

        {/* Repository Header */}

        <div className="details-header">

          <img
            src={repository.owner.avatar_url}
            alt={`${repository.owner.login} avatar`}
            className="details-avatar"
          />

          <div>

            <p className="details-owner">
              {repository.owner.login}
            </p>

            <h1>
              {repository.name}
            </h1>

          </div>

        </div>

        {/* Description */}

        <p className="details-description">
          {repository.description ||
            "No description available."}
        </p>

        {/* Statistics */}

        <div className="details-stats">

          <div className="stat">

            <span>
              ⭐
            </span>

            <strong>
              {repository.stargazers_count}
            </strong>

            <small>
              Stars
            </small>

          </div>

          <div className="stat">

            <span>
              🍴
            </span>

            <strong>
              {repository.forks_count}
            </strong>

            <small>
              Forks
            </small>

          </div>

          <div className="stat">

            <span>
              🐛
            </span>

            <strong>
              {repository.open_issues_count}
            </strong>

            <small>
              Open Issues
            </small>

          </div>

          <div className="stat">

            <span>
              💻
            </span>

            <strong>
              {repository.language || "Unknown"}
            </strong>

            <small>
              Language
            </small>

          </div>

        </div>

        {/* Repository Information */}

        <div className="details-info">

          <p>
            <strong>
              Visibility:
            </strong>{" "}
            {repository.visibility}
          </p>

          <p>
            <strong>
              Default Branch:
            </strong>{" "}
            {repository.default_branch}
          </p>

          <p>
            <strong>
              Created:
            </strong>{" "}
            {new Date(
              repository.created_at
            ).toLocaleDateString()}
          </p>

          <p>
            <strong>
              Last Updated:
            </strong>{" "}
            {new Date(
              repository.updated_at
            ).toLocaleDateString()}
          </p>

          {/* License */}

          <p>
            <strong>
              License:
            </strong>{" "}
            {repository.license
              ? repository.license.name
              : "No license specified"}
          </p>

          {/* Homepage */}

          {repository.homepage && (
            <p>
              <strong>
                Homepage:
              </strong>{" "}

              <a
                href={repository.homepage}
                target="_blank"
                rel="noreferrer"
                className="github-link"
              >
                Visit Website →
              </a>
            </p>
          )}

          {/* Topics */}

          {repository.topics &&
            repository.topics.length > 0 && (

              <div className="topics-section">

                <h3>
                  Topics
                </h3>

                <div className="topics">

                  {repository.topics.map(
                    (topic) => (

                      <span
                        className="topic"
                        key={topic}
                      >
                        {topic}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}

          {/* GitHub Button */}

          <a
            href={repository.html_url}
            target="_blank"
            rel="noreferrer"
            className="github-button"
          >
            View Repository on GitHub →
          </a>

        </div>

        {/* Language Usage */}

        <div className="languages-section">

          <h2>
            Language Usage
          </h2>

          {languagesLoading && (
            <p className="status">
              Loading language information...
            </p>
          )}

          {!languagesLoading &&
            languagePercentages.length === 0 && (

              <p className="status">
                No language information available.
              </p>

            )}

          {!languagesLoading &&
            languagePercentages.length > 0 && (

              <div className="language-list">

                {languagePercentages.map(
                  ({
                    language,
                    percentage,
                  }) => (

                    <div
                      className="language-item"
                      key={language}
                    >

                      <div className="language-header">

                        <strong>
                          {language}
                        </strong>

                        <span>
                          {percentage.toFixed(1)}%
                        </span>

                      </div>

                      <div className="language-bar">

                        <div
                          className="language-progress"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

        {/* Top Contributors */}

        <div className="contributors-section">

          <h2>
            Top Contributors
          </h2>

          {contributorsLoading && (
            <p className="status">
              Loading contributors...
            </p>
          )}

          {!contributorsLoading &&
            contributors.length === 0 && (

              <p className="status">
                No contributors found.
              </p>

            )}

          {!contributorsLoading &&
            contributors.length > 0 && (

              <div className="contributors">

                {contributors.map(
                  (contributor) => (

                    <div
                      className="contributor"
                      key={contributor.id}
                    >

                      <img
                        src={contributor.avatar_url}
                        alt={`${contributor.login} avatar`}
                        className="contributor-avatar"
                      />

                      <div>

                        <strong>
                          {contributor.login}
                        </strong>

                        <p>
                          {contributor.contributions} contributions
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

        {/* README */}

        <div className="readme-section">

          <h2>
            README
          </h2>

          {readmeLoading && (
            <p className="status">
              Loading README...
            </p>
          )}

          {!readmeLoading &&
            readme && (

              <pre className="readme-content">
                {readme}
              </pre>

            )}

          {!readmeLoading &&
            !readme && (

              <p className="status">
                This repository does not have a README.
              </p>

            )}

        </div>

      </div>

    </div>
  );
}

export default RepositoryDetails;
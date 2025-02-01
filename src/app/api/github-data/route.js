import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "OAuth token required" }, { status: 400 });
    }

    const query = `
      query($since: GitTimestamp!) {
        viewer {
          repositories(first: 5, orderBy: { field: PUSHED_AT, direction: DESC }) {
            nodes {
              name
              url
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(since: $since, first: 5) {
                      edges {
                        node {
                          oid
                          message
                          committedDate
                          author {
                            name
                            email
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    };

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `GitHub API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0]?.message || "GraphQL Error" }, { status: 500 });
    }

    // Process the data to extract commits across repositories
    const latestCommits = data.data.viewer.repositories.nodes.flatMap(repo =>
      (repo.defaultBranchRef?.target?.history?.edges || []).map(edge => ({
        repoName: repo.name,
        repoUrl: repo.url,
        commitId: edge.node.oid,
        message: edge.node.message,
        date: edge.node.committedDate,
        author: edge.node.author.name,
      }))
    );

    return NextResponse.json({ latestCommits });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

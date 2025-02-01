"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [latestCommits, setLatestCommits] = useState([]);
  const [analyzedSkills, setAnalyzedSkills] = useState([]);


  const fetchLatestCommits = async () => {
    console.log("fetching latest commits...")
    if (!session?.accessToken) return;
  
    const res = await fetch("/api/github-data", {
      method: "POST",
      body: JSON.stringify({
        accessToken: session.accessToken
      }),
      headers: { "Content-Type": "application/json" },
    });
  
    const data = await res.json();
    console.log("commits: "+data); // Display latest commits across all repos
    setLatestCommits(data);
  };

  const analyzeSkills = async () => {
    console.log("analyzing skills...")
    console.log(latestCommits)
    console.log(session.user.name)

    const res = await fetch("/api/analyze-commits", {
      method: "POST",
      body: JSON.stringify({
        username: session.user.name,
        commits: latestCommits, // Array of commits from GitHub API
      }),
      headers: { "Content-Type": "application/json" },
    });
  
    const data = await res.json();
    console.log(data); // Logs analyzed skills
  };

  useEffect(() => {
    if (latestCommits.length) {
      analyzeSkills();
    }
  }, [latestCommits]);
  
  
  

  return (
    <div>
      {session ? (
        <>
          <p>Signed in as {session.user?.name}</p>
          <button onClick={fetchLatestCommits}>Fetch commits</button>
          <button onClick={() => signOut()}>Sign out</button>
          <button onClick={analyzeSkills}>Analyze skills</button>

        </>
      ) : (
        <button onClick={() => signIn("github")}>Sign in with GitHub</button>
      )}
    </div>
  );
}

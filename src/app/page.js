"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const analyzeSkills = async () => {
    if (!session?.accessToken) return;

    const res = await fetch("/api/github-data", {
      method: "POST",
      body: JSON.stringify({ accessToken: session.accessToken }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    console.log(data); // Display repo analysis
  };

  const fetchLatestCommits = async () => {
    if (!session?.accessToken) return;
  
    const res = await fetch("/api/github-data", {
      method: "POST",
      body: JSON.stringify({
        accessToken: session.accessToken
      }),
      headers: { "Content-Type": "application/json" },
    });
  
    const data = await res.json();
    console.log(data); // Display latest commits across all repos
  };
  
  

  return (
    <div>
      {session ? (
        <>
          <p>Signed in as {session.user?.name}</p>
          <button onClick={fetchLatestCommits}>Analyze GitHub Skills</button>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick={() => signIn("github")}>Sign in with GitHub</button>
      )}
    </div>
  );
}

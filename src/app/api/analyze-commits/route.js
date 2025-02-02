import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  try {
    const { commits, username } = await req.json();

    if (!commits || !username) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Format commits for AI analysis
    const commitsText = commits.latestCommits
      .map(commit => `Repository: ${commit.repoName}\nMessage: ${commit.message}\nDate: ${commit.date}\nAuthor: ${commit.author}`)
      .join("\n---\n");

    // System prompt to guide AI behavior
    const systemPrompt = `You are an AI analyzing GitHub commits. Your task is to assess the user's programming skills based on their commit history.

You will be provided with commit messages from different repositories, and your goal is to extract **skill tags** and their **proficiency levels**. 

### **Skill Tag Format**
Each skill should include:
- **Language Skills** (e.g., "Python", "Rust", "Solidity", "JavaScript")
- **Development Roles** (e.g., "Full-Stack Developer", "Web3 Developer", "Smart Contract Engineer")
- **Specialized Skills** (e.g., "Database Optimization", "Machine Learning Engineer", "Blockchain Security")

### **Proficiency Level**
Each skill must have a **skill level** on a scale of 1-5:
- **1:** Beginner (Basic understanding, minimal experience)
- **2:** Intermediate (Some hands-on experience, small contributions)
- **3:** Proficient (Capable of completing projects with little supervision)
- **4:** Advanced (Strong experience, can mentor others)
- **5:** Expert (Deep expertise, contributes to cutting-edge developments)

**Return a JSON response in this format:**
{
  "skills": [
    {
      "skill": "skill_name",
      "category": "Language | Framework | Role | Specialized",
      "level": 1-5
    }
  ]
}

Rules:
- Analyze commit messages carefully and infer relevant skills.
- Estimate **proficiency level** based on technical complexity in commits.
- Ensure your response is **valid JSON**, with no extra text or explanations.`

    // User prompt with commit details
    const userPrompt = `Analyze the following GitHub commits for user ${username} and generate a structured JSON output:

<commits>
${commitsText}
</commits>

Return **only** the JSON response with no extra text.`;

    // Call Anthropic AI
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract AI-generated JSON response
    const aiGeneratedText = response.content;

// Ensure we extract the JSON properly
let parsedResponse;
try {
  // If response is an array of objects, extract the text field first
  if (Array.isArray(aiGeneratedText)) {
    parsedResponse = aiGeneratedText.find(entry => entry.type === "text")?.text;
  } else {
    parsedResponse = aiGeneratedText;
  }

  const structuredResponse = JSON.parse(parsedResponse);
  return NextResponse.json(structuredResponse);
} catch (parseError) {
  return NextResponse.json({
    error: "Failed to parse AI response",
    rawResponse: parsedResponse || aiGeneratedText
  }, { status: 500 });
}

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to analyze commits" }, { status: 500 });
  }
}

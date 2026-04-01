/**
 * Groq AI
 * 1) Generate leave message based on dates + reason
 * 2) Generate attendance summary report for admin dashboard
 */
async function callGroq({ system, prompt, temperature=0.4, max_tokens=250 }){
  const apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens
    })
  });

  const data = await response.json();
  if(!response.ok){
    const msg = data?.error?.message || "Groq API error";
    throw new Error(msg);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function generateLeaveMessage({ studentName, fromDate, toDate, reason }){
  const prompt = `Write a formal leave request message for a college student.
Student: ${studentName}
From: ${fromDate}
To: ${toDate}
Reason: ${reason}
Keep it short and professional.`;

  return callGroq({
    system: "You generate formal leave request messages for students.",
    prompt,
    temperature: 0.3,
    max_tokens: 140
  });
}

export async function generateAttendanceSummary({ totalAttendance, totalLeaves, approvedLeaves, rejectedLeaves }){
  const prompt = `Generate attendance summary report for admin dashboard.
Data:
- total attendance logs: ${totalAttendance}
- total leave requests: ${totalLeaves}
- approved: ${approvedLeaves}
- rejected: ${rejectedLeaves}

Write 6-10 bullet points:
- insights
- overall health
- recommendations (e.g., warnings for low attendance)
Use simple language for final-year project.`;

  return callGroq({
    system: "You write dashboard summary reports for attendance systems.",
    prompt,
    temperature: 0.4,
    max_tokens: 250
  });
}

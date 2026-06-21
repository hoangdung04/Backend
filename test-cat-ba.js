import { isFollowUpQuestion, getTourBySlug, buildContext, buildPrompt } from "./services/tour-rag.service.js";
import { askGemini } from "./services/gemini.service.js";

async function main() {
  const question = "Người già có đi được tour này không?";
  const activeTourSlug = "nghi-duong-ba-na-hills-dja-nang-1774864904658";
  
  console.log("Simulating follow-up query:", question);
  console.log("Active Tour Slug:", activeTourSlug);
  
  const isFollowUp = isFollowUpQuestion(question);
  console.log("Is Follow Up?", isFollowUp);
  
  if (isFollowUp) {
    const tours = await getTourBySlug(activeTourSlug);
    console.log("Tours matched count:", tours.length);
    if (tours.length > 0) {
      console.log("- Title of active tour:", tours[0].title);
      const context = buildContext(tours, []);
      console.log("Context built:\n", context);
      
      const prompt = buildPrompt(context, question, []);
      console.log("Calling Gemini to get final answer...");
      try {
        const answer = await askGemini(prompt);
        console.log("=== CHATBOT RESPONSE ===");
        console.log(answer);
        console.log("========================");
      } catch (e) {
        console.error("Gemini Error:", e.message);
      }
    } else {
      console.log("Tour not found in DB.");
    }
  }
  process.exit(0);
}

main();

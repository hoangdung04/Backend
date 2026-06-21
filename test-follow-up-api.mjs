// Native fetch is used

(async () => {
  try {
    const question1 = "tìm cho tôi đi tour mát mẻ";
    console.log(`Asking Q1: "${question1}"`);
    const res1 = await fetch("http://localhost:3001/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question1 })
    });
    const data1 = await res1.json();
    console.log("Q1 response sources count:", data1.sources?.length);
    if (!data1.sources || data1.sources.length === 0) {
      console.log("No tour returned. Exiting.");
      return;
    }
    
    const activeTour = data1.sources[0];
    console.log(`Matched Tour Title: "${activeTour.title}", Slug: "${activeTour.slug}"`);
    
    const question2 = "người già đi được tour này không";
    console.log(`\nAsking Q2 (Follow-up): "${question2}" with activeTourSlug: "${activeTour.slug}"`);
    
    const res2 = await fetch("http://localhost:3001/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question2, activeTourSlug: activeTour.slug })
    });
    
    const data2 = await res2.json();
    console.log("Q2 response code:", data2.code);
    console.log("Q2 response text:", data2.answer);
    console.log("Q2 sources returned count:", data2.sources?.length);
    if (data2.sources?.length > 0) {
      console.log("Q2 source title:", data2.sources[0].title);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
})();

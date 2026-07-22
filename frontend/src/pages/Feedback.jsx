const API_BASE = "/api";

export default   async function fetchFeedbacks(){
  try {
    const response = await fetch(`${API_BASE}/feedback`);

    if (!response.ok) {
      throw new Error("Failed to load feedback");
    }

    const data = await response.json();
    setFeedbacks(data || []);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    setFeedbacks([]);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !email || !comment) return;

  const payload = {
    name,
    email,
    category,
    rating,
    comment,
  };

  try {
    const response = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to post feedback to backend"
      );
    }

    await fetchFeedbacks();

    // Reset form
    setName("");
    setEmail("");
    setCategory("features");
    setRating(5);
    setComment("");
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);

  } catch (err) {
    console.error("Feedback post error:", err);

    alert(
      "Failed to submit feedback: " +
      (err.message || "Something went wrong")
    );
  }
};
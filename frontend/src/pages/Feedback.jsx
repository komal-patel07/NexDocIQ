jsx
import { useEffect, useState } from "react";

// Backend URL from Vercel Environment Variables
// VITE_API_URL=https://nexdociq-backend1.onrender.com

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export default function Feedback() {
  // =========================
  // STATES
  // =========================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("features");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH FEEDBACKS
  // =========================
  const fetchFeedbacks = async () => {
    try {
      console.log(
        "Fetching feedback from:",
        `${API_BASE}/feedback`
      );

      const response = await fetch(`${API_BASE}/feedback`);

      if (!response.ok) {
        throw new Error(
          `Failed to load feedback. Status: ${response.status}`
        );
      }

      // Check if backend returned JSON
      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Expected JSON but received:",
          text
        );

        throw new Error(
          "Backend returned HTML instead of JSON. Check your API URL."
        );
      }

      const data = await response.json();

      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Feedback fetch error:", err);

      setFeedbacks([]);
    }
  };

  // =========================
  // LOAD FEEDBACKS ON PAGE LOAD
  // =========================
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // =========================
  // SUBMIT FEEDBACK
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!name.trim() || !email.trim() || !comment.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      category,
      rating: Number(rating),
      comment: comment.trim(),
    };

    try {
      setLoading(true);

      console.log(
        "Submitting feedback to:",
        `${API_BASE}/feedback`
      );

      const response = await fetch(`${API_BASE}/feedback`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      // Check response type before parsing JSON
      const contentType = response.headers.get("content-type");

      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Backend returned non-JSON response:",
          text
        );

        throw new Error(
          "Backend returned HTML instead of JSON. Check your backend API route."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to post feedback to backend"
        );
      }

      console.log(
        "Feedback submitted successfully:",
        data
      );

      // Reload feedback list
      await fetchFeedbacks();

      // Reset form
      setName("");
      setEmail("");
      setCategory("features");
      setRating(5);
      setComment("");

      // Show success message
      setSubmitted(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (err) {
      console.error(
        "Feedback post error:",
        err
      );

      alert(
        "Failed to submit feedback: " +
          (err.message ||
            "Something went wrong")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div>
      <h1>Feedback</h1>

      {submitted && (
        <p>
          Feedback submitted successfully!
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="features">
            Features
          </option>

          <option value="ui">
            UI/UX
          </option>

          <option value="performance">
            Performance
          </option>

          <option value="bug">
            Bug
          </option>

          <option value="other">
            Other
          </option>
        </select>

        <select
          value={rating}
          onChange={(e) =>
            setRating(Number(e.target.value))
          }
        >
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>

        <textarea
          placeholder="Write your feedback"
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : "Submit Feedback"}
        </button>
      </form>

      <div>
        <h2>Recent Feedback</h2>

        {feedbacks.map(
          (feedback, index) => (
            <div
              key={
                feedback._id || index
              }
            >
              <h3>
                {feedback.name}
              </h3>

              <p>
                Category:{" "}
                {feedback.category}
              </p>

              <p>
                Rating:{" "}
                {feedback.rating}/5
              </p>

              <p>
                {feedback.comment}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

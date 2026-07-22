import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Send,
  CheckCircle,
} from "lucide-react";
import "./Feedback.css";

// ========================================
// BACKEND API URL
// ========================================

const API_BASE = "/api";

console.log("API_BASE:", API_BASE);

export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("features");
  const [comment, setComment] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // ========================================
  // GET ALL FEEDBACK
  // GET /api/feedback
  // ========================================

  const fetchFeedbacks = async () => {
    try {
      const url = `${API_BASE}/feedback`;

      console.log("Fetching feedback:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      console.log("GET status:", response.status);
      console.log("GET response:", text);

      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.error(
          "Backend returned invalid JSON:",
          text
        );

        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `GET request failed with status ${response.status}`
        );
      }

      // Your backend currently returns:
      // res.json(feedback)

      if (Array.isArray(data)) {
        setFeedbacks(data);
      } else if (Array.isArray(data.feedback)) {
        setFeedbacks(data.feedback);
      } else {
        setFeedbacks([]);
      }

    } catch (error) {
      console.error(
        "Feedback fetch error:",
        error
      );

      setFeedbacks([]);
    }
  };


  // ========================================
  // LOAD FEEDBACK ON PAGE LOAD
  // ========================================

  useEffect(() => {
    fetchFeedbacks();
  }, []);


  // ========================================
  // SUBMIT FEEDBACK
  // POST /api/feedback
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !comment.trim()
    ) {
      alert(
        "Please fill in all required fields."
      );

      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      category: category || "features",
      rating: Number(rating),
      comment: comment.trim(),
    };

    try {
      setLoading(true);

      const url = `${API_BASE}/feedback`;

      console.log(
        "Submitting feedback to:",
        url
      );

      console.log(
        "Payload:",
        payload
      );

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),
      });

      const text = await response.text();

      console.log(
        "POST status:",
        response.status
      );

      console.log(
        "POST response:",
        text
      );

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.error(
          "Invalid JSON response:",
          text
        );

        throw new Error(
          "Backend returned HTML or invalid JSON."
        );
      }

      // Handle backend errors
      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Backend request failed with status ${response.status}`
        );
      }

      console.log(
        "Feedback submitted successfully:",
        data
      );

      // Refresh feedback list
      await fetchFeedbacks();

      // Reset form
      setName("");
      setEmail("");
      setCategory("features");
      setRating(5);
      setComment("");

      // Show success
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error(
        "Feedback post error:",
        error
      );

      alert(
        `Failed to submit feedback: ${
          error.message ||
          "Something went wrong"
        }`
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // AVERAGE RATING
  // ========================================

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (total, feedback) =>
              total +
              Number(feedback.rating || 0),
            0
          ) / feedbacks.length
        ).toFixed(1)
      : "0.0";


  // ========================================
  // UI
  // ========================================

  return (
    <div
      className="container animate-fade-in"
      style={{
        padding: "80px 24px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto 60px",
        }}
      >
        <span className="badge">
          User Feedback
        </span>

        <h1
          className="text-gradient"
          style={{
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          What our users say
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Help us improve NexDocIQ.
          Share your rating, report
          suggestions, or request features
          directly below.
        </p>
      </div>

      <div className="feedback-layout">

        {/* ====================================
            FEEDBACK FORM
        ==================================== */}

        <div className="glass-panel feedback-form-card">

          {submitted ? (

            <div className="feedback-success-state">

              <CheckCircle
                size={48}
                className="text-accent"
              />

              <h3>
                Feedback Submitted!
              </h3>

              <p>
                Thank you for helping us
                make NexDocIQ better.
              </p>

              <button
                onClick={() =>
                  setSubmitted(false)
                }
                className="btn-secondary"
                style={{
                  marginTop: "16px",
                }}
              >
                Write another feedback
              </button>

            </div>

          ) : (

            <form
              onSubmit={handleSubmit}
              className="feedback-form"
            >

              <h3>
                Share Your Experience
              </h3>

              <p
                style={{
                  color:
                    "var(--text-secondary)",
                  fontSize: "13px",
                  marginBottom: "20px",
                }}
              >
                Your insights help shape
                future updates.
              </p>

              <div className="form-row-grid">

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>

              </div>

              {/* Rating */}

              <div
                className="form-group rating-select-group"
                style={{
                  marginBottom: "20px",
                }}
              >

                <label>
                  Rating
                </label>

                <div
                  className="stars-row"
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginTop: "6px",
                  }}
                >

                  {[1, 2, 3, 4, 5].map(
                    (star) => (

                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
                        onMouseEnter={() =>
                          setHoverRating(star)
                        }
                        onMouseLeave={() =>
                          setHoverRating(0)
                        }
                        className="star-btn"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >

                        <Star
                          size={24}
                          className={
                            (hoverRating ||
                              rating) >= star
                              ? "star-icon filled"
                              : "star-icon"
                          }
                        />

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* Comment */}

              <div className="form-group">

                <label>
                  Your Message
                </label>

                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked, or where we can improve..."
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                />

              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  opacity: loading ? 0.7 : 1,
                }}
              >

                <Send size={16} />

                <span>
                  {loading
                    ? "Submitting..."
                    : "Submit Feedback"}
                </span>

              </button>

            </form>
          )}

        </div>


        {/* ====================================
            FEEDBACK DISPLAY
        ==================================== */}

        <div className="feedback-display-panel">

          {/* Average Rating */}

          <div
            className="glass-panel avg-metric-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
              padding: "30px",
              marginBottom: "30px",
            }}
          >

            <div
              style={{
                fontSize: "56px",
                fontWeight: "800",
                color:
                  "var(--accent-primary)",
                lineHeight: 1,
                fontFamily:
                  "var(--font-heading)",
              }}
            >
              {avgRating}
            </div>

            <div>

              <h4
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Average user Rating
              </h4>

              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  margin: "4px 0 8px",
                }}
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <Star
                      key={star}
                      size={14}
                      className={
                        Number(avgRating) >= star
                          ? "star-icon filled"
                          : "star-icon"
                      }
                    />

                  )
                )}

              </div>

              <p
                style={{
                  color:
                    "var(--text-secondary)",
                  fontSize: "13px",
                }}
              >
                Based on{" "}
                {feedbacks.length}{" "}
                submissions
              </p>

            </div>

          </div>

          {/* Recent Reviews */}

          <div className="feedback-feed-header">

            <h4>
              Recent Reviews
            </h4>

            <MessageSquare
              size={16}
              style={{
                color: "var(--text-muted)",
              }}
            />

          </div>

          <div className="feedback-feed-scroll">

            {feedbacks.map(
              (feedback, index) => (

                <div
                  key={
                    feedback._id ||
                    index
                  }
                  className="glass-panel feedback-feed-item"
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      marginBottom: "10px",
                    }}
                  >

                    <div>

                      <h5
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color:
                            "var(--text-primary)",
                        }}
                      >
                        {feedback.name}
                      </h5>

                      <span className="feedback-item-category">
                        {(
                          feedback.category ||
                          "features"
                        ).toUpperCase()}
                      </span>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "2px",
                      }}
                    >

                      {[1, 2, 3, 4, 5].map(
                        (star) => (

                          <Star
                            key={star}
                            size={12}
                            className={
                              Number(
                                feedback.rating
                              ) >= star
                                ? "star-icon filled"
                                : "star-icon"
                            }
                          />

                        )
                      )}

                    </div>

                  </div>

                  <p
                    style={{
                      color:
                        "var(--text-secondary)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                    }}
                  >
                    {feedback.comment}
                  </p>

                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "12px",
                      fontSize: "11px",
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    {feedback.date
                      ? new Date(
                          feedback.date
                        ).toLocaleDateString()
                      : ""}
                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
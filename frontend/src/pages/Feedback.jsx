jsx
import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Send,
  CheckCircle,
} from "lucide-react";
import "./Feedback.css";

// ========================================
// VERCEL API BASE URL
// ========================================
// If frontend and backend are on the same
// Vercel domain, use /api.
//
// Example:
// https://your-app.vercel.app/api/feedback
//
// If VITE_API_URL exists, it will use that.
// Otherwise, it uses /api.
// ========================================

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";


export default function Feedback() {
  // ========================================
  // STATES
  // ========================================

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [category, setCategory] =
    useState("features");

  const [comment, setComment] = useState("");

  const [feedbacks, setFeedbacks] =
    useState([]);

  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ========================================
  // GET FEEDBACKS
  // ========================================

  const fetchFeedbacks = async () => {
    try {
      console.log(
        "Fetching feedback from:",
        `${API_BASE}/feedback`
      );

      const response = await fetch(
        `${API_BASE}/feedback`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      // Get response as text first
      // This prevents:
      // Unexpected token '<'
      const rawText =
        await response.text();

      console.log(
        "Feedback API status:",
        response.status
      );

      console.log(
        "Feedback API response:",
        rawText
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load feedback. Status: ${response.status}`
        );
      }

      // Convert response to JSON
      let data;

      try {
        data = JSON.parse(rawText);
      } catch (error) {
        console.error(
          "Response is not valid JSON:",
          rawText
        );

        throw new Error(
          "Backend returned an invalid response. Check your Vercel API route."
        );
      }

      setFeedbacks(
        Array.isArray(data)
          ? data
          : data.feedback || []
      );

    } catch (err) {
      console.error(
        "Feedback fetch error:",
        err
      );

      setFeedbacks([]);
    }
  };


  // ========================================
  // LOAD FEEDBACK WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    fetchFeedbacks();
  }, []);


  // ========================================
  // SUBMIT FEEDBACK
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
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

      console.log(
        "Submitting feedback to:",
        `${API_BASE}/feedback`
      );

      console.log(
        "Feedback payload:",
        payload
      );

      // ========================================
      // POST REQUEST
      // ========================================

      const response = await fetch(
        `${API_BASE}/feedback`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      // Get response as text first
      const rawText =
        await response.text();

      console.log(
        "POST response status:",
        response.status
      );

      console.log(
        "POST response:",
        rawText
      );

      // ========================================
      // PARSE RESPONSE
      // ========================================

      let data = {};

      if (rawText.trim()) {
        try {
          data = JSON.parse(rawText);
        } catch (error) {
          console.error(
            "Backend returned non-JSON:",
            rawText
          );

          throw new Error(
            "Backend returned HTML or invalid data instead of JSON. Check your Vercel API configuration."
          );
        }
      }

      // ========================================
      // CHECK RESPONSE
      // ========================================

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Backend request failed with status ${response.status}`
        );
      }

      console.log(
        "Feedback submitted successfully:",
        data
      );

      // ========================================
      // REFRESH FEEDBACK LIST
      // ========================================

      await fetchFeedbacks();

      // ========================================
      // RESET FORM
      // ========================================

      setName("");
      setEmail("");
      setCategory("features");
      setRating(5);
      setComment("");

      // Show success message
      setSubmitted(true);

      // Hide success message
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


  // ========================================
  // CALCULATE AVERAGE RATING
  // ========================================

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (acc, curr) =>
              acc +
              Number(curr.rating || 0),
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

      {/* ====================================
          PAGE HEADER
      ==================================== */}

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
          style={{
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
          className="text-gradient"
        >
          What our users say
        </h1>

        <p
          style={{
            color:
              "var(--text-secondary)",
          }}
        >
          Help us improve NexDocIQ.
          Share your rating, report
          suggestions, or request
          features directly below.
        </p>
      </div>


      <div className="feedback-layout">

        {/* ==================================
            LEFT SIDE
        ================================== */}

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
                Your comments are
                appreciated.
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


              {/* Name + Email */}

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
                      setName(
                        e.target.value
                      )
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
                      setEmail(
                        e.target.value
                      )
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
                          background:
                            "none",
                          border: "none",
                          cursor:
                            "pointer",
                          padding: 0,
                        }}
                      >

                        <Star
                          size={24}
                          className={
                            (
                              hoverRating ||
                              rating
                            ) >= star
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
                    setComment(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* Submit Button */}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent:
                    "center",
                  opacity: loading
                    ? 0.7
                    : 1,
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


        {/* ==================================
            RIGHT SIDE
        ================================== */}

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
                  margin:
                    "4px 0 8px",
                }}
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <Star
                      key={star}
                      size={14}
                      className={
                        parseFloat(
                          avgRating
                        ) >= star
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
                color:
                  "var(--text-muted)",
              }}
            />

          </div>


          <div className="feedback-feed-scroll">

            {feedbacks.map(
              (f, i) => (

                <div
                  key={
                    f._id || i
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
                      marginBottom:
                        "10px",
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
                        {f.name}
                      </h5>

                      <span className="feedback-item-category">
                        {(
                          f.category ||
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
                                f.rating
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
                    {f.comment}
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
                    {f.date
                      ? new Date(
                          f.date
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

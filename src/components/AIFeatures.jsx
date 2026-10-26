
import { useState } from "react";
import {
  Sparkles,
  CalendarDays,
  Clock,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Bot,
  MessageCircle,
  Send,
  User,
} from "lucide-react";
import "./AIFeatures.css";

const API_URL = "http://localhost:5000/api";

export default function AIFeatures() {
  // AI schedule parser
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI schedule chatbot
  const [userQuestion, setUserQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI Schedule Assistant. Ask me about your schedules, upcoming events, or when you may be free.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  async function interpretRequest(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setDraft(null);

    if (!request.trim()) {
      setError("Please describe the schedule you want to create.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: request.trim(),
          today: new Date().toISOString().slice(0, 10),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `AI request failed (${response.status}). Check your backend configuration.`
        );
      }

      const result = data.draft || data.schedule || data;

      if (!result || typeof result !== "object") {
        throw new Error("The AI returned an unexpected response.");
      }

      setDraft(result);
      setSuccess("Your schedule request was interpreted successfully.");
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to the backend. Start the server on port 5000."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  // Ask the backend chatbot about existing saved schedules.
  async function askScheduleChatbot(event) {
    if (event) event.preventDefault();

    const question = userQuestion.trim();

    if (!question || chatLoading) return;

    setChatError("");
    setUserQuestion("");
    setChatMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          // Use a local calendar date to interpret relative dates.
          today: [
            new Date().getFullYear(),
            String(new Date().getMonth() + 1).padStart(2, "0"),
            String(new Date().getDate()).padStart(2, "0"),
          ].join("-"),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Chat request failed (${response.status}).`
        );
      }

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.answer || "I couldn't find an answer to that question.",
        },
      ]);
    } catch (err) {
      const message = err.message.includes("Failed to fetch")
        ? "Cannot connect to the backend. Make sure your server is running on port 5000."
        : err.message;

      setChatError(message);
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Sorry, I couldn't answer that. ${message}`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const exampleQuestions = [
    "What is my schedule tomorrow?",
    "Am I free this Friday afternoon?",
    "What tasks do I need to finish this week?",
    "Show me my upcoming deadlines.",
  ];

  return (
    <div className="ai-assistant">
      {/* Welcome heading */}
      <div className="ai-welcome">
        <div className="ai-welcome-icon">
          <Bot size={25} />
        </div>
        <div>
          <span className="ai-eyebrow">YOUR SMART PLANNING PARTNER</span>
          <h2>What would you like to schedule?</h2>
          <p>
            Create schedule drafts or ask questions about your saved events.
          </p>
        </div>
      </div>

      {/* AI schedule chatbot */}
      <div className="ai-card ai-chat-card">
        <div className="ai-card-heading">
          <div className="ai-section-icon">
            <MessageCircle size={21} />
          </div>
          <div>
            <h3>AI Schedule Chatbot</h3>
            <p>
              Ask questions about your existing schedules in ordinary language.
            </p>
          </div>
        </div>

        <div className="ai-chat-messages" aria-live="polite">
          {chatMessages.map((message, index) => (
            <div
              className={`ai-chat-message ${
                message.role === "user" ? "ai-chat-user" : "ai-chat-assistant"
              }`}
              key={`${index}-${message.role}`}
            >
              <div className="ai-chat-avatar">
                {message.role === "user" ? (
                  <User size={17} />
                ) : (
                  <Bot size={17} />
                )}
              </div>
              <div className="ai-chat-bubble">
                <span className="ai-chat-role">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </span>
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="ai-chat-message ai-chat-assistant">
              <div className="ai-chat-avatar">
                <Bot size={17} />
              </div>
              <div className="ai-chat-bubble">
                <span className="ai-chat-role">AI Assistant</span>
                <p className="ai-chat-thinking">
                  <LoaderCircle className="ai-spin" size={16} />
                  Checking your schedules...
                </p>
              </div>
            </div>
          )}
        </div>

        {chatError && (
          <div className="ai-message ai-error" role="alert">
            <AlertCircle size={19} />
            <span>{chatError}</span>
          </div>
        )}

        <form className="ai-chat-form" onSubmit={askScheduleChatbot}>
          <input
            type="text"
            value={userQuestion}
            onChange={(event) => setUserQuestion(event.target.value)}
            placeholder="Ask about your schedules..."
            aria-label="Ask a question about your schedules"
            maxLength={1000}
            disabled={chatLoading}
          />
          <button
            className="ai-primary-button ai-chat-send"
            type="submit"
            disabled={chatLoading || !userQuestion.trim()}
          >
            {chatLoading ? (
              <LoaderCircle className="ai-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            <span>{chatLoading ? "Thinking..." : "Ask AI"}</span>
          </button>
        </form>

        <div className="ai-chat-suggestions">
          <span>Try asking:</span>
          {exampleQuestions.map((question) => (
            <button
              type="button"
              className="ai-chat-suggestion"
              key={question}
              disabled={chatLoading}
              onClick={() => setUserQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Existing AI schedule parser */}
      <div className="ai-card">
        <div className="ai-card-heading">
          <div className="ai-section-icon">
            <Sparkles size={21} />
          </div>
          <div>
            <h3>Create a schedule with AI</h3>
            <p>Turn your everyday language into a schedule draft.</p>
          </div>
        </div>

        <form onSubmit={interpretRequest}>
          <label htmlFor="ai-request">Describe your schedule</label>
          <textarea
            id="ai-request"
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="Example: Class meeting tomorrow at 2 PM for one hour in Room 201."
            rows={5}
            maxLength={1000}
            disabled={loading}
          />

          <div className="ai-input-footer">
            <span>{request.length}/1000 characters</span>
            <span>Be specific about the date and time</span>
          </div>

          <button
            className="ai-primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="ai-spin" size={18} />
                Interpreting your request...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Interpret request
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="ai-message ai-error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="ai-message ai-success" role="status">
            <CheckCircle2 size={19} />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Parsed schedule draft */}
      {draft && (
        <div className="ai-card ai-result-card">
          <div className="ai-card-heading">
            <div className="ai-section-icon ai-result-icon">
              <CalendarDays size={21} />
            </div>
            <div>
              <h3>Schedule draft</h3>
              <p>Review the details returned by the AI.</p>
            </div>
          </div>

          <div className="ai-draft-grid">
            <div className="ai-draft-field">
              <span>Schedule title</span>
              <strong>{draft.title || "Not provided"}</strong>
            </div>
            <div className="ai-draft-field">
              <span>Date</span>
              <strong>{draft.date || "Not provided"}</strong>
            </div>
            <div className="ai-draft-field">
              <span>Start time</span>
              <strong>
                <Clock size={15} />
                {draft.startTime || "Not provided"}
              </strong>
            </div>
            <div className="ai-draft-field">
              <span>End time</span>
              <strong>
                <Clock size={15} />
                {draft.endTime || "Not provided"}
              </strong>
            </div>
            <div className="ai-draft-field">
              <span>Location</span>
              <strong>{draft.location || "Not specified"}</strong>
            </div>
            <div className="ai-draft-field">
              <span>Description</span>
              <strong>{draft.description || "Not provided"}</strong>
            </div>
          </div>

          {draft.question && (
            <p className="ai-review-note">{draft.question}</p>
          )}

          <p className="ai-review-note">
            This is a draft only. Verify the date and time before saving it in
            your schedule system.
          </p>
        </div>
      )}

      <div className="ai-tip">
        <Sparkles size={18} />
        <div>
          <strong>Try creating a schedule</strong>
          <p>"Schedule a team meeting tomorrow at 2 PM for one hour."</p>
        </div>
        <button
          type="button"
          onClick={() =>
            setRequest(
              "Schedule a team meeting tomorrow at 2 PM for one hour."
            )
          }
          aria-label="Use example request"
        >
          Use example
        </button>
      </div>
    </div>
  );
}

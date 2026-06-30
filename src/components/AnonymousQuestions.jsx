import React, { useState } from "react";
import { faPaperPlane, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { submitAnonymousQuestion } from "../services/questionService";

function AnonymousQuestions() {
  const [alias, setAlias] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setErrorMessage("");

    try {
      await submitAnonymousQuestion({ alias, contact, question });
      setContact("");
      setQuestion("");
      setMessage("Câu hỏi đã được gửi. Mình sẽ liên hệ qua email hoặc số điện thoại bạn để lại khi có câu trả lời.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="anonymous-questions">
      <article className="question-form-card">
        <div className="question-form-heading">
          <span>
            <FontAwesomeIcon icon={faQuestionCircle} />
          </span>
          <div>
            <h3>Hỏi ẩn danh</h3>
            <p>Đặt câu hỏi về học coding, MOS, dự án, kinh nghiệm hoặc cơ hội làm việc.</p>
          </div>
        </div>

        <form className="question-form" onSubmit={handleSubmit}>
          <label>
            Tên ẩn danh
            <input
              type="text"
              value={alias}
              onChange={(event) => setAlias(event.target.value)}
              placeholder="Ví dụ: Một bạn đang học React"
              maxLength={40}
            />
          </label>

          <label>
            Email hoặc số điện thoại để nhận câu trả lời
            <input
              type="text"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Ví dụ: ban@example.com hoặc 09xxxxxxxx"
              maxLength={80}
              autoComplete="email tel"
              required
            />
          </label>

          <label>
            Câu hỏi
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Bạn muốn hỏi điều gì?"
              maxLength={600}
              rows={5}
              required
            />
          </label>

          {message ? <div className="question-success">{message}</div> : null}
          {errorMessage ? <div className="admin-error">{errorMessage}</div> : null}

          <button type="submit" className="button-primary" disabled={isSubmitting}>
            <FontAwesomeIcon icon={faPaperPlane} />
            {isSubmitting ? "Đang gửi..." : "Gửi câu hỏi"}
          </button>
        </form>
      </article>

    </div>
  );
}

export default AnonymousQuestions;

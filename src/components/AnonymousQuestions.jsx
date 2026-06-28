import React, { useEffect, useState } from "react";
import { faCommentDots, faPaperPlane, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  submitAnonymousQuestion,
  subscribeAnsweredQuestions,
} from "../services/questionService";

const formatQuestionTime = (value) => {
  if (!value?.toDate) {
    return "";
  }

  return new Intl.DateTimeFormat("vi", {
    dateStyle: "medium",
  }).format(value.toDate());
};

function AnonymousQuestions() {
  const [alias, setAlias] = useState("");
  const [question, setQuestion] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return subscribeAnsweredQuestions(setAnsweredQuestions, (error) => setErrorMessage(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setErrorMessage("");

    try {
      await submitAnonymousQuestion({ alias, question });
      setQuestion("");
      setMessage("Câu hỏi đã được gửi. Mình sẽ trả lời trong dashboard và công khai nếu phù hợp.");
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

      <article className="answered-questions-card">
        <div className="question-form-heading">
          <span>
            <FontAwesomeIcon icon={faCommentDots} />
          </span>
          <div>
            <h3>Câu hỏi đã trả lời</h3>
            <p>Câu trả lời sẽ hiện ở đây sau khi mình phản hồi trong dashboard.</p>
          </div>
        </div>

        <div className="answered-question-list">
          {answeredQuestions.length ? (
            answeredQuestions.slice(0, 5).map((item) => (
              <div className="answered-question" key={item.id}>
                <div>
                  <strong>{item.alias || "Người hỏi ẩn danh"}</strong>
                  <time>{formatQuestionTime(item.answeredAt)}</time>
                </div>
                <p className="answered-question-text">{item.question}</p>
                <p className="answered-question-answer">{item.answer}</p>
              </div>
            ))
          ) : (
            <p className="admin-empty">Chưa có câu hỏi công khai nào.</p>
          )}
        </div>
      </article>
    </div>
  );
}

export default AnonymousQuestions;

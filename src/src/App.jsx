import React, { useState } from "react";

const lessons = [
  {
    title: "Greetings",
    words: [
      { prompt: "Hello", answer: "أهلاً" },
      { prompt: "How are you?", answer: "إزيك" },
      { prompt: "Good morning", answer: "صباح الخير" }
    ]
  },
  {
    title: "Question Words",
    words: [
      { prompt: "What?", answer: "إيه" },
      { prompt: "Where?", answer: "فين" },
      { prompt: "Why?", answer: "ليه" }
    ]
  }
];

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-EG";
  speechSynthesis.speak(u);
}

export default function App() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);

  const lesson = lessons[lessonIndex];
  const word = lesson.words[wordIndex];

  const next = () => {
    if (wordIndex < lesson.words.length - 1) {
      setWordIndex(wordIndex + 1);
    } else {
      setWordIndex(0);
    }
    setInput("");
    setShow(false);
  };

  const prev = () => {
    if (wordIndex > 0) {
      setWordIndex(wordIndex - 1);
    }
    setInput("");
    setShow(false);
  };

  return (
    <div style={{ display: "flex", fontFamily: "Arial" }}>
      
      {/* Sidebar */}
      <div style={{ width: 250, padding: 20, background: "#f1f5f9" }}>
        <h3>Lessons</h3>
        {lessons.map((l, i) => (
          <div
            key={i}
            onClick={() => {
              setLessonIndex(i);
              setWordIndex(0);
            }}
            style={{
              padding: 10,
              marginBottom: 10,
              cursor: "pointer",
              background: i === lessonIndex ? "#0f172a" : "white",
              color: i === lessonIndex ? "white" : "black"
            }}
          >
            {l.title}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 40 }}>
        <h2>{lesson.title}</h2>

        <h1>{word.prompt}</h1>

        <button onClick={() => speak(word.answer)}>🔊 Hear</button>

        <div style={{ marginTop: 20 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type answer"
          />
        </div>

        {!show ? (
          <button onClick={() => setShow(true)}>Check</button>
        ) : (
          <div>
            <h2>{word.answer}</h2>
            <button onClick={prev}>⬅ Back</button>
            <button onClick={next}>Next ➡</button>
          </div>
        )}
      </div>
    </div>
  );
}

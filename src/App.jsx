import React, { useMemo, useState } from "react";

const lessons = [
  {
    id: 1,
    title: "Begrüßungen",
    language: "Egyptian Arabic",
    level: "Beginner",
    words: [
      { prompt: "Peace be upon you", answer: "السلام عليكم", translit: "al salamu alaykum" },
      { prompt: "And peace be upon you", answer: "وعليكم السلام", translit: "wa alaykum al salam" },
      { prompt: "Good morning", answer: "صباح الخير", translit: "sabah el kheir" },
      { prompt: "Morning of light", answer: "صباح النور", translit: "sabah el nur" },
      { prompt: "Hello / welcome", answer: "أهلاً", translit: "ahlan" },
      { prompt: "How are you?", answer: "إزيك", translit: "ezzayak" },
    ],
  },
  {
    id: 2,
    title: "Question Words",
    language: "Egyptian Arabic",
    level: "Beginner",
    words: [
      { prompt: "What?", answer: "إيه", translit: "eh" },
      { prompt: "Who?", answer: "مين", translit: "min" },
      { prompt: "Where?", answer: "فين", translit: "fein" },
      { prompt: "When?", answer: "إمتى", translit: "emta" },
      { prompt: "Why?", answer: "ليه", translit: "leh" },
      { prompt: "How?", answer: "إزاي", translit: "ezzay" },
    ],
  },
  {
    id: 3,
    title: "Numbers",
    language: "Egyptian Arabic",
    level: "Beginner",
    words: [
      { prompt: "1", answer: "واحد", translit: "wahed" },
      { prompt: "2", answer: "اتنين", translit: "etneen" },
      { prompt: "3", answer: "تلاتة", translit: "talata" },
      { prompt: "4", answer: "أربعة", translit: "arba3a" },
      { prompt: "5", answer: "خمسة", translit: "khamsa" },
      { prompt: "10", answer: "عشرة", translit: "ashara" },
    ],
  },
];

function getSpeechLang(lesson) {
  if (!lesson) return "en-US";
  if (lesson.language === "Egyptian Arabic") return "ar-EG";
  return "en-US";
}

function speak(text, lesson) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechLang(lesson);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function createRecognition(language, onResult, onEnd) {
  if (typeof window === "undefined") return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = getSpeechLang({ language });
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || "";
    onResult(transcript);
  };
  recognition.onend = () => onEnd(false);
  recognition.onerror = () => onEnd(false);
  return recognition;
}

async function beginAudioRecording(onReady, onSaved) {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
    const url = URL.createObjectURL(blob);
    onSaved(url);
    stream.getTracks().forEach((track) => track.stop());
  };

  recorder.start();
  onReady(recorder);
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/[؟?!.,]/g, "");
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
  },
  wrap: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    margin: "0 0 8px 0",
  },
  subtitle: {
    margin: 0,
    color: "#475569",
  },
  stats: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  statCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    minWidth: 120,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 24,
  },
  sidebar: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 16,
    height: "fit-content",
  },
  main: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 20,
  },
  search: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  lessonButton: {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    padding: 12,
    background: "white",
    marginBottom: 10,
    cursor: "pointer",
  },
  activeLessonButton: {
    background: "#0f172a",
    color: "white",
    border: "1px solid #0f172a",
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    background: "#e2e8f0",
    fontSize: 12,
    marginRight: 6,
    marginTop: 6,
  },
  progressOuter: {
    width: "100%",
    height: 10,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
    marginBottom: 20,
  },
  progressInner: (value) => ({
    width: `${value}%`,
    height: "100%",
    background: "#0f172a",
  }),
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 20,
    background: "#fff",
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16,
  },
  button: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
  },
  primaryButton: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: "#0f172a",
    color: "white",
    cursor: "pointer",
  },
  inputRow: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 220,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
  },
  infoBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
};

export default function LanguageLearningApp() {
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [latestRecordingUrl, setLatestRecordingUrl] = useState(null);
  const [teacherAudio, setTeacherAudio] = useState({});
  const [tab, setTab] = useState("practice");

  const filteredLessons = useMemo(() => {
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(search.toLowerCase()) ||
        lesson.language.toLowerCase().includes(search.toLowerCase()) ||
        lesson.level.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedLesson = useMemo(() => {
    return lessons.find((lesson) => lesson.id === selectedLessonId) || lessons[0];
  }, [selectedLessonId]);

  const currentWord = selectedLesson.words[currentIndex];
  const progress = ((currentIndex + (showAnswer ? 1 : 0)) / selectedLesson.words.length) * 100;
  const speechRecognitionSupported =
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const recordingSupported =
    typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  const currentCardKey = `${selectedLesson.id}-${currentIndex}`;
  const currentTeacherAudio = teacherAudio[currentCardKey] || null;
  const streak = completed.length * 3 + score;

  const checkAnswer = () => {
    if (!currentWord) return;
    const isCorrect = normalize(input) === normalize(currentWord.answer);
    if (isCorrect) setScore((prev) => prev + 1);
    setShowAnswer(true);
  };

  const startVoiceInput = () => {
    const recognition = createRecognition(
      selectedLesson.language,
      (transcript) => setInput(transcript),
      setIsListening
    );

    if (!recognition) return;
    setIsListening(true);
    recognition.start();
  };

  const toggleRecording = async () => {
    if (isRecording && recorder) {
      recorder.stop();
      setRecorder(null);
      setIsRecording(false);
      return;
    }

    await beginAudioRecording(
      (mediaRecorder) => {
        setRecorder(mediaRecorder);
        setIsRecording(true);
      },
      (url) => {
        setLatestRecordingUrl(url);
        setIsRecording(false);
      }
    );
  };

  const saveAsLessonVoice = () => {
    if (!latestRecordingUrl) return;
    setTeacherAudio((prev) => ({ ...prev, [currentCardKey]: latestRecordingUrl }));
  };

  const nextCard = () => {
    if (currentIndex < selectedLesson.words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInput("");
      setShowAnswer(false);
      setLatestRecordingUrl(null);
      return;
    }

    if (!completed.includes(selectedLesson.id)) {
      setCompleted((prev) => [...prev, selectedLesson.id]);
    }

    setCurrentIndex(0);
    setInput("");
    setShowAnswer(false);
    setLatestRecordingUrl(null);
  };

  const resetLesson = () => {
    setCurrentIndex(0);
    setInput("");
    setShowAnswer(false);
    setScore(0);
    setLatestRecordingUrl(null);
  };

  const changeLesson = (id) => {
    setSelectedLessonId(id);
    setCurrentIndex(0);
    setInput("");
    setShowAnswer(false);
    setLatestRecordingUrl(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Lingua Sprint Test</h1>
            <p style={styles.subtitle}>
              Simple online test version of your Egyptian Arabic app with microphone, recording, and your own lesson voice.
            </p>
          </div>
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Score</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{score}</div>
            </div>
            <div style={styles.statCard}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Lessons done</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{completed.length}</div>
            </div>
            <div style={styles.statCard}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Streak</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{streak}</div>
            </div>
          </div>
        </div>

        <div style={styles.layout}>
          <div style={styles.sidebar}>
            <h3 style={{ marginTop: 0 }}>Lessons</h3>
            <input
              style={styles.search}
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredLessons.map((lesson) => {
              const active = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => changeLesson(lesson.id)}
                  style={{
                    ...styles.lessonButton,
                    ...(active ? styles.activeLessonButton : {}),
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{lesson.title}</div>
                  <div>
                    <span style={styles.badge}>{lesson.language}</span>
                    <span style={styles.badge}>{lesson.level}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={styles.main}>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <button
                onClick={() => setTab("practice")}
                style={{
                  ...styles.button,
                  ...(tab === "practice" ? { background: "#0f172a", color: "white", borderColor: "#0f172a" } : {}),
                }}
              >
                Practice
              </button>
              <button
                onClick={() => setTab("review")}
                style={{
                  ...styles.button,
                  ...(tab === "review" ? { background: "#0f172a", color: "white", borderColor: "#0f172a" } : {}),
                }}
              >
                Review
              </button>
            </div>

            {tab === "practice" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{selectedLesson.title}</h2>
                    <p style={{ color: "#64748b" }}>
                      Card {currentIndex + 1} of {selectedLesson.words.length}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={styles.button} onClick={resetLesson}>Reset</button>
                    <button
                      style={styles.button}
                      onClick={() => {
                        if (currentTeacherAudio) {
                          const audio = new Audio(currentTeacherAudio);
                          audio.play();
                        } else {
                          speak(currentWord.answer, selectedLesson);
                        }
                      }}
                    >
                      {currentTeacherAudio ? "Play my voice" : "Default voice"}
                    </button>
                  </div>
                </div>

                <div style={styles.progressOuter}>
                  <div style={styles.progressInner(progress)} />
                </div>

                <div style={styles.card}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
                    Translate this
                  </div>
                  <h2 style={{ fontSize: 34, marginTop: 0 }}>{currentWord.prompt}</h2>
                  <p style={{ color: "#64748b" }}>Type, speak, or record your answer in Egyptian Arabic.</p>

                  <div style={styles.actions}>
                    <button
                      style={styles.button}
                      onClick={toggleRecording}
                      disabled={!recordingSupported}
                    >
                      {isRecording ? "Stop Recording" : "Record My Voice"}
                    </button>
                    {latestRecordingUrl && <audio controls src={latestRecordingUrl} />}
                    {latestRecordingUrl && (
                      <button style={styles.button} onClick={saveAsLessonVoice}>
                        Save as lesson voice
                      </button>
                    )}
                  </div>

                  {!recordingSupported && (
                    <div style={styles.infoBox}>Audio recording needs browser microphone support.</div>
                  )}

                  {currentTeacherAudio && (
                    <div style={styles.infoBox}>
                      <div style={{ marginBottom: 8, color: "#64748b" }}>Saved voice for this card</div>
                      <audio controls src={currentTeacherAudio} />
                    </div>
                  )}

                  <div style={styles.inputRow}>
                    <input
                      style={styles.input}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Your answer"
                    />
                    <button
                      style={styles.button}
                      onClick={startVoiceInput}
                      disabled={!speechRecognitionSupported || isListening}
                    >
                      {isListening ? "Listening..." : "Mic Input"}
                    </button>
                  </div>

                  {!speechRecognitionSupported && (
                    <div style={styles.infoBox}>Voice input works best in Chrome or Edge.</div>
                  )}

                  {!showAnswer ? (
                    <div style={{ marginTop: 16 }}>
                      <button style={styles.primaryButton} onClick={checkAnswer}>Check answer</button>
                    </div>
                  ) : (
                    <div style={styles.infoBox}>
                      <div style={{ color: "#64748b", marginBottom: 6 }}>Correct answer</div>
                      <div style={{ fontSize: 28, fontWeight: 700 }}>{currentWord.answer}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{currentWord.translit}</div>
                      <div style={{ marginTop: 14 }}>
                        <button style={styles.primaryButton} onClick={nextCard}>Next card</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.reviewGrid}>
                {selectedLesson.words.map((word, idx) => {
                  const reviewAudio = teacherAudio[`${selectedLesson.id}-${idx}`] || null;
                  return (
                    <div key={idx} style={styles.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <strong>{word.prompt}</strong>
                        <button
                          style={styles.button}
                          onClick={() => {
                            if (reviewAudio) {
                              const audio = new Audio(reviewAudio);
                              audio.play();
                            } else {
                              speak(word.answer, selectedLesson);
                            }
                          }}
                        >
                          Play
                        </button>
                      </div>
                      <div style={{ fontSize: 26, marginTop: 14 }}>{word.answer}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{word.translit}</div>
                      {reviewAudio && <audio controls src={reviewAudio} style={{ marginTop: 12, width: "100%" }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

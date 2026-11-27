 "use client";

import { useState } from "react";

type Question = { question: string; choices: string[]; answer: number; explanation: string; };

export default function Home() {
  const [topic, setTopic] = useState("친구 사이의 서운함과 진심 어린 사과");
  const [difficulty, setDifficulty] = useState("보통");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  async function generate() {
    if (!topic.trim()) { setError("테스트 주제를 입력해 주세요."); return; }
    setLoading(true); setError(""); setQuestions([]); setAnswers([]); setCurrent(0); setFinished(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "문제를 생성하지 못했습니다.");
      setQuestions(data.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  function choose(i: number) {
    const next = [...answers]; next[current] = i; setAnswers(next);
  }
  const score = questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);

  return (
    <main className="shell">
      <header className="top"><div className="mark">FT</div><span>FRIENDSHIP TEST</span><span className="tag">AI QUIZ</span></header>
      <section className="hero">
        <p className="eyebrow">UNDERSTAND THE HIDDEN MEANING</p>
        <h1>말속에 숨겨진<br/><em>마음의 의미</em>를 읽다.</h1>
        <p className="sub">상황을 이해하고, 말의 뉘앙스를 읽고,<br/>관계 속 진심을 판단하는 30문항 테스트.</p>
      </section>

      {!questions.length && <section className="panel">
        <label htmlFor="topic">테스트 주제</label>
        <textarea id="topic" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="예: 친구 사이의 오해와 화해"/>
        <label>난이도</label>
        <div className="levels">{["쉬움","보통","어려움","전문가"].map(x=><button key={x} className={difficulty===x?"level active":"level"} onClick={()=>setDifficulty(x)}>{x}</button>)}</div>
        <button className="primary" onClick={generate} disabled={loading}>{loading?"문제를 만드는 중...":"30문항 테스트 생성하기"} <span>→</span></button>
        {error && <p className="error">{error}</p>}
        <p className="hint">문항 30개 · 5지선다 · 정답 및 상세 해설</p>
      </section>}

      {!!questions.length && !finished && <section className="panel">
        <div className="progressline"><span>QUESTION {current+1} / {questions.length}</span><span>{Math.round((current+1)/questions.length*100)}%</span></div>
        <div className="bar"><i style={{width:`${(current+1)/questions.length*100}%`}}/></div>
        <h2 className="question">{questions[current].question}</h2>
        <div className="choices">{questions[current].choices.map((c,i)=><button key={i} onClick={()=>choose(i)} className={answers[current]===i?"choice selected":"choice"}><b>{["①","②","③","④","⑤"][i]}</b>{c}</button>)}</div>
        <div className="actions">
          <button className="secondary" disabled={current===0} onClick={()=>setCurrent(current-1)}>이전</button>
          {current<questions.length-1 ? <button className="primary next" disabled={answers[current]===undefined} onClick={()=>setCurrent(current+1)}>다음 문항 →</button> : <button className="primary next" disabled={answers[current]===undefined} onClick={()=>setFinished(true)}>결과 확인 →</button>}
        </div>
      </section>}

      {finished && <section className="panel result">
        <p className="eyebrow">YOUR RESULT</p><h2>테스트 완료</h2>
        <div className="score">{score}<small> / {questions.length}</small></div>
        <p className="sub">{score>=25?"상황과 말의 뉘앙스를 세심하게 파악했어요.":score>=17?"핵심을 잘 파악했어요. 해설을 통해 더 깊이 이해해 보세요.":"각 상황의 맥락과 상대의 관점을 다시 살펴보세요."}</p>
        {questions.map((q,i)=><article className="explain" key={i}><b>{i+1}. {q.question}</b><p>정답: {["①","②","③","④","⑤"][q.answer]}</p><p>{q.explanation}</p></article>)}
        <button className="primary" onClick={()=>{setQuestions([]);setFinished(false);setAnswers([]);}}>새 테스트 만들기</button>
      </section>}
      <footer>FRIENDSHIP TEST <span>© 2026</span></footer>
    </main>
  );
}
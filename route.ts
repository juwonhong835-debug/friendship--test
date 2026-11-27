import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "서버에 OpenAI API 키가 설정되지 않았습니다. 배포 설정에서 환경 변수를 추가해야 합니다." }, { status: 500 });

    const { topic, difficulty } = await req.json();
    if (typeof topic !== "string" || !topic.trim()) return NextResponse.json({ error: "주제를 입력해 주세요." }, { status: 400 });

    const prompt = `주제: ${topic}\n난이도: ${difficulty}\n한국어로 30개의 독창적인 객관식 문제를 만들어라. 각 문항은 선택지 5개, 정답 인덱스(answer, 0부터 4), 상세 해설을 포함한다. 선택지는 서로 구별되어야 하며, 문맥이 부족해 복수 정답이 되는 모호한 문항은 피한다. 반드시 아래 JSON 구조로만 출력한다: {"questions":[{"question":"질문","choices":["선택지1","선택지2","선택지3","선택지4","선택지5"],"answer":0,"explanation":"정답 근거와 오답이 부적절한 이유를 설명"}]}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4.1-mini", input: prompt })
    });
    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: "AI 요청에 실패했습니다. API 키와 사용 가능 상태를 확인해 주세요." }, { status: 502 });

    const output = (result.output || []).flatMap((item: any) => item.content || []).find((part: any) => part.type === "output_text")?.text;
    if (!output) throw new Error("AI 응답을 읽을 수 없습니다.");
    const cleaned = output.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.questions) || parsed.questions.length !== 30 ||
        parsed.questions.some((q: any) => !Array.isArray(q.choices) || q.choices.length !== 5 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 4)) {
      throw new Error("생성된 문항 형식이 올바르지 않습니다.");
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "문제 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
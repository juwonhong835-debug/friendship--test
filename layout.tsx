import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRIENDSHIP TEST",
  description: "말속에 숨겨진 마음의 의미를 읽는 AI 우정 테스트"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
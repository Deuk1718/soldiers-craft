export interface PastelColor {
  label: string;
  rgb: [number, number, number];
}

export const PASTEL_PRESETS: PastelColor[] = [
  // ── 레드/핑크 계열 ──
  { label: "체리블로썸", rgb: [255, 183, 197] },
  { label: "핑크", rgb: [255, 182, 193] },
  { label: "베이비핑크", rgb: [255, 200, 210] },
  { label: "로즈", rgb: [255, 153, 170] },
  { label: "딥로즈", rgb: [240, 140, 160] },
  { label: "핫핑크", rgb: [255, 160, 180] },
  { label: "플라밍고", rgb: [252, 175, 185] },
  { label: "카네이션", rgb: [255, 166, 175] },
  { label: "로즈골드", rgb: [240, 195, 185] },
  { label: "매그놀리아", rgb: [248, 232, 235] },

  // ── 오렌지/코랄 계열 ──
  { label: "코랄", rgb: [255, 160, 140] },
  { label: "살몬", rgb: [250, 180, 160] },
  { label: "피치", rgb: [255, 218, 185] },
  { label: "아프리콧", rgb: [255, 200, 160] },
  { label: "오렌지크림", rgb: [255, 200, 140] },
  { label: "탠저린", rgb: [255, 190, 130] },
  { label: "망고", rgb: [255, 210, 150] },
  { label: "파파야", rgb: [255, 220, 170] },
  { label: "캔탈로프", rgb: [255, 210, 160] },
  { label: "샌드", rgb: [245, 225, 195] },

  // ── 옐로 계열 ──
  { label: "레몬", rgb: [255, 250, 180] },
  { label: "바나나", rgb: [255, 240, 160] },
  { label: "크림", rgb: [255, 253, 220] },
  { label: "버터", rgb: [255, 245, 190] },
  { label: "샴페인", rgb: [250, 240, 210] },
  { label: "바닐라", rgb: [255, 248, 220] },
  { label: "골드", rgb: [255, 235, 170] },
  { label: "허니", rgb: [255, 230, 160] },
  { label: "선샤인", rgb: [255, 245, 170] },
  { label: "카나리아", rgb: [255, 250, 160] },

  // ── 그린 계열 ──
  { label: "라임", rgb: [200, 255, 180] },
  { label: "민트", rgb: [170, 240, 209] },
  { label: "에메랄드", rgb: [160, 230, 200] },
  { label: "세이지", rgb: [190, 220, 190] },
  { label: "피스타치오", rgb: [200, 240, 180] },
  { label: "매치", rgb: [195, 235, 190] },
  { label: "올리브", rgb: [200, 220, 175] },
  { label: "스프링", rgb: [185, 245, 195] },
  { label: "포레스트", rgb: [175, 225, 185] },
  { label: "모스", rgb: [190, 215, 180] },

  // ── 시안/틸 계열 ──
  { label: "아쿠아", rgb: [160, 235, 235] },
  { label: "틸", rgb: [170, 225, 225] },
  { label: "터콰이즈", rgb: [165, 230, 225] },
  { label: "씨폼", rgb: [175, 240, 230] },
  { label: "세레스트", rgb: [180, 235, 240] },
  { label: "오션", rgb: [165, 220, 235] },
  { label: "아이스", rgb: [195, 240, 245] },
  { label: "글래시어", rgb: [185, 235, 245] },
  { label: "스프레이", rgb: [175, 230, 240] },
  { label: "미스트", rgb: [200, 240, 240] },

  // ── 블루 계열 ──
  { label: "스카이", rgb: [173, 216, 250] },
  { label: "베이비블루", rgb: [190, 210, 255] },
  { label: "코발트", rgb: [175, 195, 245] },
  { label: "파우더", rgb: [200, 220, 255] },
  { label: "세룰리안", rgb: [170, 200, 245] },
  { label: "콘플라워", rgb: [180, 200, 250] },
  { label: "덴임", rgb: [175, 195, 235] },
  { label: "스틸", rgb: [190, 205, 230] },
  { label: "블루벨", rgb: [185, 195, 245] },
  { label: "페리윙클", rgb: [180, 190, 255] },

  // ── 퍼플 계열 ──
  { label: "라벤더", rgb: [200, 180, 255] },
  { label: "바이올렛", rgb: [215, 170, 255] },
  { label: "라일락", rgb: [220, 190, 240] },
  { label: "아메시스트", rgb: [210, 175, 245] },
  { label: "오키드", rgb: [225, 185, 245] },
  { label: "헬리오트로프", rgb: [215, 180, 240] },
  { label: "위스테리아", rgb: [210, 190, 240] },
  { label: "그레이프", rgb: [200, 175, 235] },
  { label: "아이리스", rgb: [195, 180, 250] },
  { label: "모브", rgb: [230, 180, 220] },

  // ── 마젠타/푸시아 계열 ──
  { label: "푸시아", rgb: [240, 175, 220] },
  { label: "플럼", rgb: [225, 175, 210] },
  { label: "마젠타", rgb: [240, 180, 225] },
  { label: "버블검", rgb: [250, 185, 215] },
  { label: "히비스커스", rgb: [245, 170, 200] },
  { label: "피오니", rgb: [248, 190, 215] },
  { label: "체리", rgb: [245, 170, 190] },
  { label: "튤립", rgb: [250, 185, 205] },
  { label: "달리아", rgb: [240, 178, 208] },
  { label: "카멜리아", rgb: [248, 195, 215] },

  // ── 뉴트럴 계열 ──
  { label: "흰색", rgb: [255, 255, 255] },
  { label: "실버", rgb: [210, 210, 220] },
  { label: "펄", rgb: [235, 230, 240] },
  { label: "토프", rgb: [220, 210, 195] },
  { label: "블러쉬", rgb: [245, 230, 225] },
  { label: "아이보리", rgb: [255, 250, 240] },
  { label: "린넨", rgb: [245, 240, 230] },
  { label: "오팔", rgb: [230, 225, 240] },
  { label: "문스톤", rgb: [225, 225, 235] },
  { label: "애쉬", rgb: [215, 215, 210] },

  // ── 랜덤 ──
  { label: "🎲 랜덤", rgb: [0, 0, 0] },
];

export const getRandomPastel = (): [number, number, number] => {
  const r = 170 + Math.floor(Math.random() * 85);
  const g = 170 + Math.floor(Math.random() * 85);
  const b = 170 + Math.floor(Math.random() * 85);
  return [r, g, b];
};

// Color category labels for UI grouping
export const COLOR_CATEGORIES = [
  { label: "레드/핑크", start: 0, count: 10 },
  { label: "오렌지/코랄", start: 10, count: 10 },
  { label: "옐로", start: 20, count: 10 },
  { label: "그린", start: 30, count: 10 },
  { label: "시안/틸", start: 40, count: 10 },
  { label: "블루", start: 50, count: 10 },
  { label: "퍼플", start: 60, count: 10 },
  { label: "마젠타", start: 70, count: 10 },
  { label: "뉴트럴", start: 80, count: 10 },
];

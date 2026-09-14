import type { CourseTint } from "@/lib/schedule/types"

const TINT_RULES: Array<{ tint: CourseTint; needles: string[] }> = [
  { tint: "pe", needles: ["体育"] },
  { tint: "language", needles: ["学术语言与沟通"] },
  { tint: "politics", needles: ["习近平"] },
  { tint: "psychology", needles: ["心理健康"] },
  { tint: "math", needles: ["高等数学", "线性代数"] },
  { tint: "programming", needles: ["程序设计", "编程导论"] },
]

export function courseTintForTitle(title: string): CourseTint {
  for (const rule of TINT_RULES) {
    if (rule.needles.some((needle) => title.includes(needle))) {
      return rule.tint
    }
  }
  return "default"
}

export const courseTintClassName: Record<CourseTint, string> = {
  default:
    "bg-course-default hover:bg-course-default-hover data-popup-open:bg-course-default-hover",
  pe: "bg-course-pe hover:bg-course-pe-hover data-popup-open:bg-course-pe-hover",
  language:
    "bg-course-language hover:bg-course-language-hover data-popup-open:bg-course-language-hover",
  politics:
    "bg-course-politics hover:bg-course-politics-hover data-popup-open:bg-course-politics-hover",
  psychology:
    "bg-course-psychology hover:bg-course-psychology-hover data-popup-open:bg-course-psychology-hover",
  math: "bg-course-math hover:bg-course-math-hover data-popup-open:bg-course-math-hover",
  programming:
    "bg-course-programming hover:bg-course-programming-hover data-popup-open:bg-course-programming-hover",
}

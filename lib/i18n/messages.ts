export type Locale = "zh" | "en"

export type Messages = {
  appTitle: string
  importSchedule: string
  importing: string
  emptyTitle: string
  emptyDescription: string
  weekLabel: (week: number) => string
  previousWeek: string
  nextWeek: string
  selectWeek: string
  period: string
  periodLabel: (sectionNumber: number) => string
  periodTime: (startTime: string, endTime: string) => string
  days: [string, string, string, string, string, string, string]
  academicTerm: string
  className: string
  major: string
  department: string
  printedAt: string
  studentName: string
  university: string
  notesTitle: string
  importSuccess: string
  importError: string
  language: string
  chinese: string
  english: string
}

function formatPeriodTime(startTime: string, endTime: string): string {
  return `${startTime}–${endTime}`
}

export const messages: Record<Locale, Messages> = {
  zh: {
    appTitle: "课程表",
    importSchedule: "导入课表",
    importing: "正在导入…",
    emptyTitle: "还没有课表",
    emptyDescription:
      "导入学校导出的 Excel 课表（.xls 或 .xlsx）。新导入会覆盖当前数据。",
    weekLabel: (week) => `第 ${week} 周`,
    previousWeek: "上一周",
    nextWeek: "下一周",
    selectWeek: "选择周次",
    period: "节次",
    periodLabel: (sectionNumber) => `第 ${sectionNumber} 节`,
    periodTime: formatPeriodTime,
    days: [
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
      "星期日",
    ],
    academicTerm: "学年学期",
    className: "班级",
    major: "专业",
    department: "院系",
    printedAt: "打印日期",
    studentName: "学生",
    university: "学校",
    notesTitle: "备注",
    importSuccess: "课表已导入。",
    importError: "无法读取该课表文件。请使用学校导出的 .xls 或 .xlsx 文件。",
    language: "语言",
    chinese: "中文",
    english: "English",
  },
  en: {
    appTitle: "Schedule",
    importSchedule: "Import schedule",
    importing: "Importing…",
    emptyTitle: "No schedule yet",
    emptyDescription:
      "Import the Excel timetable exported by the school (.xls or .xlsx). A new import replaces the current data.",
    weekLabel: (week) => `Week ${week}`,
    previousWeek: "Previous week",
    nextWeek: "Next week",
    selectWeek: "Select week",
    period: "Period",
    periodLabel: (sectionNumber) => `Period ${sectionNumber}`,
    periodTime: formatPeriodTime,
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    academicTerm: "Academic term",
    className: "Class",
    major: "Major",
    department: "Department",
    printedAt: "Printed",
    studentName: "Student",
    university: "University",
    notesTitle: "Notes",
    importSuccess: "Schedule imported.",
    importError:
      "Could not read that timetable. Use the .xls or .xlsx file exported by the school.",
    language: "Language",
    chinese: "中文",
    english: "English",
  },
}

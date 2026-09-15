export type Locale = "zh" | "en"

export type Messages = {
  appTitle: string
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
  daysShort: [string, string, string, string, string, string, string]
  academicTerm: string
  className: string
  major: string
  department: string
  printedAt: string
  studentName: string
  university: string
  notesTitle: string
  language: string
  chinese: string
  english: string
  subscribeFeed: string
  subscribeCopied: string
  subscribeCopyError: string
}

function formatPeriodTime(startTime: string, endTime: string): string {
  return `${startTime}–${endTime}`
}

export const messages: Record<Locale, Messages> = {
  zh: {
    appTitle: "课程表",
    emptyTitle: "无法读取课表",
    emptyDescription:
      "把教务系统个人课表页保存到服务器的 data 目录（可用 schedule.html，或浏览器“网页，全部”），然后刷新页面。",
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
    daysShort: ["一", "二", "三", "四", "五", "六", "日"],
    academicTerm: "学年学期",
    className: "班级",
    major: "专业",
    department: "院系",
    printedAt: "打印日期",
    studentName: "学生",
    university: "学校",
    notesTitle: "备注",
    language: "语言",
    chinese: "中文",
    english: "English",
    subscribeFeed: "复制订阅链接",
    subscribeCopied: "订阅链接已复制。",
    subscribeCopyError: "无法复制订阅链接。",
  },
  en: {
    appTitle: "Schedule",
    emptyTitle: "Schedule unavailable",
    emptyDescription:
      "Save the school timetable page into the server data directory (schedule.html or a browser “Webpage, Complete” save), then refresh.",
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
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    academicTerm: "Academic term",
    className: "Class",
    major: "Major",
    department: "Department",
    printedAt: "Printed",
    studentName: "Student",
    university: "University",
    notesTitle: "Notes",
    language: "Language",
    chinese: "中文",
    english: "English",
    subscribeFeed: "Copy subscribe link",
    subscribeCopied: "Subscribe link copied.",
    subscribeCopyError: "Could not copy the subscribe link.",
  },
}

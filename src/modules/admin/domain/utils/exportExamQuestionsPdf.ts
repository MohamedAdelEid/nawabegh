import type { ExamStation } from "@/modules/admin/domain/data/journeyEditorData";

type ExportLabels = {
  examTitle: string;
  questionLabel: string;
  correctAnswer: string;
  points: string;
  noQuestions: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function exportExamQuestionsToPdf(exam: ExamStation, labels: ExportLabels) {
  if (typeof window === "undefined") return;

  if (!exam.questions.length) {
    window.alert(labels.noQuestions);
    return;
  }

  const questionsHtml = exam.questions
    .map((question, index) => {
      const optionsHtml = question.options
        .map((option) => {
          const isCorrect = option.id === question.correctOptionId;
          return `<li class="${isCorrect ? "correct" : ""}">${escapeHtml(option.label)}. ${escapeHtml(option.text)}${isCorrect ? ` <strong>(${labels.correctAnswer})</strong>` : ""}</li>`;
        })
        .join("");

      return `
        <section class="question">
          <h3>${labels.questionLabel} ${index + 1} · ${labels.points}: ${question.points}</h3>
          <p class="stem">${escapeHtml(question.text)}</p>
          <ol>${optionsHtml}</ol>
        </section>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(exam.name || labels.examTitle)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1e293b; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .question { page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .question h3 { margin: 0 0 8px; font-size: 14px; color: #475569; }
    .stem { font-size: 16px; font-weight: 700; margin: 0 0 12px; }
    ol { margin: 0; padding-right: 20px; }
    li { margin-bottom: 6px; }
    li.correct { color: #92700c; font-weight: 600; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(exam.name || labels.examTitle)}</h1>
  <p class="meta">${exam.questions.length} ${labels.questionLabel}</p>
  ${questionsHtml}
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

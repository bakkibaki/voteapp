"use client";

import { useState } from "react";
import { CustomQuestion } from "@/lib/types";
import { Check } from "lucide-react";

interface CustomQuestionModalProps {
  questions: CustomQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

export default function CustomQuestionModal({
  questions,
  onComplete,
  onCancel,
}: CustomQuestionModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // すべての質問に回答しているかチェック
    const allAnswered = questions.every((q) => answers[q.id]);
    if (!allAnswered) {
      alert("すべての質問に回答してください");
      return;
    }

    onComplete(answers);
  };

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">投票前のアンケート</h2>
        <p className="text-sm text-gray-400 mb-6">
          投票者の傾向を把握するため、以下の質問にお答えください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                {question.question}
              </label>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(question.id, option)}
                    className={
                      "w-full text-left px-4 py-3 rounded-xl transition-all border-2 flex items-center justify-between " +
                      (answers[question.id] === option
                        ? "bg-cyan-500/20 border-cyan-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600")
                    }
                  >
                    <span className="text-sm font-medium">{option}</span>
                    {answers[question.id] === option && (
                      <Check size={16} className="text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-700 rounded-xl hover:bg-gray-800 text-gray-300 transition font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
            >
              投票する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

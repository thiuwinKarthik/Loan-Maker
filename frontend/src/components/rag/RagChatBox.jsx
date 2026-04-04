import React, { useState } from "react";
import { ragApi } from "../../features/rag/api";

const RagChatBox = ({ compact = false }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await ragApi.query(question.trim());
      setResponse(data);
    } catch (err) {
      setError(err.message || "Unable to process advisor request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "p-5" : "card w-full"}>
      {!compact && (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Personalized Loan Advisor</h2>
          <p className="text-sm text-gray-600 mt-2 mb-6">
            Ask questions about rejection reasons, risk exposure, lender fit, and portfolio patterns.
          </p>
        </>
      )}

      {compact && (
        <p className="text-xs text-gray-500 mb-4 bg-gray-100 p-2 rounded border border-gray-200">
          Ask about your loan history, how to improve your chances, or why you were rejected.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input-base min-h-[100px] resize-none text-sm bg-gray-50 focus:bg-white"
          placeholder="Example: Why was my last loan rejected?"
          required
          minLength={5}
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : "Ask Advisor"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      {response && (
        <div className="mt-6 space-y-4 animate-fade-in text-sm">
          <section className="rounded-xl border border-primary-100 bg-primary-50 p-4 shadow-sm">
            <h3 className="font-semibold text-primary-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
              Advisor Summary
            </h3>
            <p className="text-gray-800 mt-2 leading-relaxed">{response.summary}</p>
          </section>

          {(response.riskFactors?.length > 0) && (
            <section className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 shadow-sm">
              <h3 className="font-semibold text-amber-900">Risk Factors</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-800">
                {response.riskFactors.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {(response.recommendations?.length > 0) && (
            <section className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/50 p-4 shadow-sm">
              <h3 className="font-semibold text-emerald-900">Recommendations</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-emerald-800">
                {response.recommendations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2 border-b border-gray-100 pb-2">
              <span>Confidence: <strong>{(response.confidenceScore * 100).toFixed(0)}%</strong></span>
              <span>Model: <strong>{response.modelName}</strong></span>
            </div>
            
            {!compact && (
              <div className="mt-3">
                <h4 className="font-medium text-gray-700 text-xs uppercase tracking-wider mb-2">Sources Referenced</h4>
                <ul className="space-y-1.5">
                  {(response.sources || []).map((source, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex justify-between bg-gray-50 px-2 py-1.5 rounded">
                      <span className="truncate pr-2" title={source.documentId}>{source.documentType}</span>
                      <span className="text-gray-400">score: {source.similarityScore?.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-[10px] text-gray-400 mt-3 text-center italic">{response.disclaimer}</p>
          </section>
        </div>
      )}
    </div>
  );
};

export default RagChatBox;

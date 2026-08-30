
export interface ConsultantInsights {
  strategic_overview: string;
  the_edge: string;
  the_blindspot: string;
  the_power_move: string;
}

export interface ConsultantCornerProps {
  insights?: ConsultantInsights | null;
  confidence?: number;
}

export default function ConsultantCorner({
  insights = null,
  confidence = 0,
}: ConsultantCornerProps) {
  if (!insights) {
    return (
      <div className="my-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center italic text-slate-400">
        AI Consultant analysis will appear here after site validation...
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-bold text-indigo-900">Consultant&apos;s Strategic Analysis</h3>
        </div>
        <div className="rounded-full bg-indigo-200 px-2 py-1 text-xs font-medium text-indigo-700">
          Confidence: {Math.round(confidence * 100)}%
        </div>
      </div>

      <p className="mb-6 font-medium italic leading-relaxed text-indigo-800">
        &ldquo;{insights.strategic_overview}&rdquo;
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-green-600">
            <span>🚀</span> The Edge
          </div>
          <p className="text-sm leading-snug text-slate-600">{insights.the_edge}</p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-600">
            <span>⚠️</span> The Blindspot
          </div>
          <p className="text-sm leading-snug text-slate-600">{insights.the_blindspot}</p>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-600">
            <span>💡</span> Power Move
          </div>
          <p className="text-sm leading-snug text-slate-600">{insights.the_power_move}</p>
        </div>
      </div>
    </div>
  );
}

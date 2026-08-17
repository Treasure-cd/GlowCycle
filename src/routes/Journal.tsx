import TodayJournalEntry from "../components/layout/TodayJournalEntry";
import JournalHistory from "../components/layout/JournalHistory";

export default function Journal() {
  return (
    // Expanded max-width for desktop
    <div className="mx-auto max-w-md px-6 py-10 md:max-w-5xl md:py-16">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Journal</h2>
        <p className="mt-2 text-sm text-foreground/60 md:text-base">
          A place to note anything worth remembering.
        </p>
      </div>

      {/* Grid: 1 column mobile, 2 columns desktop */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-12">
        <div className="flex w-full flex-col">
          <TodayJournalEntry />
        </div>
        <div className="flex w-full flex-col">
          <JournalHistory />
        </div>
      </div>
      
    </div>
  );
}
import { MonthlyTracker } from "@/components/MonthlyTracker";

export default function Home() {
  const currentMonth = new Date().getMonth() + 1;
  
  return (
    <main className="min-h-screen">
      <MonthlyTracker monthId={currentMonth} />
    </main>
  );
}

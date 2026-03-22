import { Suspense } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import Home from "./components/home";
import PublicReportViewer from "./components/public/PublicReportViewer";

function AppContent() {
  const [searchParams] = useSearchParams();
  const reportCaseId = searchParams.get("report");

  // If ?report=CASE_ID is present, show public report viewer (no login needed)
  if (reportCaseId) {
    return <PublicReportViewer caseId={reportCaseId} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AppContent />
    </Suspense>
  );
}

export default App;

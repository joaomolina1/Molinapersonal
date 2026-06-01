"use client";

import QuoteRequestForm from "@/(main)/_components/QuoteRequest/QuoteRequestForm";
import { Suspense } from "react";

const QuoteRequestPage = () => {
  return (
    <div className="quote-request-page">
      <Suspense fallback={null}>
        <QuoteRequestForm type="quote-request" />
      </Suspense>
    </div>
  );
};

export default QuoteRequestPage;

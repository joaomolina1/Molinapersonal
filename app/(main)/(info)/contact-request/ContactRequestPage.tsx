"use client";

import QuoteRequestForm from "@/(main)/_components/QuoteRequest/QuoteRequestForm";
import { Suspense } from "react";

const ContactRequestPage = () => {
  return (
    <div className="contact-request-page">
      <Suspense fallback={null}>
        <QuoteRequestForm type="contact-request" />
      </Suspense>
    </div>
  );
};

export default ContactRequestPage;

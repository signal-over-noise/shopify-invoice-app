import React, { Suspense } from "react";
import InvoicePage from "./InvoicePage";

const InvoiceFormPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoicePage />
    </Suspense>
  );
};

export default InvoiceFormPage;

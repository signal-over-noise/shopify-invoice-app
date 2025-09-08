"use client";

import { useEffect, useState, useRef } from "react";
import { InvoiceData } from "@/types/invoice";

interface CanvasPDFPreviewProps {
  invoiceData: InvoiceData;
  productImages: Record<number, string>;
}

export default function CanvasPDFPreview({
  invoiceData,
  productImages,
}: CanvasPDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);

  const renderPDFToCanvas = async () => {
    if (!canvasRef.current) return;

    try {
      setLoading(true);

      const { pdf: pdfRenderer } = await import("@react-pdf/renderer");
      const { InvoicePDFTemplate } = await import(
        "@/components/InvoicePDFTemplate"
      );
      const React = await import("react");

      // Convert images to base64
      const lineItemsWithImages = await Promise.all(
        invoiceData.line_items.map(async (item) => {
          if (item.product_id && productImages[item.product_id]) {
            try {
              const response = await fetch(productImages[item.product_id]);
              const blob = await response.blob();
              const base64Image = await new Promise<string>(
                (resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                }
              );
              return { ...item, image_url: base64Image };
            } catch (err) {
              return item;
            }
          }
          return item;
        })
      );

      const invoiceDataWithImages = {
        ...invoiceData,
        line_items: lineItemsWithImages,
      };

      const pdfDocument: any = React.createElement(InvoicePDFTemplate, {
        invoiceData: invoiceDataWithImages,
      });

      const blob = await pdfRenderer(pdfDocument).toBlob();

      // Convert blob to array buffer for PDF.js
      const arrayBuffer = await blob.arrayBuffer();

      // Dynamically import PDF.js
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;
      const page = await loadedPdf.getPage(1);

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      // Calculate scale to fit the canvas
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const containerHeight = canvas.parentElement?.clientHeight || 1000;

      const viewport = page.getViewport({ scale: 1 });
      const scaleX = (containerWidth - 40) / viewport.width; // 40px padding
      const scaleY = (containerHeight - 40) / viewport.height;
      const scale = Math.min(scaleX, scaleY, 1.5); // Max scale of 1.5

      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      // Clear canvas with white background
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext: any = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("PDF canvas rendering error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderPDFToCanvas();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [invoiceData, productImages]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-900 mx-auto"></div>
          <p className="mt-2 text-slate-600 text-xs">Updating preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex items-center justify-center p-5">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full shadow-lg"
        style={{ background: "white" }}
      />
    </div>
  );
}

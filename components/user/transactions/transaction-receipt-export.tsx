'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/types';
import { Image as ImageIcon, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';

interface TransactionReceiptExportProps {
  transaction: Transaction;
  accountNumber?: string;
  userName?: string;
}

export function TransactionReceiptExport({
  transaction,
  accountNumber,
  userName,
}: TransactionReceiptExportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadImage = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'Arial, sans-serif';

      // Build receipt HTML
      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; color: #1f2937;">Transaction Receipt</h1>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${new Date().toLocaleDateString()}</p>
        </div>

        <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Account Holder</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${userName || 'Account'}</p>
            </div>
            <div>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Account Number</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${accountNumber || transaction.accountId}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Transaction Type</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937; text-transform: capitalize;">${transaction.type}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Reference</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937; font-family: monospace;">${transaction.reference}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Amount</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${transaction.type === 'deposit' ? '#10b981' : '#ef4444'};">
                ${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Status</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937; text-transform: capitalize;">${transaction.status}</p>
            </div>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Description</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${transaction.description}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Date & Time</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${new Date(transaction.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <div style="border-top: 1px dashed #d1d5db; padding-top: 15px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated receipt. No signature required.</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Keep this receipt for your records.</p>
        </div>
      `;

      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      // Download as PNG
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `receipt-${transaction.reference}-${Date.now()}.png`;
      link.click();

      // Cleanup
      document.body.removeChild(container);
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate receipt image');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create a temporary container for PDF
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'Arial, sans-serif';

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; color: #1f2937;">Transaction Receipt</h1>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Account Holder</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${userName || 'Account'}</p>
            </div>
            <div>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Account Number</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${accountNumber || transaction.accountId}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Transaction Type</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937; text-transform: capitalize;">${transaction.type}</p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Reference</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937; font-family: monospace;">${transaction.reference}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Amount</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${transaction.type === 'deposit' ? '#10b981' : '#ef4444'};">
                ${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Status</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937; text-transform: capitalize;">${transaction.status}</p>
            </div>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Description</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${transaction.description}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Date & Time</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${new Date(transaction.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <div style="border-top: 1px dashed #d1d5db; padding-top: 15px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated receipt. No signature required.</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Keep this receipt for your records.</p>
        </div>
      `;

      document.body.appendChild(container);

      // Convert to canvas first for better quality
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(container);

      // Use a library to convert canvas to PDF
      // For now, we'll provide a simple solution using canvas to data URL
      // In production, you'd want to use jsPDF or similar
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${transaction.reference}-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Try downloading as image instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={downloadImage}
          className="gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          {loading ? 'Generating...' : 'Download Image'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={downloadPDF}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {loading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
    </div>
  );
}

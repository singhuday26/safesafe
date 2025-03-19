import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface FullRiskReportProps {
  onClose: () => void;
}

const FullRiskReport: React.FC<FullRiskReportProps> = ({ onClose }) => {
  // Hardcoded data for demonstration
  const transactionDetails = [
    { field: "Amount", value: "₹5000" },
    { field: "Date", value: "18 March 2025" },
    { field: "Type", value: "Online Payment" },
    { field: "Location", value: "Kolkata, India" },
    { field: "IP Address", value: "192.168.1.10" },
  ];

  const userInformation = [
    { field: "Name", value: "Shubham Roy" },
    { field: "Email", value: "shubham@example.com" },
    { field: "Account Age", value: "2 Years" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Full Risk Report</h2>

        {/* Risk Overview */}
        <div className="mb-6">
          <p>
            <span className="font-semibold">Risk Score:</span> 39 / 100
          </p>
          <p>
            <span className="font-semibold">Risk Level:</span> Medium Risk
          </p>
        </div>

        {/* Transaction Details */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Transaction Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-2">Field</TableHead>
                <TableHead className="p-2">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionDetails.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="p-2">{row.field}</TableCell>
                  <TableCell className="p-2">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* User Information */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">User Information</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-2">Field</TableHead>
                <TableHead className="p-2">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userInformation.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="p-2">{row.field}</TableCell>
                  <TableCell className="p-2">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Historical Patterns */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Historical Patterns</h3>
          <p>No significant anomalies detected in past 10 transactions.</p>
        </div>

        {/* Close Button */}
        <div className="text-right">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Close Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullRiskReport;

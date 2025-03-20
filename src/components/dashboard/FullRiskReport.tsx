
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getRiskLevel, getRiskColor } from "@/utils/fraudDetectionUtils";
import { AlertCircle, AlertTriangle, MapPin, Clock, Smartphone, CreditCard, ChevronDown, ChevronUp, X } from "lucide-react";
import RiskDetails from "./RiskDetails";

interface FullRiskReportProps {
  onClose: () => void;
  transactionId?: string;
}

const FullRiskReport: React.FC<FullRiskReportProps> = ({ onClose, transactionId }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>("riskFactors");

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

  // Example risk factors for demo
  const riskFactors = [
    { 
      name: "Unusual Location", 
      description: "Transaction from a location not typically associated with this user",
      impact: 25,
      category: "location",
      icon: <MapPin className="h-4 w-4 text-red-500" />
    },
    { 
      name: "Transaction Amount", 
      description: "Amount is significantly higher than user's typical transactions",
      impact: 15,
      category: "amount",
      icon: <CreditCard className="h-4 w-4 text-orange-500" />
    },
    { 
      name: "Time of Day", 
      description: "Transaction occurred during unusual hours (2:15 AM local time)",
      impact: 10,
      category: "behavior",
      icon: <Clock className="h-4 w-4 text-yellow-500" />
    },
    { 
      name: "New Device", 
      description: "Transaction initiated from a device not previously associated with this user",
      impact: 20,
      category: "device",
      icon: <Smartphone className="h-4 w-4 text-red-500" />
    }
  ];

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Mock transaction for demo
  const mockTransaction = {
    id: transactionId || "tx_mock123456",
    user_id: "user123",
    amount: 5000,
    currency: "INR",
    payment_method: "credit_card",
    status: "flagged",
    risk_score: 75,
    timestamp: "2025-03-18T02:15:00Z",
    card_last4: "4242",
    merchant: "Global Shopping Ltd.",
    type: "payment",
    country: "IN",
    city: "Kolkata",
    ip_address: "192.168.1.10",
    created_at: "2025-03-18T02:15:00Z",
  };

  // Mock fraud alert for demo
  const mockFraudAlert = {
    id: "alert123",
    transaction_id: transactionId || "tx_mock123456",
    detection_method: "automated_risk_scoring",
    severity: "high",
    status: "new",
    details: {
      risk_score: 75,
      risk_factors: riskFactors.map(factor => ({
        type: factor.name.toLowerCase().replace(' ', '_'),
        score: factor.impact,
        details: {
          description: factor.description
        }
      })),
      detection_timestamp: "2025-03-18T02:15:30Z"
    },
    created_at: "2025-03-18T02:15:30Z"
  };

  const riskScore = 75;
  const riskLevel = getRiskLevel(riskScore);
  const riskColor = getRiskColor(riskScore);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 pb-2 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Full Risk Report</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Risk Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Risk Assessment</h3>
                    <p className="text-sm text-gray-500">Transaction #{mockTransaction.id.substring(0, 8)}</p>
                  </div>
                  <Badge className={`${riskColor.replace('text-', 'bg-opacity-20 ')} ${riskColor}`}>
                    {riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Risk Score</span>
                    <span className={riskColor}>{riskScore}/100</span>
                  </div>
                  <Progress 
                    value={riskScore} 
                    max={100} 
                    className={`h-2 ${riskColor.replace('text-', 'bg-')}`} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Detection Method</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Automated Risk Scoring
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Detection Time</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(mockFraudAlert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Alert Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <AlertCircle className={`h-5 w-5 ${riskColor} mr-2`} />
                    <div>
                      <p className="text-sm font-medium">Severity Level</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{mockFraudAlert.severity.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Current Status</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{mockFraudAlert.status.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Recommended Action</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Manual Verification Required</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-4">
            {/* Risk Factors Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                onClick={() => toggleSection("riskFactors")}
              >
                <span className="font-semibold">Risk Factors</span>
                {expandedSection === "riskFactors" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSection === "riskFactors" && (
                <div className="p-4">
                  <div className="space-y-4">
                    {riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-0.5">{factor.icon}</div>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <h4 className="font-medium">{factor.name}</h4>
                            <Badge variant="outline" className="ml-2">+{factor.impact} points</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{factor.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Details Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                onClick={() => toggleSection("transactionDetails")}
              >
                <span className="font-semibold">Transaction Details</span>
                {expandedSection === "transactionDetails" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSection === "transactionDetails" && (
                <div className="p-4">
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
              )}
            </div>

            {/* User Information Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                onClick={() => toggleSection("userInformation")}
              >
                <span className="font-semibold">User Information</span>
                {expandedSection === "userInformation" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSection === "userInformation" && (
                <div className="p-4">
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
              )}
            </div>

            {/* Historical Patterns Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                onClick={() => toggleSection("historicalPatterns")}
              >
                <span className="font-semibold">Historical Patterns</span>
                {expandedSection === "historicalPatterns" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSection === "historicalPatterns" && (
                <div className="p-4">
                  <p>No significant anomalies detected in past 10 transactions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close Report
            </Button>
            <Button
              variant="default"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Mark as Investigated
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullRiskReport;

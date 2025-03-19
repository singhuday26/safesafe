// src/components/dashboard/TransactionsPage.tsx
import React from "react";
import TransactionsList from "./TransactionList";
import { Transaction } from "@/types/database"; // assuming your types are set up with @ alias

const sampleTransactions: Transaction[] = [
  {
    id: "txn_001",
    merchant: "Amazon",
    transaction_number: "1001",
    amount: 299.99,
    currency: "USD",
    payment_method: "credit_card",
    status: "approved",
    risk_score: 15,
    timestamp: "2023-09-15T10:23:45Z",
    customer: { name: "Alice Smith", email: "alice@example.com" },
    type: "payment",
  },
  {
    id: "txn_002",
    merchant: "eBay",
    transaction_number: "1002",
    amount: 89.99,
    currency: "USD",
    payment_method: "paypal",
    status: "declined",
    risk_score: 65,
    timestamp: "2023-09-15T10:25:30Z",
    customer: { name: "Bob Johnson", email: "bob@example.com" },
    type: "payment",
  },
  {
    id: "txn_003",
    merchant: "Walmart",
    transaction_number: "1003",
    amount: 129.99,
    currency: "USD",
    payment_method: "bank_transfer",
    status: "approved",
    risk_score: 25,
    timestamp: "2023-09-15T10:27:00Z",
    customer: { name: "Charlie Brown", email: "charlie@example.com" },
    type: "payment",
  },
  {
    id: "txn_004",
    merchant: "Target",
    transaction_number: "1004",
    amount: 49.99,
    currency: "USD",
    payment_method: "credit_card",
    status: "flagged",
    risk_score: 80,
    timestamp: "2023-09-15T10:28:00Z",
    customer: { name: "Diana Prince", email: "diana@example.com" },
    type: "payment",
  },
  {
    id: "txn_005",
    merchant: "Best Buy",
    transaction_number: "1005",
    amount: 599.99,
    currency: "USD",
    payment_method: "credit_card",
    status: "approved",
    risk_score: 20,
    timestamp: "2023-09-15T10:30:30Z",
    customer: { name: "Edward Norton", email: "edward@example.com" },
    type: "payment",
  },
  {
    id: "txn_006",
    merchant: "Costco",
    transaction_number: "1006",
    amount: 75.0,
    currency: "USD",
    payment_method: "debit_card",
    status: "declined",
    risk_score: 55,
    timestamp: "2023-09-15T10:34:00Z",
    customer: { name: "Fiona Apple", email: "fiona@example.com" },
    type: "payment",
  },
  {
    id: "txn_007",
    merchant: "Apple Store",
    transaction_number: "1007",
    amount: 1299.0,
    currency: "USD",
    payment_method: "credit_card",
    status: "approved",
    risk_score: 10,
    timestamp: "2023-09-15T10:37:00Z",
    customer: { name: "George Clooney", email: "george@example.com" },
    type: "payment",
  },
];

const TransactionsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sample Transactions</h1>
      <TransactionsList transactions={sampleTransactions} />
    </div>
  );
};

export default TransactionsPage;

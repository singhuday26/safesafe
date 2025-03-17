
// Risk level categories
export type RiskLevel = "low" | "medium" | "high" | "critical";

// Get risk level based on score
export const getRiskLevel = (score: number): RiskLevel => {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "critical";
};

// Get risk color based on score
export const getRiskColor = (score: number): string => {
  const level = getRiskLevel(score);
  switch (level) {
    case "low":
      return "bg-green-500 text-green-500";
    case "medium":
      return "bg-yellow-500 text-yellow-500";
    case "high":
      return "bg-orange-500 text-orange-500";
    case "critical":
      return "bg-red-500 text-red-500";
    default:
      return "bg-gray-500 text-gray-500";
  }
};

// Transaction types
export type TransactionType = "payment" | "transfer" | "withdrawal" | "deposit";

// Transaction status
export type TransactionStatus = "completed" | "pending" | "failed" | "flagged";

// Transaction interface
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  merchant?: string;
  timestamp: Date;
  riskScore: number;
  deviceInfo?: DeviceInfo; // For advanced device fingerprinting
  locationData?: LocationData; // For location-based verification
  behavioralMarkers?: BehavioralMarker[]; // For behavioral analysis
  anomalyDetails?: AnomalyDetail[]; // For explainable AI
  fraudProbability?: number; // Advanced ML probability score
}

// Advanced Threat Detection - Device Information
export interface DeviceInfo {
  deviceId: string;
  deviceType: "mobile" | "desktop" | "tablet" | "other";
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  isTrustedDevice: boolean;
  lastAuthenticated?: Date;
  riskFactors?: string[];
}

// Advanced Threat Detection - Location Data
export interface LocationData {
  country: string;
  city: string;
  coordinates: [number, number]; // [latitude, longitude]
  isKnownLocation: boolean;
  distanceFromLastLogin?: number; // in kilometers
  timezone: string;
  isVPNDetected: boolean;
}

// Behavioral Analysis Markers
export interface BehavioralMarker {
  id: string;
  type: "typing_pattern" | "navigation" | "interaction" | "transaction_pattern";
  confidence: number; // 0-100
  description: string;
  timestamp: Date;
  isAnomaly: boolean;
}

// Explainable AI - Anomaly Details
export interface AnomalyDetail {
  factor: string;
  importance: number; // 0-100, how important this factor was
  normalRange: string;
  actualValue: string;
  description: string;
}

// Multi-Factor Authentication types
export type MFAMethod = "sms" | "email" | "authenticator_app" | "hardware_token" | "biometric";

export interface MFAConfig {
  userId: string;
  enabledMethods: MFAMethod[];
  defaultMethod: MFAMethod;
  isRequired: boolean;
  riskBasedMFA: boolean; // Triggers MFA only for high-risk activities
  lastVerified?: Date;
}

// Zero Trust - Session Security
export interface SessionSecurity {
  sessionId: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  startTime: Date;
  lastActiveTime: Date;
  isActive: boolean;
  securityChecks: {
    deviceVerified: boolean;
    locationVerified: boolean;
    behaviorVerified: boolean;
  };
  riskScore: number;
}

// Generate a random risk score
export const generateRiskScore = (): number => {
  return Math.floor(Math.random() * 100);
};

// Advanced encryption helper (simulation)
export const encryptSensitiveData = (data: string, encryptionKey?: string): string => {
  // This is a placeholder for actual encryption implementation
  // In a real application, you would use a library like crypto-js
  return `encrypted-${data}-with-aes256`;
};

export const decryptSensitiveData = (encryptedData: string, encryptionKey?: string): string => {
  // This is a placeholder for actual decryption
  if (encryptedData.startsWith('encrypted-') && encryptedData.endsWith('-with-aes256')) {
    return encryptedData.replace('encrypted-', '').replace('-with-aes256', '');
  }
  return encryptedData;
};

// Simulate MFA verification process
export const verifyMultiFactor = async (
  userId: string, 
  method: MFAMethod, 
  verificationCode: string
): Promise<boolean> => {
  // Simulate verification process with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demonstration, accept any 6-digit code
  const isValidFormat = /^\d{6}$/.test(verificationCode);
  return isValidFormat;
};

// Request MFA verification (simulation)
export const requestMFAVerification = async (
  userId: string,
  method: MFAMethod
): Promise<{ success: boolean; verificationId?: string }> => {
  // Simulate sending a verification code
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    verificationId: `verification-${Math.random().toString(36).substring(2, 10)}`
  };
};

// Self-learning detection - calculate risk based on transaction data
export const calculateAdvancedRiskScore = (transaction: Transaction): number => {
  let baseScore = generateRiskScore();
  
  // Add additional risk factors (simulated)
  if (transaction.deviceInfo && !transaction.deviceInfo.isTrustedDevice) {
    baseScore += 15;
  }
  
  if (transaction.locationData && !transaction.locationData.isKnownLocation) {
    baseScore += 10;
  }
  
  if (transaction.locationData?.isVPNDetected) {
    baseScore += 20;
  }
  
  // Check for behavioral anomalies
  const behavioralAnomalies = transaction.behavioralMarkers?.filter(m => m.isAnomaly) || [];
  baseScore += behavioralAnomalies.length * 5;
  
  // Cap the score at 100
  return Math.min(baseScore, 100);
};

// Generate random transactions for demo with advanced security features
export const generateRandomTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: TransactionType[] = ["payment", "transfer", "withdrawal", "deposit"];
  const statuses: TransactionStatus[] = ["completed", "pending", "failed", "flagged"];
  const merchants = [
    "Amazon", "Walmart", "Target", "Best Buy", "Apple", "Google", 
    "Netflix", "Spotify", "Uber", "Lyft", "DoorDash", "Grubhub"
  ];
  
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD"];
  const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];
  const operatingSystems = ["Windows", "macOS", "iOS", "Android", "Linux"];
  const countries = ["US", "UK", "CA", "FR", "DE", "JP", "AU", "BR", "IN"];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const amount = Math.floor(Math.random() * 1000) + 1;
    const riskScore = generateRiskScore();
    
    // Generate advanced security data
    const isTrustedDevice = Math.random() > 0.2;
    const isKnownLocation = Math.random() > 0.3;
    const isVPNDetected = Math.random() < 0.15;
    
    // Generate behavioral markers
    const behavioralMarkers: BehavioralMarker[] = [];
    const markerTypes: Array<BehavioralMarker["type"]> = ["typing_pattern", "navigation", "interaction", "transaction_pattern"];
    const markerCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < markerCount; j++) {
      const isAnomaly = Math.random() < 0.3;
      behavioralMarkers.push({
        id: `marker-${i}-${j}`,
        type: markerTypes[Math.floor(Math.random() * markerTypes.length)],
        confidence: Math.floor(Math.random() * 100),
        description: isAnomaly ? 
          "Unusual interaction pattern detected" : 
          "Normal interaction pattern",
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 60) * 60 * 1000),
        isAnomaly
      });
    }
    
    // Generate anomaly details for explainable AI
    const anomalyDetails: AnomalyDetail[] = [];
    if (riskScore > 70) {
      const anomalyFactors = [
        "Transaction amount", 
        "Location", 
        "Time pattern", 
        "Merchant category", 
        "Device trust"
      ];
      
      const anomalyCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < anomalyCount; j++) {
        anomalyDetails.push({
          factor: anomalyFactors[Math.floor(Math.random() * anomalyFactors.length)],
          importance: Math.floor(Math.random() * 50) + 50, // Higher importance for flagged transactions
          normalRange: "Within typical user patterns",
          actualValue: "Outside typical user patterns",
          description: "This transaction shows unusual patterns compared to your history"
        });
      }
    }
    
    const transaction: Transaction = {
      id: `TRX-${Math.floor(Math.random() * 1000000)}`,
      amount,
      currency,
      type,
      status,
      description: `${type} to ${merchant}`,
      merchant,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      riskScore,
      deviceInfo: {
        deviceId: `device-${Math.floor(Math.random() * 100000)}`,
        deviceType: Math.random() > 0.5 ? "mobile" : "desktop",
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        operatingSystem: operatingSystems[Math.floor(Math.random() * operatingSystems.length)],
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        isTrustedDevice,
        riskFactors: !isTrustedDevice ? ["New device", "Unusual browser configuration"] : []
      },
      locationData: {
        country: countries[Math.floor(Math.random() * countries.length)],
        city: ["New York", "London", "Paris", "Tokyo", "Sydney"][Math.floor(Math.random() * 5)],
        coordinates: [
          Math.random() * 180 - 90, // latitude
          Math.random() * 360 - 180 // longitude
        ],
        isKnownLocation,
        distanceFromLastLogin: !isKnownLocation ? Math.floor(Math.random() * 5000) + 500 : 0,
        timezone: ["UTC-8", "UTC-5", "UTC+0", "UTC+1", "UTC+9"][Math.floor(Math.random() * 5)],
        isVPNDetected
      },
      behavioralMarkers,
      anomalyDetails: riskScore > 70 ? anomalyDetails : [],
      fraudProbability: riskScore / 100
    };
    
    transactions.push(transaction);
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate risk insights
export interface RiskInsight {
  id: string;
  title: string;
  description: string;
  urgency: RiskLevel;
  timestamp: Date;
  recommendedActions?: string[];
  securityImpact?: "low" | "medium" | "high";
  relatedTransactions?: string[];
  aiExplanation?: string;
}

export const generateRiskInsights = (): RiskInsight[] => {
  return [
    {
      id: "insight-1",
      title: "Unusual login location detected",
      description: "A login was detected from a new location that is significantly different from your usual patterns.",
      urgency: "high" as RiskLevel,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      recommendedActions: [
        "Verify if you recently logged in from a new location",
        "Change your password if this wasn't you",
        "Enable location-based verification"
      ],
      securityImpact: "medium",
      aiExplanation: "Our AI detected a login from 1,500 km away from your usual location, which is outside your normal pattern of 10 km."
    },
    {
      id: "insight-2",
      title: "Multiple failed login attempts",
      description: "There were 5 failed login attempts on your account in the last hour.",
      urgency: "medium" as RiskLevel,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      recommendedActions: [
        "Check your email for unauthorized password reset attempts",
        "Enable multi-factor authentication",
        "Review recent account activity"
      ],
      securityImpact: "medium",
      aiExplanation: "Typical brute force attack pattern detected. The attempts stopped after the account was temporarily locked."
    },
    {
      id: "insight-3",
      title: "Large transaction flagged",
      description: "A transaction of $2,500 was flagged as potentially fraudulent based on your spending patterns.",
      urgency: "critical" as RiskLevel,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      recommendedActions: [
        "Verify if you made this transaction",
        "Contact your bank immediately if unauthorized",
        "Freeze your card temporarily"
      ],
      securityImpact: "high",
      relatedTransactions: ["TRX-385291"],
      aiExplanation: "This transaction is 500% larger than your average transaction, occurred at an unusual time, and was made to a merchant you've never used before."
    },
    {
      id: "insight-4",
      title: "New device used for transaction",
      description: "A new device was used to make a payment that doesn't match your regular devices.",
      urgency: "medium" as RiskLevel,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      recommendedActions: [
        "Verify if you recently used a new device",
        "Review recent transactions",
        "Add this device to trusted devices if it was you"
      ],
      securityImpact: "medium",
      aiExplanation: "Device fingerprinting detected an unusual browser configuration and operating system version not previously associated with your account."
    },
    {
      id: "insight-5",
      title: "Potential card skimming detected",
      description: "Your card was used at a location associated with recent skimming reports.",
      urgency: "high" as RiskLevel,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      recommendedActions: [
        "Monitor your transactions closely",
        "Consider requesting a new card",
        "Enable transaction notifications"
      ],
      securityImpact: "high",
      aiExplanation: "Our fraud intelligence network has received multiple reports of card skimming at this merchant location in the past 72 hours."
    }
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Format currency
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Dashboard stats
export interface DashboardStat {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: string;
}

export const generateDashboardStats = (): DashboardStat[] => {
  return [
    {
      id: "stat-1",
      title: "Fraud Attempts",
      value: "24",
      change: 12.5,
      trend: "up",
      icon: "shield"
    },
    {
      id: "stat-2",
      title: "Risk Score",
      value: "67/100",
      change: -3.8,
      trend: "down",
      icon: "activity"
    },
    {
      id: "stat-3",
      title: "Alerts",
      value: "9",
      change: 0,
      trend: "neutral",
      icon: "bell"
    },
    {
      id: "stat-4",
      title: "Secure Transactions",
      value: "342",
      change: 8.2,
      trend: "up",
      icon: "check-circle"
    }
  ];
};

// Time periods for filters
export type TimePeriod = "24h" | "7d" | "30d" | "90d" | "1y" | "all";

// Explainable AI - Generate explanations for flagged transactions
export const generateAIExplanation = (transaction: Transaction): string => {
  if (!transaction.anomalyDetails || transaction.anomalyDetails.length === 0) {
    return "This transaction appears to be normal based on your history.";
  }
  
  // Sort anomalies by importance
  const sortedAnomalies = [...transaction.anomalyDetails].sort((a, b) => b.importance - a.importance);
  const topAnomalies = sortedAnomalies.slice(0, 2); // Get top 2 anomalies
  
  let explanation = "This transaction was flagged because: ";
  
  topAnomalies.forEach((anomaly, index) => {
    if (index > 0) explanation += " Additionally, ";
    explanation += `the ${anomaly.factor.toLowerCase()} (${anomaly.actualValue}) is unusual compared to your normal patterns (${anomaly.normalRange}).`;
  });
  
  if (transaction.deviceInfo && !transaction.deviceInfo.isTrustedDevice) {
    explanation += " The transaction was also made from an unrecognized device.";
  }
  
  if (transaction.locationData && !transaction.locationData.isKnownLocation) {
    explanation += ` It was initiated from ${transaction.locationData.city}, ${transaction.locationData.country} which is not one of your usual locations.`;
  }
  
  return explanation;
};

// Zero Trust - Verify transaction security context
export const verifySecurityContext = (transaction: Transaction): {
  verified: boolean;
  riskFactors: string[];
  recommendedActions: string[];
} => {
  const riskFactors: string[] = [];
  const recommendedActions: string[] = [];
  
  // Check device trust
  if (transaction.deviceInfo && !transaction.deviceInfo.isTrustedDevice) {
    riskFactors.push("Untrusted device detected");
    recommendedActions.push("Verify this device and add to trusted devices if legitimate");
  }
  
  // Check location
  if (transaction.locationData) {
    if (!transaction.locationData.isKnownLocation) {
      riskFactors.push("Unusual geographic location");
      recommendedActions.push("Confirm if you recently traveled to this location");
    }
    
    if (transaction.locationData.isVPNDetected) {
      riskFactors.push("VPN or proxy detected");
      recommendedActions.push("Disable VPN for financial transactions if possible");
    }
  }
  
  // Check behavioral patterns
  if (transaction.behavioralMarkers) {
    const anomalies = transaction.behavioralMarkers.filter(m => m.isAnomaly);
    if (anomalies.length > 0) {
      riskFactors.push("Unusual behavior patterns detected");
      recommendedActions.push("Review recent account activity for any unauthorized access");
    }
  }
  
  // Determine verification status
  const verified = riskFactors.length === 0 || (
    riskFactors.length === 1 && !riskFactors.includes("VPN or proxy detected")
  );
  
  return {
    verified,
    riskFactors,
    recommendedActions
  };
};

// Self-Learning Fraud Detection - Track and adapt to user feedback
export interface FeedbackData {
  transactionId: string;
  originalRiskScore: number;
  userFeedback: "false_positive" | "false_negative" | "correct";
  timestamp: Date;
  userNotes?: string;
}

// Simulated feedback database (in a real app this would be stored in a database)
const feedbackHistory: FeedbackData[] = [];

export const submitTransactionFeedback = (feedback: FeedbackData): void => {
  feedbackHistory.push(feedback);
  
  // In a real application, this would trigger a model retraining process
  console.log(`Feedback received for transaction ${feedback.transactionId}: ${feedback.userFeedback}`);
};

export const getModelAccuracyMetrics = (): {
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  feedbackCount: number;
} => {
  if (feedbackHistory.length === 0) {
    return {
      accuracy: 0.95, // Default starting value
      falsePositiveRate: 0.03,
      falseNegativeRate: 0.02,
      feedbackCount: 0
    };
  }
  
  const falsePositives = feedbackHistory.filter(f => f.userFeedback === "false_positive").length;
  const falseNegatives = feedbackHistory.filter(f => f.userFeedback === "false_negative").length;
  const correct = feedbackHistory.filter(f => f.userFeedback === "correct").length;
  
  return {
    accuracy: correct / feedbackHistory.length,
    falsePositiveRate: falsePositives / feedbackHistory.length,
    falseNegativeRate: falseNegatives / feedbackHistory.length,
    feedbackCount: feedbackHistory.length
  };
};

// Security challenge generation for suspicious transactions
type ChallengeType = "knowledge_question" | "recent_transaction" | "personal_info";

interface SecurityChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  possibleAnswers?: string[];
  correctAnswer: string;
  difficulty: "easy" | "medium" | "hard";
}

export const generateSecurityChallenge = (
  userId: string, 
  riskLevel: RiskLevel
): SecurityChallenge => {
  // In a real app, these would be personalized based on user data
  const challenges: SecurityChallenge[] = [
    {
      id: "challenge-1",
      type: "knowledge_question",
      question: "What was the name of your first pet?",
      difficulty: "easy",
      correctAnswer: "[User's answer would be validated against stored data]"
    },
    {
      id: "challenge-2",
      type: "recent_transaction",
      question: "Which of these merchants did you recently make a purchase from?",
      possibleAnswers: ["Amazon", "Best Buy", "Target", "Walmart"],
      difficulty: "medium",
      correctAnswer: "Amazon" // This would be dynamic in a real app
    },
    {
      id: "challenge-3",
      type: "personal_info",
      question: "What is the street name of your childhood home?",
      difficulty: "hard",
      correctAnswer: "[User's answer would be validated against stored data]"
    }
  ];
  
  // Select challenge based on risk level
  let difficultyFilter: "easy" | "medium" | "hard";
  
  switch(riskLevel) {
    case "low":
      difficultyFilter = "easy";
      break;
    case "medium":
      difficultyFilter = "medium";
      break;
    default:
      difficultyFilter = "hard";
  }
  
  const filteredChallenges = challenges.filter(c => c.difficulty === difficultyFilter);
  return filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
};

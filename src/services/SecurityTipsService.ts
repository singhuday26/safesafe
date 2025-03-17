
import { toast } from 'sonner';

// List of fallback tips in case the API fails
const FALLBACK_TIPS = [
  {
    tip: "Never share your OTP (One-Time Password) with anyone. Legitimate organizations will never ask for it.",
    category: "authentication"
  },
  {
    tip: "Use a different password for each of your accounts. Consider using a password manager.",
    category: "passwords"
  },
  {
    tip: "Enable Multi-Factor Authentication (MFA) whenever possible for an extra layer of security.",
    category: "authentication"
  },
  {
    tip: "Be cautious of phishing emails. Check the sender's email address and don't click suspicious links.",
    category: "phishing"
  },
  {
    tip: "Regularly update your software and applications to protect against security vulnerabilities.",
    category: "general"
  },
  {
    tip: "Monitor your accounts regularly for any unauthorized transactions or activities.",
    category: "monitoring"
  },
  {
    tip: "Use secure, private networks instead of public Wi-Fi for financial transactions.",
    category: "network"
  },
  {
    tip: "Cybersecurity National Helpline: 1-800-123-4567 - Call if you suspect you're a victim of fraud.",
    category: "helpline"
  }
];

export interface SecurityTip {
  tip: string;
  category: string;
  source?: string;
}

export const fetchSecurityTip = async (): Promise<SecurityTip> => {
  try {
    // We'll use the NIST NVD API to get real security advisories
    // This can be replaced with any cybersecurity tips API
    const response = await fetch('https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1&sortBy=publishDate&sortOrder=desc');
    
    if (!response.ok) {
      throw new Error('Failed to fetch security tip');
    }
    
    const data = await response.json();
    
    // If we have a valid response with vulnerabilities
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
      const vuln = data.vulnerabilities[0].cve;
      
      // Format the data into a security tip
      return {
        tip: `Security Alert: ${vuln.descriptions[0].value.slice(0, 120)}...`,
        category: vuln.metrics?.cvssMetricV31?.[0]?.cvssData?.attackVector || "general",
        source: "NIST National Vulnerability Database"
      };
    }
    
    // Fallback to a random tip if no valid data
    return getRandomFallbackTip();
  } catch (error) {
    console.error('Error fetching security tip:', error);
    
    // Return a random fallback tip if the API fails
    return getRandomFallbackTip();
  }
};

// Get a random tip from our fallback list
const getRandomFallbackTip = (): SecurityTip => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_TIPS.length);
  return FALLBACK_TIPS[randomIndex];
};

// Function to show a security tip toast notification
export const showSecurityTipNotification = async () => {
  const tip = await fetchSecurityTip();
  
  toast(`🛡️ Security Tip: ${tip.tip}`, {
    description: tip.source ? `Source: ${tip.source}` : "Stay safe online!",
    duration: 8000,
  });
  
  return tip;
};

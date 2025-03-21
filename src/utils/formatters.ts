

/**
 * Format a currency amount with the appropriate currency symbol
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date in a user-friendly way
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // If it's today, just show the time
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If it's yesterday, show "Yesterday"
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For other dates
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get a color based on risk level
 */
export const getRiskColor = (riskScore: number): string => {
  if (riskScore < 30) return 'text-green-600';
  if (riskScore < 70) return 'text-amber-600';
  return 'text-red-600';
};

/**
 * Get a risk level label based on risk score
 */
export const getRiskLevel = (riskScore: number): string => {
  if (riskScore < 30) return 'low';
  if (riskScore < 70) return 'medium';
  return 'high';
};

/**
 * Format a percentage value with % sign
 */
export const formatPercent = (value: number): string => {
  return `${value}%`;
};

/**
 * Format a transaction status to be more readable
 */
export const formatTransactionStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Format a payment method to be more readable
 */
export const formatPaymentMethod = (method: string): string => {
  return method.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Format alert severity to color class
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-amber-600';
    case 'low': return 'text-green-600';
    default: return 'text-slate-600';
  }
};

/**
 * Format alert type to display name
 */
export const formatAlertType = (type: string): string => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Get badge variant based on alert severity
 * Ensure it returns only 'default' or 'destructive' for use with toast
 */
export const getSeverityVariant = (severity: string): 'default' | 'destructive' => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'default';
    default: return 'default';
  }
};


/**
 * Performance monitoring utilities for measuring and reporting performance metrics
 */

// Track component render time
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${componentName} render time: ${duration.toFixed(2)}ms`);
    
    // Log to performance monitoring service if duration exceeds threshold
    if (duration > 50) {
      logPerformanceIssue({
        component: componentName,
        duration,
        type: 'slow-render'
      });
    }
    
    return duration;
  };
};

// Track data loading time
export const measureDataFetchTime = (queryName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${queryName} fetch time: ${duration.toFixed(2)}ms`);
    
    // Log to performance monitoring service if duration exceeds threshold
    if (duration > 500) {
      logPerformanceIssue({
        query: queryName,
        duration,
        type: 'slow-query'
      });
    }
    
    return duration;
  };
};

// Track user interaction response time
export const measureInteractionTime = (interactionName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${interactionName} response time: ${duration.toFixed(2)}ms`);
    
    // Log to performance monitoring service if duration exceeds threshold
    if (duration > 100) {
      logPerformanceIssue({
        interaction: interactionName,
        duration,
        type: 'slow-interaction'
      });
    }
    
    return duration;
  };
};

interface PerformanceIssue {
  component?: string;
  query?: string;
  interaction?: string;
  duration: number;
  type: 'slow-render' | 'slow-query' | 'slow-interaction';
  timestamp?: number;
}

// Log performance issues (can be integrated with monitoring services)
export const logPerformanceIssue = (issue: PerformanceIssue) => {
  // Add timestamp
  const enhancedIssue = {
    ...issue,
    timestamp: Date.now()
  };
  
  // Store in local storage for development analysis
  const performanceIssues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
  performanceIssues.push(enhancedIssue);
  
  // Keep only the last 50 issues
  if (performanceIssues.length > 50) {
    performanceIssues.shift();
  }
  
  localStorage.setItem('performanceIssues', JSON.stringify(performanceIssues));
  
  // In production, would send to a monitoring service like:
  // sendToMonitoringService(enhancedIssue);
};

// Helper to get browser and device info for more detailed monitoring
export const getEnvironmentInfo = () => {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    isOnline: navigator.onLine,
    language: navigator.language,
    memoryInfo: (performance as any).memory 
      ? {
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize
        }
      : 'Not available'
  };
};

// Helper to get important performance metrics
export const getPerformanceMetrics = () => {
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigationTiming) return null;
  
  return {
    dnsLookup: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
    tcpConnection: navigationTiming.connectEnd - navigationTiming.connectStart,
    serverResponse: navigationTiming.responseStart - navigationTiming.requestStart,
    domLoad: navigationTiming.domComplete - navigationTiming.domLoading,
    resourceLoad: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
    totalPageLoad: navigationTiming.loadEventEnd - navigationTiming.startTime
  };
};

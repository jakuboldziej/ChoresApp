import { IntervalType } from '@/components/Chores/IntervalSelector';

export interface IntervalData {
  isRepeatable: boolean;
  intervalType?: IntervalType;
  customDays?: number;
}

/**
 * Calculates the next due date based on interval type and custom days
 */
export function calculateNextDueDate(
  intervalType: IntervalType,
  customDays?: number,
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate);

  switch (intervalType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    
    case 'custom':
      if (customDays && customDays > 0) {
        nextDate.setDate(nextDate.getDate() + customDays);
      } else {
        nextDate.setDate(nextDate.getDate() + 1); 
      }
      break;
    
    default:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
  }

  return nextDate;
}

export function formatIntervalDisplay(intervalData: IntervalData): string {
  if (!intervalData.isRepeatable || !intervalData.intervalType) {
    return 'Jednorazowe';
  }

  switch (intervalData.intervalType) {
    case 'daily':
      return 'Codziennie';
    
    case 'weekly':
      return 'Co tydzień';
    
    case 'monthly':
      return 'Co miesiąc';
    
    case 'custom':
      const days = intervalData.customDays || 1;
      if (days === 1) return 'Codziennie';
      if (days < 5) return `Co ${days} dni`;
      return `Co ${days} dni`;
    
    default:
      return 'Jednorazowe';
  }
}

export function validateIntervalData(intervalData: IntervalData): {
  isValid: boolean;
  error?: string;
} {
  if (!intervalData.isRepeatable) {
    return { isValid: true };
  }

  if (!intervalData.intervalType) {
    return {
      isValid: false,
      error: 'Wybierz typ interwału dla zadania powtarzalnego'
    };
  }

  if (intervalData.intervalType === 'custom') {
    if (!intervalData.customDays || intervalData.customDays < 1) {
      return {
        isValid: false,
        error: 'Liczba dni dla niestandardowego interwału musi być większa od 0'
      };
    }

    if (intervalData.customDays > 365) {
      return {
        isValid: false,
        error: 'Liczba dni nie może być większa niż 365'
      };
    }
  }

  return { isValid: true };
}
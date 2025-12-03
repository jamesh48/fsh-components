import { useState, useCallback } from "react";

/**
 * Hook to manage DynamoDB-style cursor-based pagination
 *
 * @example
 * ```tsx
 * const {
 *   nextToken,
 *   hasMore,
 *   canGoBack,
 *   handleNextPage,
 *   handlePreviousPage,
 *   updatePagination,
 *   reset
 * } = useCursorPagination();
 *
 * // After fetching data:
 * updatePagination(data.nextToken, data.items.length > 0);
 * ```
 */
export const useCursorPagination = () => {
  // Stack of tokens for backward navigation
  const [tokenStack, setTokenStack] = useState<(string | null)[]>([null]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  /**
   * Update pagination state after fetching data
   * @param newNextToken - The token for the next page (from API response)
   * @param hasMoreData - Whether there are more items to fetch
   */
  const updatePagination = useCallback((newNextToken: string | null, hasMoreData: boolean) => {
    setNextToken(newNextToken);
    setHasMore(hasMoreData && !!newNextToken);
  }, []);

  /**
   * Navigate to the next page
   */
  const handleNextPage = useCallback(() => {
    if (!hasMore) return;

    if (currentIndex < tokenStack.length - 1) {
      // We have tokens ahead in the stack (navigating forward through history)
      setCurrentIndex((prev) => prev + 1);
    } else if (currentIndex === tokenStack.length - 1 && nextToken) {
      // We're at the end of the stack, push new token and move forward
      setTokenStack((prev) => [...prev, nextToken]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasMore, nextToken, tokenStack.length, currentIndex]);

  /**
   * Navigate to the previous page
   */
  const handlePreviousPage = useCallback(() => {
    if (currentIndex <= 0) return;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);

    // Update nextToken to the token at the position ahead of where we're going
    // This allows "Next" to work after going back
    if (newIndex + 1 < tokenStack.length) {
      setNextToken(tokenStack[newIndex + 1]);
      setHasMore(true);
    }
  }, [currentIndex, tokenStack]);

  /**
   * Reset pagination to initial state
   */
  const reset = useCallback(() => {
    setTokenStack([null]);
    setCurrentIndex(0);
    setNextToken(null);
    setHasMore(false);
  }, []);

  /**
   * Get the current token for API requests
   */
  const getCurrentToken = useCallback(() => {
    return tokenStack[currentIndex];
  }, [tokenStack, currentIndex]);

  const canGoBack = currentIndex > 0;

  return {
    // State
    nextToken,
    hasMore,
    canGoBack,
    currentToken: getCurrentToken(),

    // Actions
    handleNextPage,
    handlePreviousPage,
    updatePagination,
    reset,
    getCurrentToken,
  };
};

export default useCursorPagination;

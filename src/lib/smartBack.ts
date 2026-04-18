/** Smart back navigation: go back if there's history, else fallback */
import { useNavigate } from "react-router-dom";

export function useSmartBack(fallback: string = "/") {
  const navigate = useNavigate();
  return () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}

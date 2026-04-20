/**
 * GuestProfilePreview — guests tapping the Account tab are sent straight to Sign Up.
 * No welcome screen, no browse grid.
 */
import { Navigate, useLocation } from "react-router-dom";

export default function GuestProfilePreview() {
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/signup?redirect=${redirect}`} replace />;
}

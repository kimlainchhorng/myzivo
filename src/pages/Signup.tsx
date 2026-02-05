import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Signup page - redirects to unified login page with signup mode
 * The premium auth design combines login/signup in a single component
 */
const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page with signup mode active
    navigate("/login?mode=signup", { replace: true });
  }, [navigate]);

  // Show nothing while redirecting
  return null;
};

export default Signup;

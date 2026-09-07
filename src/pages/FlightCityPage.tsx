import { Navigate, useParams } from "react-router-dom";

/**
 * Legacy /flights/cities/:citySlug URLs. These were indexed before the city
 * pages moved, so keep the city rather than dropping searchers on the generic
 * flights landing — /flights/to/:citySlug is the page they were looking for.
 */
const FlightCityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  return <Navigate to={citySlug ? `/flights/to/${citySlug}` : "/flights"} replace />;
};

export default FlightCityPage;

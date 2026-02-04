import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Common countries for the dropdown
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

// US States for billing
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia"
];

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface BillingAddressFormProps {
  value: BillingAddress;
  onChange: (address: BillingAddress) => void;
  errors?: Partial<Record<keyof BillingAddress, string>>;
  disabled?: boolean;
}

export default function BillingAddressForm({
  value,
  onChange,
  errors = {},
  disabled = false,
}: BillingAddressFormProps) {
  const handleChange = (field: keyof BillingAddress, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const showStates = value.country === "US";

  return (
    <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Billing Address
        </CardTitle>
        <CardDescription>
          Enter the address associated with your payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Country */}
        <div>
          <Label>Country *</Label>
          <Select
            value={value.country}
            onValueChange={(v) => handleChange("country", v)}
            disabled={disabled}
          >
            <SelectTrigger className={errors.country ? "border-destructive" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-destructive mt-1">{errors.country}</p>
          )}
        </div>

        {/* Address Line 1 */}
        <div>
          <Label>Address Line 1 *</Label>
          <Input
            value={value.line1}
            onChange={(e) => handleChange("line1", e.target.value)}
            placeholder="Street address"
            disabled={disabled}
            className={errors.line1 ? "border-destructive" : ""}
          />
          {errors.line1 && (
            <p className="text-xs text-destructive mt-1">{errors.line1}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <Label>Address Line 2</Label>
          <Input
            value={value.line2 || ""}
            onChange={(e) => handleChange("line2", e.target.value)}
            placeholder="Apt, suite, unit, etc. (optional)"
            disabled={disabled}
          />
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label>City *</Label>
            <Input
              value={value.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
              disabled={disabled}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-xs text-destructive mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <Label>{showStates ? "State *" : "State/Province"}</Label>
            {showStates ? (
              <Select
                value={value.state}
                onValueChange={(v) => handleChange("state", v)}
                disabled={disabled}
              >
                <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={value.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="State/Province"
                disabled={disabled}
              />
            )}
            {errors.state && (
              <p className="text-xs text-destructive mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <Label>Postal Code *</Label>
            <Input
              value={value.postal_code}
              onChange={(e) => handleChange("postal_code", e.target.value)}
              placeholder={value.country === "US" ? "ZIP code" : "Postal code"}
              disabled={disabled}
              className={errors.postal_code ? "border-destructive" : ""}
            />
            {errors.postal_code && (
              <p className="text-xs text-destructive mt-1">{errors.postal_code}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Account Safety Settings Component
 * User-facing security settings and recommendations
 */

import { useState } from "react";
import {
  Check,
  ChevronRight,
  Key,
  Lock,
  Mail,
  Shield,
  Smartphone,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ACCOUNT_SAFETY_RULES } from "@/config/riskManagement";
import { cn } from "@/lib/utils";

interface SecurityStatus {
  emailVerified: boolean;
  strongPassword: boolean;
  twoFactorEnabled: boolean;
  recentActivity: boolean;
  loginAlerts: boolean;
}

interface AccountSafetySettingsProps {
  status?: SecurityStatus;
  onEnable2FA?: () => void;
  onVerifyEmail?: () => void;
  onChangePassword?: () => void;
  onToggleLoginAlerts?: (enabled: boolean) => void;
  variant?: "full" | "compact" | "card";
  className?: string;
}

const DEFAULT_STATUS: SecurityStatus = {
  emailVerified: true,
  strongPassword: true,
  twoFactorEnabled: false,
  recentActivity: true,
  loginAlerts: false,
};

export function AccountSafetySettings({
  status = DEFAULT_STATUS,
  onEnable2FA,
  onVerifyEmail,
  onChangePassword,
  onToggleLoginAlerts,
  variant = "full",
  className,
}: AccountSafetySettingsProps) {
  const [showPasswordTips, setShowPasswordTips] = useState(false);

  const calculateSecurityScore = () => {
    let score = 0;
    if (status.emailVerified) score += 25;
    if (status.strongPassword) score += 25;
    if (status.twoFactorEnabled) score += 30;
    if (status.loginAlerts) score += 20;
    return score;
  };

  const securityScore = calculateSecurityScore();

  const getScoreLabel = () => {
    if (securityScore >= 80) return { label: "Excellent", color: "text-emerald-500" };
    if (securityScore >= 60) return { label: "Good", color: "text-blue-500" };
    if (securityScore >= 40) return { label: "Fair", color: "text-amber-500" };
    return { label: "Needs Improvement", color: "text-red-500" };
  };

  const scoreInfo = getScoreLabel();

  if (variant === "card") {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className={cn("w-5 h-5", scoreInfo.color)} />
              <span className="font-medium text-sm">Account Security</span>
            </div>
            <Badge variant="outline" className={scoreInfo.color}>
              {securityScore}%
            </Badge>
          </div>
          <Progress value={securityScore} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {scoreInfo.label} - {100 - securityScore}% room for improvement
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Security Score</span>
          <span className={cn("font-bold", scoreInfo.color)}>{securityScore}%</span>
        </div>
        <Progress value={securityScore} className="h-2" />
        
        <div className="space-y-2">
          <SecurityItem
            icon={Mail}
            label="Email Verified"
            completed={status.emailVerified}
            action={!status.emailVerified ? onVerifyEmail : undefined}
          />
          <SecurityItem
            icon={Key}
            label="Strong Password"
            completed={status.strongPassword}
            action={!status.strongPassword ? onChangePassword : undefined}
          />
          <SecurityItem
            icon={Smartphone}
            label="Two-Factor Auth"
            completed={status.twoFactorEnabled}
            action={!status.twoFactorEnabled ? onEnable2FA : undefined}
            recommended
          />
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account Security
          </CardTitle>
          <Badge variant="outline" className={cn("text-sm", scoreInfo.color)}>
            {securityScore}% Secure
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Security Score</span>
            <span className={cn("font-medium", scoreInfo.color)}>{scoreInfo.label}</span>
          </div>
          <Progress value={securityScore} className="h-3" />
        </div>

        {/* Recommendations */}
        {securityScore < 80 && (
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-sm text-amber-600 ml-2">
              {!status.twoFactorEnabled && "Enable two-factor authentication for better protection. "}
              {!status.loginAlerts && "Turn on login alerts to monitor account access."}
            </AlertDescription>
          </Alert>
        )}

        {/* Security Options */}
        <div className="space-y-3">
          <SecurityRow
            icon={Mail}
            title="Email Verification"
            description="Verify your email address"
            completed={status.emailVerified}
            action={!status.emailVerified ? (
              <Button size="sm" variant="outline" onClick={onVerifyEmail}>
                Verify
              </Button>
            ) : undefined}
          />

          <SecurityRow
            icon={Key}
            title="Password Strength"
            description={`Minimum ${ACCOUNT_SAFETY_RULES.passwordRules.minLength} characters with mixed case and numbers`}
            completed={status.strongPassword}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPasswordTips(!showPasswordTips)}
              >
                {showPasswordTips ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            }
          />

          {showPasswordTips && (
            <div className="ml-9 p-3 rounded-lg bg-muted/30 text-xs space-y-1">
              <p className="font-medium">Password Requirements:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>At least {ACCOUNT_SAFETY_RULES.passwordRules.minLength} characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Avoid common words or personal info</li>
              </ul>
              <Button size="sm" variant="link" className="p-0 h-auto" onClick={onChangePassword}>
                Change password →
              </Button>
            </div>
          )}

          <SecurityRow
            icon={Smartphone}
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            completed={status.twoFactorEnabled}
            recommended={!status.twoFactorEnabled}
            action={!status.twoFactorEnabled ? (
              <Button size="sm" onClick={onEnable2FA}>
                Enable
              </Button>
            ) : undefined}
          />

          <SecurityRow
            icon={Lock}
            title="Login Alerts"
            description="Get notified of new sign-ins"
            completed={status.loginAlerts}
            action={
              <Switch
                checked={status.loginAlerts}
                onCheckedChange={onToggleLoginAlerts}
              />
            }
          />
        </div>

        {/* Session Info */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Sessions timeout after {ACCOUNT_SAFETY_RULES.sessionTimeout / 3600} hours of activity 
            or {ACCOUNT_SAFETY_RULES.inactivityTimeout / 3600} hours of inactivity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface SecurityItemProps {
  icon: React.ElementType;
  label: string;
  completed: boolean;
  action?: () => void;
  recommended?: boolean;
}

function SecurityItem({ icon: Icon, label, completed, action, recommended }: SecurityItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-lg",
        completed ? "bg-emerald-500/10" : "bg-muted/30"
      )}
    >
      <div className="flex items-center gap-2">
        {completed ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Icon className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm">{label}</span>
        {recommended && !completed && (
          <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
            Recommended
          </Badge>
        )}
      </div>
      {action && (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={action}>
          Set up <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

interface SecurityRowProps {
  icon: React.ElementType;
  title: string;
  description: string;
  completed: boolean;
  recommended?: boolean;
  action?: React.ReactNode;
}

function SecurityRow({
  icon: Icon,
  title,
  description,
  completed,
  recommended,
  action,
}: SecurityRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center",
        completed ? "bg-emerald-500/10" : "bg-muted/50"
      )}>
        {completed ? (
          <Check className="w-5 h-5 text-emerald-500" />
        ) : (
          <Icon className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{title}</p>
          {recommended && (
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
              Recommended
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default AccountSafetySettings;

// ============= Full file contents =============

1: import { Clock, RefreshCw, LogOut } from "lucide-react";
2: import {
3:   AlertDialog,
4:   AlertDialogContent,
5:   AlertDialogDescription,
6:   AlertDialogFooter,
7:   AlertDialogHeader,
8:   AlertDialogTitle,
9: } from "@/components/ui/alert-dialog";
10: import { Button } from "@/components/ui/button";
11: 
12: interface SessionTimeoutWarningProps {
13:   open: boolean;
14:   minutesRemaining: number | null;
15:   onStaySignedIn: () => Promise<boolean> | void;
16:   onSignOut: () => void;
17:   isRefreshing?: boolean;
18: }
19: 
20: export default function SessionTimeoutWarning({
21:   open,
22:   minutesRemaining,
23:   onStaySignedIn,
24:   onSignOut,
25:   isRefreshing = false,
26: }: SessionTimeoutWarningProps) {
27:   return (
28:     <AlertDialog open={open}>
29:       <AlertDialogContent className="max-w-md">
30:         <AlertDialogHeader>
31:           <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
32:             <Clock className="h-8 w-8 text-amber-500" />
33:           </div>
34:           <AlertDialogTitle className="text-center text-xl">
35:             Session Expiring Soon
36:           </AlertDialogTitle>
37:           <AlertDialogDescription className="text-center">
38:             Your session will expire in{" "}
39:             <span className="font-bold text-foreground">
40:               {minutesRemaining} {minutesRemaining === 1 ? "minute" : "minutes"}
41:             </span>
42:             . Would you like to stay signed in?
43:           </AlertDialogDescription>
44:         </AlertDialogHeader>
45: 
46:         <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground text-center">
47:           For your security, sessions expire after a period of inactivity.
48:           Click "Stay Signed In" to continue your session.
49:         </div>
50: 
51:         <AlertDialogFooter className="flex-col sm:flex-row gap-2">
52:           <Button
53:             variant="outline"
54:             onClick={onSignOut}
55:             disabled={isRefreshing}
56:             className="w-full sm:w-auto rounded-xl h-11 active:scale-95 transition-all duration-200 touch-manipulation"
57:           >
58:             <LogOut className="h-4 w-4 mr-2" />
59:             Sign Out
60:           </Button>
61:           <Button
62:             onClick={() => onStaySignedIn()}
63:             disabled={isRefreshing}
64:             className="w-full sm:w-auto bg-gradient-to-r from-primary to-teal-400 text-white rounded-xl h-11 shadow-md active:scale-95 transition-all duration-200 touch-manipulation"
65:           >
66:             <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
67:             {isRefreshing ? "Refreshing..." : "Stay Signed In"}
68:           </Button>
69:         </AlertDialogFooter>
70:       </AlertDialogContent>
71:     </AlertDialog>
72:   );
73: }
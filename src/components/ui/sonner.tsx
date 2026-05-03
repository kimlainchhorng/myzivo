import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand
      visibleToasts={3}
      gap={8}
      offset="max(env(safe-area-inset-top), 12px)"
      mobileOffset="calc(max(env(safe-area-inset-top), 44px) + 8px)"
      style={{ zIndex: 99999 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-[22px] group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border/40 group-[.toaster]:shadow-[0_18px_50px_rgba(0,0,0,0.14)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
          success: "group-[.toaster]:!text-emerald-600 dark:group-[.toaster]:!text-emerald-400",
          error: "group-[.toaster]:!text-red-600 dark:group-[.toaster]:!text-red-400",
          warning: "group-[.toaster]:!text-amber-600 dark:group-[.toaster]:!text-amber-400",
          info: "group-[.toaster]:!text-sky-600 dark:group-[.toaster]:!text-sky-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

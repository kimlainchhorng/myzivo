import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      expand
      visibleToasts={3}
      gap={8}
      offset="calc(env(safe-area-inset-top) + 18px)"
      style={{ zIndex: 99999 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-[22px] group-[.toaster]:bg-zinc-950/85 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_18px_50px_rgba(0,0,0,0.45)] group-[.toaster]:px-4 group-[.toaster]:py-3.5",
          title: "group-[.toast]:text-white group-[.toast]:font-medium",
          description: "group-[.toast]:text-white/70",
          actionButton:
            "group-[.toast]:!bg-emerald-500 group-[.toast]:!text-zinc-950 group-[.toast]:!rounded-full group-[.toast]:!px-3.5 group-[.toast]:!py-1.5 group-[.toast]:!text-xs group-[.toast]:!font-semibold hover:group-[.toast]:!bg-emerald-400",
          cancelButton:
            "group-[.toast]:!bg-white/10 group-[.toast]:!text-white/80 group-[.toast]:!rounded-full group-[.toast]:!px-3.5 group-[.toast]:!py-1.5 group-[.toast]:!text-xs",
          success: "group-[.toaster]:!text-emerald-400",
          error: "group-[.toaster]:!text-rose-400",
          warning: "group-[.toaster]:!text-amber-400",
          info: "group-[.toaster]:!text-sky-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

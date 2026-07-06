import { useMemo } from "react";

export function PasswordStrength({ password }: { password?: string }) {
    if (!password) return null;

    const strength = useMemo(() => {
        const checks = [
            password.length >= 8,
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
        ];
        return checks.filter(Boolean).length;
    }, [password]);

    // Using shadcn's generic colors to support theming (e.g., bg-destructive, bg-warning, bg-success)
    // If you don't have custom variables for warning/success, we can use hexes, but here we fallback to known CSS classes.
    // Let's use Tailwind's built-in colors since they map well to both light/dark if configured, or just generic tailwind ones.
    const colors = ["bg-destructive", "bg-orange-500", "bg-green-500"];
    const labels = ["Yếu", "Trung bình", "Mạnh"];

    return (
        <div className="space-y-1.5 mt-2">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? colors[strength - 1] : "bg-muted"}`}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
                Độ mạnh: <span className="font-medium text-foreground">{labels[strength - 1] ?? "Quá ngắn"}</span>
            </p>
        </div>
    );
}

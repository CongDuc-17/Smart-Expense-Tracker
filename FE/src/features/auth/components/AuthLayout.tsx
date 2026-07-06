import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthLayoutProps {
  title: string;
  description: ReactNode;
  actionText?: string;
  actionLink?: string;
  actionLabel?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function AuthLayout({
  title,
  description,
  actionText,
  actionLink,
  actionLabel,
  children,
  maxWidth = "sm",
}: AuthLayoutProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[maxWidth];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className={`w-full ${maxWidthClass}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {actionLink && actionLabel && (
            <CardAction>
              <Link to={actionLink}>
                <Button variant="link" className="px-0">
                  {actionLabel}
                </Button>
              </Link>
            </CardAction>
          )}
        </CardHeader>
        {children}
      </Card>
    </div>
  );
}

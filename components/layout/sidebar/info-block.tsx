import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoBlockProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  buttonColorClass?: string;
  buttonClassName?: string;
}

export function InfoBlock({
  title,
  description,
  buttonText,
  buttonHref,
  buttonColorClass = "bg-green-500",
  buttonClassName = "",
}: InfoBlockProps) {
  return (
    <Card className="gap-4 overflow-hidden py-4 group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <Button className={`w-full ${buttonClassName}`} asChild>
          <Link href={buttonHref} target="_blank">
            <span className={`size-2 shrink-0 rounded-full ${buttonColorClass}`}></span >
            {buttonText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

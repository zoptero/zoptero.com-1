"use client";

import * as React from "react";
import { Check, Plus, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const users = [
  {
    name: "Olivia Martin",
    email: "m@example.com",
    avatar: `/images/avatars/01.png`
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: `/images/avatars/07.png`
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    avatar: `/images/avatars/02.png`
  },
  {
    name: "Jackson Lee",
    email: "lee@example.com",
    avatar: `/images/avatars/09.png`
  },
  {
    name: "William Kim",
    email: "will@email.com",
    avatar: `/images/avatars/06.png`
  }
] as const;

type User = (typeof users)[number];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  const [messages, setMessages] = React.useState([
    {
      role: "agent",
      content: "Hi, how can I help you today?"
    },
    {
      role: "user",
      content: "Hey, I'm having trouble with my account."
    },
    {
      role: "agent",
      content: "What seems to be the problem?"
    },
    {
      role: "user",
      content: "I can't log in."
    }
  ]);
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`/images/avatars/04.png`} />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm leading-none font-medium">Sofia Davis</p>
              <p className="text-muted-foreground text-sm">m@example.com</p>
            </div>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  type RowSelectionState
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  Mail,
  Tag,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface Payment {
  id: string;
  status: "success" | "processing" | "failed";
  email: string;
  firstName: string;
  lastName: string;
  amount: number;
}

export function LatestPayments() {
  const data = React.useMemo<Payment[]>(
    () => [
      {
        id: "1",
        status: "success",
        email: "ken99@yahoo.com",
        firstName: "Kenneth",
        lastName: "Thompson",
        amount: 316.0
      },
      {
        id: "2",
        status: "success",
        email: "abe45@gmail.com",
        firstName: "Abraham",
        lastName: "Lincoln",
        amount: 242.0
      },
      {
        id: "3",
        status: "processing",
        email: "monserrat44@gmail.com",
        firstName: "Monserrat",
        lastName: "Rodriguez",
        amount: 837.0
      },
      {
        id: "4",
        status: "success",
        email: "silas22@gmail.com",
        firstName: "Silas",
        lastName: "Johnson",
        amount: 874.0
      },
      {
        id: "5",
        status: "failed",
        email: "carmella@hotmail.com",
        firstName: "Carmella",
        lastName: "DeVito",
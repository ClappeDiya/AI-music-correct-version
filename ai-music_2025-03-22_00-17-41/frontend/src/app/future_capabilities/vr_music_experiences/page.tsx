"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Headphones, Cube, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/useToast";
import { futureCapabilitiesApi } from "@/lib/api/future_capabilities";
import { VREnvironmentConfig } from "@/lib/types/future_capabilities";
// ... existing code ...

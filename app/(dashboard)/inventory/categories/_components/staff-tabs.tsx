"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

interface StaffTabsProps {
  designations: string[];
  activeDesignation: string;
}

export function StaffTabs({ designations, activeDesignation }: StaffTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (designation: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("designation", designation);
    params.set("page", "0"); // ටැබ් මාරු කරන විට, පළමු පිටුවට යන්න
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={activeDesignation} onValueChange={handleTabChange}>
      <TabsList>
        {designations.map((designation) => (
          <TabsTrigger key={designation} value={designation}>
            {designation}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

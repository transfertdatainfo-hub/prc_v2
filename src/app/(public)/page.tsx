import Image from "next/image";
import { PRCButton } from "@/components/prc/button";
import { PRCCard } from "@/components/prc/card";
import { PRCTag } from "@/components/prc/tag";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="p-8 space-y-4">
        <Input placeholder="Test input" />

        <Badge>Badge</Badge>

        <Separator />

        <p>UI components OK</p>
      </div>
    </main>
  );
}

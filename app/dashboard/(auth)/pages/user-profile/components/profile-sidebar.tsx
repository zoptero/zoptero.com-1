"use client";

import { Mail, Phone, Briefcase, TrendingUp, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { useProfileStore } from "../store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSidebar() {
  const { profileCompletion } = useProfileStore();
  const profile = useQuery(api.profiles.getMe);

  const displayName = profile?.displayName ?? "";
  const email = profile?.email ?? "";
  const phone = profile?.phone ?? "";
  const city = profile?.city ?? "";
  const accountType = profile?.accountType ?? "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={profileCompletion} className="flex-1" />
            <span className="text-muted-foreground text-xs">{profileCompletion}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">About</h3>

        <div className="space-y-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-1 lg:space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Users className="text-muted-foreground h-4 w-4" />
              <span>{displayName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="text-muted-foreground h-4 w-4" />
              <span>{city}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="text-muted-foreground h-4 w-4" />
              <span>{accountType}</span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-3 text-xs font-medium uppercase">Contacts</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span>{phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

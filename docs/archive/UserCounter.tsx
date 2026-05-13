// Archived user counter from /sign-in left column
// This code is preserved for future reference or reuse.

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ArchivedUserCounter() {
  const userCount = useQuery(api.users.countUsers);
  const liveUserCount = typeof userCount === 'number' ? userCount : 0;
  return (
    <span className='block font-medium text-zinc-600'>
      Pievienojies{' '}
      <span className='font-bold text-zinc-950'>
        {liveUserCount}
      </span>{' '}
      lietotājiem
    </span>
  );
}

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: "pk_prod_giNPugs-BwfJeN_TsRAZF9azg4NM_KtQCHN7NQ-RWtTfZJFWoR5bSX5q1FIBQboO",
});

export const { RoomProvider, useOthersMapped, useOthers, useMyPresence } = createRoomContext(client);
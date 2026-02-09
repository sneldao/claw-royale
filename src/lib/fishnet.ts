import { MemoryAdapter } from "fishnet-auth/adapters/memory";
import { fishnetAuth as createFishnetAuth, createGetAgent } from "fishnet-auth";

const FISHNET_SECRET = process.env.FISHNET_AUTH_SECRET || "dev-secret-key-for-testing";

const adapter = MemoryAdapter();

export const fishnetConfig = {
  secret: FISHNET_SECRET,
  adapter,
  difficulty: "easy" as const,
  taskCount: 2,
  minCorrect: 2,
  credentials: {
    type: "api-key" as const,
    prefix: "agent_",
    expiresIn: "1d",
  },
};

/**
 * Shared fishnetAuth instance.
 * GET  = discovery handler
 * POST = authentication handler
 * engine = FishnetAuthEngine for direct use
 */
export const { GET, POST, engine } = createFishnetAuth(fishnetConfig);

/**
 * Validate an agent bearer token from any request.
 * Returns the agent record or null.
 */
export const getAgent = createGetAgent({
  secret: fishnetConfig.secret,
  adapter: fishnetConfig.adapter,
});

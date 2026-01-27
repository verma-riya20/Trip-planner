import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateTripDetail = mutation({
  args: {
    tripId: v.string(),
    uid: v.id("UserTable"),
    tripDetail: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("🔍 CreateTripDetail Mutation Args:", {
        tripId: args.tripId,
        uid: args.uid,
        tripDetailKeys: Object.keys(args.tripDetail || {}),
      });

      // Insert trip details into TripDetailTable
      const result = await ctx.db.insert("TripDetailTable", {
        tripDetail: args.tripDetail,
        tripId: args.tripId,
        uid: args.uid,
        createdAt: Date.now(),
      });

      console.log("✅ Trip successfully inserted into TripDetailTable with ID:", result);

      const savedTrip = await ctx.db.get(result);
      console.log("✅ Trip details saved:", {
        _id: result,
        tripId: args.tripId,
        uid: args.uid,
      });

      return savedTrip;
    } catch (error) {
      console.error("❌ Error in CreateTripDetail Mutation:", {
        error: String(error),
        args: {
          tripId: args.tripId,
          uid: args.uid,
        },
      });
      throw new Error(`Failed to save trip details: ${String(error)}`);
    }
  },
});

export const GetUserTrips = query({
  args: {
    uid: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db
        .query("TripDetailTable")
        .withIndex("by_uid", (q) => q.eq("uid", args.uid))
        .order("desc")
        .collect();

      console.log(`📋 Found ${result.length} trips for user ${args.uid}`);
      return result;
    } catch (error) {
      console.error("❌ Error fetching user trips:", error);
      throw new Error("Failed to fetch trips");
    }
  },
});

export const GetTripById = query({
  args: {
    tripId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`🔍 Fetching trip by ID: ${args.tripId}`);
      
      const trip = await ctx.db.get(args.tripId as any);
      
      if (!trip) {
        console.warn(`⚠️ Trip with ID ${args.tripId} not found`);
        throw new Error(`Trip with ID ${args.tripId} does not exist.`);
      }

      console.log(`✅ Trip found:`, trip);
      return trip;
    } catch (error) {
      console.error("❌ Error fetching trip by ID:", error);
      throw new Error("Failed to fetch trip details");
    }
  },
});
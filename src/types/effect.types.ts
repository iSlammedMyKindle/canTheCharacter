import * as z from "zod";

export type efType = "applause" | "aww" | "boo" | "crickets" | "mumbling" | "laughter";
export const effect = z.literal(["applause", "aww", "boo", "crickets", "mumbling", "laughter"]);

export interface effectDTO {
    effect: efType
}
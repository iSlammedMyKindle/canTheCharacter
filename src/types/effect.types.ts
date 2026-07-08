import * as z from "zod";

export type efType = "applause" | "aww-h" | "aww-s" | "boo" | "crickets" | "gasp" | "mumbling" | "laughter" | "laughter-s";
export const effect = z.literal(["applause", "aww-h", "aww-s", "boo", "crickets", "gasp", "mumbling", "laughter", "laughter-s"]);

export interface effectDTO {
    effect: efType
}
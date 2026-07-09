import * as z from "zod";

export type efType = "applause" | "aww-h" | "aww-s" | "boo" | "crickets" | "gasp" | "mumbling" | "laugh" | "laugh-s" | "lol";
export const effect = z.literal(["applause", "aww-h", "aww-s", "boo", "crickets", "gasp", "mumbling", "laugh", "laugh-s", "lol"]);

export interface effectDTO {
    effect: efType
}
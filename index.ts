// Made by iSlammedMyKindle in 2026!
// Can the character is basically a soundbox featuring all the things you'd see from a comedy audience. He moves & reacts to sounds and audience reactions!
// This is my first for real-this-time bun project, and thus has a lot of neat things like typescript & easy to asseble websocket & http servers!
import EventEmitter from "node:events";
import page from "./src/index.html";
import { type efType, type effectDTO, effect } from "./src/types/effect.types";
import { argv } from "node:process";
import { address } from "./config.json";

// Purely to store sessions based on hash. We don't need to per-say, but important to track in case something goes south, or at the very least debug & track ongoing things
const clientMap = new Map<Bun.ServerWebSocket, (str: string) => void>();
const emitter = new EventEmitter();
const spamMap = new Map<string, SpamRecord>()

// All users should only be allowed to only send a command every 30 seconds
interface SpamRecord {
    warned: boolean,
    helpWarned: boolean,
    playedSound: boolean,
    gotHelp: boolean,
}

interface TlcDTO {
    text?: string,
    user?: string,
    id?: string
    accepted?: String[],
    rejected?: String[]
}

function releaseSpamRecord(user: string) {
    spamMap.delete(user);
}

function isSpamming(user: string, id: string, ws: WebSocket, isHelpCmd: boolean = false): boolean {

    // Ensure the person isn't spamming, then emit the event!
    const targetSpamRecord = spamMap.get(user);
    const targetWarning = isHelpCmd ? targetSpamRecord?.helpWarned : targetSpamRecord?.warned;

    if (targetSpamRecord) {

        if (!isHelpCmd && !targetSpamRecord.playedSound) {
            targetSpamRecord.playedSound = true;
            return false;
        }

        if (isHelpCmd && !targetSpamRecord.gotHelp) {
            targetSpamRecord.gotHelp = true;
            return false;
        }

        // Prevent spam
        if (targetWarning) return true;

        targetSpamRecord[isHelpCmd ? "helpWarned" : "warned"] = true;

        ws.send(JSON.stringify({
            action: "message", text: `[can] Goin too fast compadre! Please wait 30 seconds per-sound effect!`, replyTo: id
        }));

        return true;
    }

    spamMap.set(user, { warned: false, helpWarned: false, playedSound: !isHelpCmd, gotHelp: isHelpCmd });
    setTimeout(() => releaseSpamRecord(user), 30000);

    return false;
}

const server = Bun.serve({
    port: 9013,
    routes: {
        "/": page,

        "/api/:effect": req => {
            const effectStr = req.params["effect"] as efType;
            let acceptable = false;

            try {
                effect.parse(effectStr)
                acceptable = true;
            }
            catch (e) {
                console.error("Invalid type!", e);
            }

            if (acceptable) {
                // Talk to the the WSS and return an incoming sound effect:
                emitter.emit("effect", effectStr);
            }

            return Response.json({
                accepted: acceptable,
                effectName: req.params["effect"]
            })
        }
    }
})

const wsServer = Bun.serve({
    port: 9014,
    fetch(req, server) {
        server.upgrade(req);
    },
    websocket: {
        open(ws) {
            console.log("connected to client!");

            clientMap.set(ws, (str: string) => wsOnEffect(ws, str));
            emitter.on('effect', clientMap.get(ws)!);
        },
        close(ws) {
            console.log("Disconnecting from client...");
            emitter.off('effect', clientMap.get(ws)!);
            clientMap.delete(ws);
        },
        message(_ws, message) {
            // Other than permissions, we don't need to send anything right now
            console.log('Client Message:', message);
        },
    },
});

if (!argv.includes("--no-tlc")) {
    // Twitch Listener Core will accept twitch commands, based on messages sent to the chat & the types initiated
    try {
        const tlcServer = new WebSocket(address);

        // Request permissions
        tlcServer.addEventListener("open", _evt => {
            console.log("Connected to TLC! Requesting msg perm...");
            tlcServer.send(JSON.stringify(["message"]));
        });

        tlcServer.addEventListener("message", (evt) => {
            const data = JSON.parse(evt.data) as TlcDTO;

            console.log("TLC", data);

            // Look for exclamation points
            if (data.accepted || (data.text || "")[0] != "!") return;

            // If we got a bite, then identify if that's a command we parse
            const cmd = data.text!.substring(1).split(" ")[0];
            if (cmd == "can") {
                if (isSpamming(data.user!, data.id!, tlcServer, true)) return;

                tlcServer.send(JSON.stringify({
                    action: "message", text: `[can] List of sounds: ${[...effect.values].map(e => "!" + e).join(" ")}`, replyTo: data.id
                }));
            }

            // Run the command!
            else if (effect.safeParse(cmd).success) {
                if (isSpamming(data.user!, data.id!, tlcServer)) return;
                emitter.emit("effect", cmd);
                tlcServer.send(JSON.stringify({
                    action: "message", text: `[can] Now sending "${cmd}" ...`, replyTo: data.id
                }));
            }
        });
    }
    catch (e) {
        console.error("Failed to connect to TLC!", e);
    }
}

function wsOnEffect(ws: Bun.ServerWebSocket, effect: string) {
    ws.send(JSON.stringify({
        effect
    } as effectDTO));
}

console.log("HTTP & WS started!", server.url, server.port, wsServer.port);
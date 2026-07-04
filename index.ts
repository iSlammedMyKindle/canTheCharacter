// Made by iSlammedMyKindle in 2026!
// Can the character is basically a soundbox featuring all the things you'd see from a comedy audience. He moves & reacts to sounds and audience reactions!
// This is my first for real-this-time bun project, and thus has a lot of neat things like typescript & easy to asseble websocket & http servers!
import EventEmitter from "node:events";
import page from "./src/index.html";
import { type efType, type effectDTO, effect } from "./src/types/effect.types";

// Purely to store sessions based on hash. We don't need to per-say, but important to track in case something goes south, or at the very least debug & track ongoing things
const clientMap = new Map<Bun.ServerWebSocket, (str: string) => void>();
const emitter = new EventEmitter();

const server = Bun.serve({
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
    port: 9011,
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

function wsOnEffect(ws: Bun.ServerWebSocket, effect: string) {
    ws.send(JSON.stringify({
        effect
    } as effectDTO));
}

console.log("HTTP & WS started!", server.url, server.port, wsServer.port);